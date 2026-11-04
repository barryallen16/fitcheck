// src/services/backupService.js
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from './storageService';

const IMG_DIR = FileSystem.documentDirectory + 'fitcheck/';

async function ensureDir() {
  try {
    const info = await FileSystem.getInfoAsync(IMG_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
    }
  } catch {}
}

function extractFilename(uri) {
  if (!uri) return null;
  const clean = uri.split('?')[0];
  const parts = clean.split('/');
  return parts[parts.length - 1];
}

export async function exportBackupData({ personas, activeId, serverUrl }) {
  await ensureDir();

  const imageUris = new Set();
  (personas || []).forEach((p) => {
    (p.wardrobe || []).forEach((g) => {
      if (g.imageUri && typeof g.imageUri === 'string' && g.imageUri.startsWith('file://')) {
        imageUris.add(g.imageUri);
      }
    });
  });

  const images = {};
  for (const uri of imageUris) {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const name = extractFilename(uri);
        if (name && base64) {
          images[name] = base64;
        }
      }
    } catch {
      // Continue preserving rest of export
    }
  }

  const tourSeen = await AsyncStorage.getItem('@fitcheck_tour_seen');

  const payload = {
    app: 'FitCheck',
    version: 2,
    exportedAt: new Date().toISOString(),
    config: {
      serverUrl: serverUrl || null,
      activeId: activeId || null,
      tourSeen: tourSeen === 'true',
    },
    personas: personas || [],
    images,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const tempFile = `${FileSystem.cacheDirectory}fitcheck-backup-${dateStr}-${Date.now().toString(36)}.json`;

  await FileSystem.writeAsStringAsync(tempFile, jsonStr, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(tempFile, {
      mimeType: 'application/json',
      dialogTitle: 'Export FitCheck Data Archive',
      UTI: 'public.json',
    });
  }

  return {
    ok: true,
    tempFile,
    personaCount: (personas || []).length,
    garmentCount: (personas || []).reduce((acc, p) => acc + (p.wardrobe || []).length, 0),
    imageCount: Object.keys(images).length,
  };
}

export async function importBackupData() {
  await ensureDir();

  const picker = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', '*/*'],
    copyToCacheDirectory: true,
  });

  if (picker.canceled || !picker.assets || !picker.assets.length) {
    return { canceled: true };
  }

  const asset = picker.assets[0];
  const content = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('The selected file is not a valid JSON archive.');
  }

  if (!parsed || !Array.isArray(parsed.personas)) {
    throw new Error('Invalid archive format. Missing persona data.');
  }

  const restoredMap = {};
  if (parsed.images && typeof parsed.images === 'object') {
    for (const [name, base64Data] of Object.entries(parsed.images)) {
      try {
        const dest = IMG_DIR + name;
        await FileSystem.writeAsStringAsync(dest, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        restoredMap[name] = dest;
      } catch {
        // Continue restoring other images
      }
    }
  }

  const restoredPersonas = parsed.personas.map((p) => {
    const wardrobe = (p.wardrobe || []).map((g) => {
      let imageUri = g.imageUri;
      if (imageUri) {
        const name = extractFilename(imageUri);
        if (restoredMap[name]) {
          imageUri = restoredMap[name];
        } else if (imageUri.startsWith('file://')) {
          imageUri = IMG_DIR + name;
        }
      }
      return { ...g, imageUri };
    });

    return {
      ...p,
      wardrobe,
    };
  });

  await storage.savePersonas(restoredPersonas);
  if (parsed.config?.activeId) {
    await storage.saveActive(parsed.config.activeId);
  }
  if (parsed.config?.serverUrl) {
    await storage.saveServer(parsed.config.serverUrl);
  }
  if (parsed.config?.tourSeen) {
    await AsyncStorage.setItem('@fitcheck_tour_seen', 'true');
  }

  return {
    ok: true,
    data: {
      personas: restoredPersonas,
      activeId: parsed.config?.activeId || restoredPersonas[0]?.id,
      serverUrl: parsed.config?.serverUrl || null,
    },
    personaCount: restoredPersonas.length,
    garmentCount: restoredPersonas.reduce((acc, p) => acc + (p.wardrobe || []).length, 0),
    imageCount: Object.keys(restoredMap).length,
  };
}
