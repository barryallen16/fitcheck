import * as FileSystem from 'expo-file-system';

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export function extractJSON(raw) {
  let s = raw.trim();
  s = s.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function comboKey(topId, bottomId) {
  return `${topId || 'X'}|${bottomId || 'NONE'}`;
}

export const TOP_CATS = [
  'Top', 'Tops', 'T-Shirt', 'Tshirt', 'Tee', 'Shirt', 'Kurti', 'Kurta',
  'Blazer', 'Jacket', 'Coat', 'Outerwear', 'Vest', 'Sweater', 'Hoodie',
  'Sherwani', 'Upper',
];
export const BOTTOM_CATS = [
  'Bottom', 'Bottoms', 'Pants', 'Jeans', 'Trousers', 'Shorts', 'Palazzo',
  'Churidar', 'Salwar', 'Skirt', 'Leggings', 'Joggers', 'Sweatpants',
  'Trackpants', 'Lower', 'Dhoti', 'Lungi',
];
export const FULL_CATS = [
  'Dress', 'Saree', 'Sari', 'Lehenga', 'Anarkali', 'Gown', 'Jumpsuit',
  'Romper', 'Co-ord', 'Coord', 'Set',
];
export const ACCESSORY_CATS = [
  'Dupatta', 'Scarf', 'Shawl', 'Accessory', 'Footwear',
];

export function isTop(cat) {
  if (!cat) return false;
  const c = cat.toLowerCase().trim();
  return TOP_CATS.some((x) => x.toLowerCase() === c);
}

export function isBottom(cat) {
  if (!cat) return false;
  const c = cat.toLowerCase().trim();
  return BOTTOM_CATS.some((x) => x.toLowerCase() === c);
}

export function isFullBody(cat) {
  if (!cat) return false;
  const c = cat.toLowerCase().trim();
  return FULL_CATS.some((x) => x.toLowerCase() === c);
}

export function categorizeGarments(wardrobe) {
  const tops = [];
  const bottoms = [];
  const fullBody = [];

  for (const g of (wardrobe || [])) {
    if (isFullBody(g.category)) {
      fullBody.push(g);
    } else if (isBottom(g.category)) {
      bottoms.push(g);
    } else if (isTop(g.category)) {
      tops.push(g);
    } else {
      // Clue-based fallback for garments tagged with informal names
      const text = `${g.category || ''} ${g.summary || ''} ${g.analyzed_garment || ''}`.toLowerCase();
      if (['pant', 'jean', 'trouser', 'short', 'skirt', 'bottom', 'lower', 'palazzo', 'churidar', 'salwar', 'track', 'jogger', 'cargo', 'dhoti'].some((w) => text.includes(w))) {
        bottoms.push(g);
      } else if (['saree', 'dress', 'anarkali', 'gown', 'lehenga', 'jumpsuit', 'romper'].some((w) => text.includes(w))) {
        fullBody.push(g);
      } else {
        tops.push(g);
      }
    }
  }
  return { tops, bottoms, fullBody };
}

export function getSlot(category) {
  if (isTop(category)) return 'TOP';
  if (isBottom(category)) return 'BOTTOM';
  if (isFullBody(category)) return 'FULL-BODY';
  if (ACCESSORY_CATS.some((x) => x.toLowerCase() === (category || '').toLowerCase().trim())) return 'ACCESSORY';
  return 'OTHER';
}

export function getSlotLabel(cat) {
  if (isTop(cat)) return 'Top';
  if (isBottom(cat)) return 'Bottom';
  if (isFullBody(cat)) return 'Full-body';
  return 'Accessory';
}

export function getUnusedCombinations(wardrobe, outfits) {
  const { tops, bottoms, fullBody } = categorizeGarments(wardrobe);
  const usedKeys = new Set(outfits.map((o) => comboKey(o.topId, o.bottomId)));
  const unused = [];
  for (const t of tops) for (const b of bottoms) {
    if (!usedKeys.has(comboKey(t.id, b.id))) unused.push({ top: t, bottom: b });
  }
  for (const f of fullBody) {
    if (!usedKeys.has(comboKey(f.id, null))) unused.push({ top: f, bottom: null });
  }
  return unused;
}

export function getMaxOutfits(wardrobe) {
  const { tops, bottoms, fullBody } = categorizeGarments(wardrobe);
  return tops.length * bottoms.length + fullBody.length;
}