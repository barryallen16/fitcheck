import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storage from '../services/storageService';
import lm from '../services/lmStudioService';
import { uid, todayStr, getMaxOutfits, getUnusedCombinations } from '../utils/helpers';
import { persistImage, deleteImage } from '../services/imageStorage';

const Ctx = createContext();

function newPersona(name = 'Default') {
  return {
    id: uid(),
    name,
    gender: null,
    wardrobe: [],
    outfits: [],
    createdAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }) {
  const [personas, setPersonas] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [serverUrl, _setUrl] = useState('https://barryallen16-fitcheck.hf.space');
  const [serverOk, setServerOk] = useState(false);
  const [modelName, setModelName] = useState(null);
  const [booting, setBooting] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(true);

  const active = personas.find((p) => p.id === activeId) || personas[0] || null;

  useEffect(() => { boot(); }, []);

  async function boot() {
    const [saved, actId, url, onb] = await Promise.all([
      storage.loadPersonas(), storage.loadActive(), storage.loadServer(), storage.loadOnboarding(),
    ]);
    let ps = saved;
    if (!ps.length) ps = [newPersona()];
    setPersonas(ps);
    setActiveId(actId && ps.find((p) => p.id === actId) ? actId : ps[0].id);
    if (url) { _setUrl(url); lm.setUrl(url); }
    setOnboardingDone(Boolean(onb));
    const c = await lm.checkConnection();
    setServerOk(c.ok); if (c.ok) setModelName(c.model);
    setBooting(false);
  }

  function _update(fn) {
    setPersonas((prev) => {
      const next = prev.map((p) => p.id === activeId ? fn(p) : p);
      storage.savePersonas(next);
      return next;
    });
  }

  const setServerUrl = useCallback(async (url) => {
    _setUrl(url); lm.setUrl(url);
    await storage.saveServer(url);
    const c = await lm.checkConnection();
    setServerOk(c.ok); setModelName(c.ok ? c.model : null);
    return c;
  }, []);

  const ping = useCallback(async () => {
    const c = await lm.checkConnection();
    setServerOk(c.ok); if (c.ok) setModelName(c.model);
    return c;
  }, []);

  const setGender = useCallback((gender) => {
    _update((p) => ({ ...p, gender }));
  }, [activeId]);

  const completeOnboarding = useCallback(async ({ gender } = {}) => {
    if (gender) {
      _update((p) => ({ ...p, gender }));
    }
    await storage.saveOnboarding(true);
    await storage.saveTermsAccepted(new Date().toISOString());
    setOnboardingDone(true);
  }, [activeId]);

  const addGarment = useCallback(async (data) => {
    const imageUri = await persistImage(data.imageUri);
    const g = { id: uid(), ...data, imageUri, addedAt: new Date().toISOString() };
    _update((p) => ({ ...p, wardrobe: [...p.wardrobe, g] }));
    return g;
  }, [activeId]);

  const removeGarment = useCallback((id) => {
    _update((p) => {
      const g = p.wardrobe.find((x) => x.id === id);
      if (g) deleteImage(g.imageUri);
      return { ...p, wardrobe: p.wardrobe.filter((x) => x.id !== id) };
    });
  }, [activeId]);

  const clearWardrobe = useCallback(() => {
    _update((p) => {
      p.wardrobe.forEach((g) => deleteImage(g.imageUri));
      return { ...p, wardrobe: [] };
    });
  }, [activeId]);

  const resetAllData = useCallback(async () => {
    // Purge images from filesystem
    personas.forEach((p) => {
      (p.wardrobe || []).forEach((g) => deleteImage(g.imageUri));
    });
    await storage.resetAll();
    const fresh = [newPersona()];
    setPersonas(fresh);
    setActiveId(fresh[0].id);
    setOnboardingDone(false);
  }, [personas]);

  const addOutfit = useCallback((data) => {
    const o = {
      id: uid(), topId: data.topId || null, bottomId: data.bottomId || null,
      topLabel: data.topLabel, bottomLabel: data.bottomLabel,
      colorLogic: data.colorLogic, silhouetteLogic: data.silhouetteLogic,
      weather: data.weather, weatherCity: data.weatherCity || '',
      score: data.score || null, probability: data.probability || null, rationale: data.rationale || null,
      createdAt: new Date().toISOString(), status: 'unworn', wornDate: null,
    };
    _update((p) => ({ ...p, outfits: [...p.outfits, o] }));
    return o;
  }, [activeId]);

  const wearOutfit = useCallback((id, date) => {
    _update((p) => ({
      ...p, outfits: p.outfits.map((o) => o.id === id ? { ...o, status: 'worn', wornDate: date || todayStr() } : o),
    }));
  }, [activeId]);

  const unwearOutfit = useCallback((id) => {
    _update((p) => ({
      ...p, outfits: p.outfits.map((o) => o.id === id ? { ...o, status: 'unworn', wornDate: null } : o),
    }));
  }, [activeId]);

  const deleteOutfit = useCallback((id) => {
    _update((p) => ({ ...p, outfits: p.outfits.filter((x) => x.id !== id) }));
  }, [activeId]);

  const wardrobe = active?.wardrobe || [];
  const outfits = active?.outfits || [];
  const gender = active?.gender || null;

  const isExhausted = useCallback(() => {
    return getUnusedCombinations(wardrobe, outfits).length === 0 && getMaxOutfits(wardrobe) > 0;
  }, [wardrobe, outfits]);

  const outfitsForDate = useCallback((dateStr) => {
    return outfits.filter((o) => o.status === 'worn' && o.wornDate === dateStr);
  }, [outfits]);

  const restoreFromBackup = useCallback(async (data) => {
    if (data?.personas?.length) {
      setPersonas(data.personas);
      await storage.savePersonas(data.personas);
    }
    if (data?.activeId) {
      setActiveId(data.activeId);
      await storage.saveActive(data.activeId);
    }
    if (data?.serverUrl) {
      _setUrl(data.serverUrl);
      lm.setUrl(data.serverUrl);
      await storage.saveServer(data.serverUrl);
      const c = await lm.checkConnection();
      setServerOk(c.ok);
      setModelName(c.ok ? c.model : null);
    }
  }, []);

  return (
    <Ctx.Provider value={{
      personas, active, activeId,
      serverUrl, serverOk, modelName, booting, setServerUrl, ping,
      onboardingDone, completeOnboarding, resetAllData,
      wardrobe, outfits, gender,
      setGender, addGarment, removeGarment, clearWardrobe,
      addOutfit, wearOutfit, unwearOutfit, deleteOutfit,
      isExhausted, outfitsForDate, restoreFromBackup,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp outside provider');
  return c;
};
