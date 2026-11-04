import AsyncStorage from '@react-native-async-storage/async-storage';

const K = {
  PERSONAS: '@fc_personas',
  ACTIVE: '@fc_active_persona',
  SERVER: '@fc_server_url',
  ONBOARDING: '@fc_onboarding_completed',
  TERMS_ACCEPTED: '@fc_terms_accepted_at',
};

export default {
  async savePersonas(p) { try { await AsyncStorage.setItem(K.PERSONAS, JSON.stringify(p)); } catch {} },
  async loadPersonas() { try { const v = await AsyncStorage.getItem(K.PERSONAS); return v ? JSON.parse(v) : []; } catch { return []; } },
  async saveActive(id) { try { await AsyncStorage.setItem(K.ACTIVE, id); } catch {} },
  async loadActive() { try { return await AsyncStorage.getItem(K.ACTIVE); } catch { return null; } },
  async saveServer(url) { try { await AsyncStorage.setItem(K.SERVER, url); } catch {} },
  async loadServer() { try { return await AsyncStorage.getItem(K.SERVER); } catch { return null; } },
  async saveOnboarding(done) { try { await AsyncStorage.setItem(K.ONBOARDING, done ? 'true' : 'false'); } catch {} },
  async loadOnboarding() { try { return (await AsyncStorage.getItem(K.ONBOARDING)) === 'true'; } catch { return false; } },
  async saveTermsAccepted(dateStr) { try { await AsyncStorage.setItem(K.TERMS_ACCEPTED, dateStr || new Date().toISOString()); } catch {} },
  async loadTermsAccepted() { try { return await AsyncStorage.getItem(K.TERMS_ACCEPTED); } catch { return null; } },
  async resetAll() { try { await AsyncStorage.clear(); } catch {} },
};
