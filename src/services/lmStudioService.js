import * as ImageManipulator from 'expo-image-manipulator';
import {
  extractJSON,
  isTop, isBottom, isFullBody,
  categorizeGarments,
  getUnusedCombinations,
} from '../utils/helpers';

const DEFAULT_URL = 'https://barryallen16-fitcheck.hf.space';

class LMStudioService {
  constructor() {
    this.baseUrl = DEFAULT_URL;
    this.connected = false;
    this.modelId = null;
  }

  setUrl(url) { this.baseUrl = url.replace(/\/+$/, ''); this.connected = false; this.modelId = null; }

  async checkConnection() {
    try {
      const isCloud = this.baseUrl.includes('hf.space');
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 8000);

      // Hugging Face Space: verify via live Task B endpoint
      if (isCloud) {
        const testRes = await fetch(`${this.baseUrl}/evaluate-compatibility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anchor: 'ping', candidate: 'pong' }),
          signal: c.signal,
        });
        clearTimeout(t);
        if (testRes.ok) {
          this.connected = true;
          this.modelId = 'barryallen16/fitcheck-qwen3vl-2b';
          return { ok: true, model: this.modelId, modelCount: 1 };
        }
        this.connected = false;
        return { ok: false, error: `Cloud API returned status ${testRes.status}` };
      }

      // Local LM Studio / standard OpenAI endpoint
      const r = await fetch(`${this.baseUrl}/v1/models`, { signal: c.signal });
      clearTimeout(t);
      if (!r.ok) { this.connected = false; return { ok: false, error: `Status ${r.status}` }; }

      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        // Returned HTML (e.g. Gradio SPA) - test fallback POST endpoint
        const testRes = await fetch(`${this.baseUrl}/evaluate-compatibility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anchor: 'ping', candidate: 'pong' }),
        }).catch(() => null);

        if (testRes && testRes.ok) {
          this.connected = true;
          this.modelId = 'barryallen16/fitcheck-qwen3vl-2b';
          return { ok: true, model: this.modelId, modelCount: 1 };
        }

        this.connected = false;
        return { ok: false, error: 'Endpoint returned HTML instead of JSON' };
      }

      const b = await r.json();
      const m = b?.data ?? [];
      if (m.length > 0) this.modelId = m[0].id;
      this.connected = true;
      return { ok: true, model: this.modelId, modelCount: m.length };
    } catch (e) {
      this.connected = false;
      return { ok: false, error: e.name === 'AbortError' ? 'Timeout' : e.message };
    }
  }

  // ── Compatibility evaluation (Task B fine-tuned model) ──
  async evaluateCompatibility(anchor, candidate) {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 20000);
      const res = await fetch(`${this.baseUrl}/evaluate-compatibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anchor, candidate }),
        signal: c.signal,
      });
      clearTimeout(t);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('evaluateCompatibility error:', e);
    }
    return await this._evaluateCompatibilityFallback(anchor, candidate);
  }

  async _evaluateCompatibilityFallback(anchor, candidate) {
    const prompt = `You are a fashion compatibility judge for Indian fashion (ethnic, western, and fusion wear).\nYou are given two clothing items: an ANCHOR and a CANDIDATE.\nDecide whether the CANDIDATE is a good pairing to complete an outfit with the ANCHOR.\n\nRespond ONLY in this JSON format, nothing else:\n{\n  "compatible": true,\n  "score": 4,\n  "reason": "<one sentence, under 20 words>"\n}\n\nANCHOR: ${anchor}\nCANDIDATE: ${candidate}`;
    const payload = {
      model: this.modelId || 'default',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.0,
      max_tokens: 120,
    };
    try {
      const raw = await this._postSafe('/v1/chat/completions', payload);
      const text = raw?.choices?.[0]?.message?.content ?? '';
      const obj = extractJSON(text);
      if (obj) {
        const score = Number(obj.score) || 4.0;
        const compatible = obj.compatible !== false;
        return {
          compatible,
          score,
          probability: compatible ? Math.min(0.98, Math.max(0.6, score / 5.0)) : 0.3,
          rationale: obj.reason || obj.rationale || 'Complementary pairing.',
        };
      }
    } catch {}
    return {
      compatible: true,
      score: 4.0,
      probability: 0.8,
      rationale: 'Complementary pairing for daily wear.',
    };
  }

  // ── Vision analysis (Task A fine-tuned model + fallback) ──
  async analyzeGarment(imageUri) {
    await this._ensureConnected();
    let base64;
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 336 } }],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      base64 = manipulatedImage.base64;
    } catch (e) { throw new Error(`Cannot process or read image: ${e.message}`); }

    // Try dedicated Task A endpoint first
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 35000);
      const res = await fetch(`${this.baseUrl}/analyze-garment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: `data:image/jpeg;base64,${base64}` }),
        signal: c.signal,
      });
      clearTimeout(t);
      if (res.ok) {
        const d = await res.json();
        if (d.analyzed_garment) {
          const desc = d.analyzed_garment.trim();
          const firstSentence = desc.split('.')[0].trim();
          const summary = firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
          const cat = d.category ? (d.category.charAt(0).toUpperCase() + d.category.slice(1).toLowerCase()) : 'Top';
          return {
            summary: summary || 'Garment Item',
            analyzed_garment: desc,
            category: cat,
          };
        }
      }
    } catch {}

    const payload = {
      model: this.modelId || 'default',
      messages: [
        {
          role: 'system',
          content: `You are an expert fashion archivist. Analyze the main garment in the provided image and output ONLY a valid, raw JSON object. Do not include markdown formatting, code blocks, or conversational text.

Construct the JSON exactly according to this schema:
1. "summary": A 3 to 5 word descriptive title.
2. "analyzed_garment": A single paragraph describing: colors, fabric, pattern, silhouette, neckline/sleeves, embellishments.
3. "category": Exactly one of: Kurti, Lehenga, Dupatta, Palazzo, Churidar, Salwar, Saree, Sherwani, Anarkali, Dress, Gown, Skirt, Jeans, Pants, Blazer, Jacket, Top, Shirt.

Output ONLY: {"summary":"...","analyzed_garment":"...","category":"..."}`
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
            { type: 'text', text: 'Analyze the main garment. Output ONLY raw JSON.' },
          ],
        },
      ],
      temperature: 0.1, max_tokens: 512, stream: false,
    };

    const raw = await this._post('/v1/chat/completions', payload);
    const text = raw?.choices?.[0]?.message?.content ?? '';
    if (!text) throw new Error('Empty response from model.');
    return this._parseGarment(text);
  }

  // ── Outfit Recommendation (Slot Pairing + Fine-Tuned Task B Scoring) ──
  async getRecommendation(weatherStr, wardrobe, baseGarmentId, existingOutfits = []) {
    await this._ensureConnected();

    const { tops, bottoms, fullBody } = categorizeGarments(wardrobe);
    const baseGarment = baseGarmentId ? wardrobe.find((g) => g.id === baseGarmentId) : null;

    // Handle full-body garment (Saree, Dress, Gown)
    if (baseGarment && isFullBody(baseGarment.category)) {
      return {
        top_label: baseGarment.summary,
        bottom_label: 'N/A',
        colorLogic: 'Standalone statement piece suited for the occasion.',
        silhouetteLogic: 'Graceful single-piece silhouette tailored for comfort and elegance.',
        score: 5.0,
        probability: 0.95,
        rationale: 'Complete full-body garment.',
        compatibility: { compatible: true, score: 5.0, probability: 0.95, rationale: 'Complete full-body garment.' },
        _topGarment: baseGarment,
        _bottomGarment: null,
      };
    }

    // Build candidate pairs
    let candidates = [];

    if (baseGarment) {
      if (isTop(baseGarment.category)) {
        candidates = bottoms
          .filter((b) => b.id !== baseGarment.id)
          .map((b) => ({ top: baseGarment, bottom: b }));
      } else if (isBottom(baseGarment.category)) {
        candidates = tops
          .filter((t) => t.id !== baseGarment.id)
          .map((t) => ({ top: t, bottom: baseGarment }));
      }
    } else {
      // Find unused pairs first to avoid repeats
      candidates = getUnusedCombinations(wardrobe, existingOutfits);
      if (candidates.length === 0) {
        // All combos used: fall back to all valid top x bottom combinations
        for (const t of tops) {
          for (const b of bottoms) {
            candidates.push({ top: t, bottom: b });
          }
        }
      }
    }

    // If no pairs can be formed, check for full-body garments
    if (candidates.length === 0) {
      if (fullBody.length > 0) {
        const unusedFull = fullBody.filter((f) => !existingOutfits.some((o) => o.topId === f.id));
        const pick = unusedFull.length > 0 ? unusedFull[0] : fullBody[0];
        return {
          top_label: pick.summary,
          bottom_label: 'N/A',
          colorLogic: 'Standalone statement piece suited for the occasion.',
          silhouetteLogic: 'Graceful single-piece silhouette tailored for comfort and elegance.',
          score: 5.0,
          probability: 0.95,
          rationale: 'Complete full-body garment.',
          compatibility: { compatible: true, score: 5.0, probability: 0.95, rationale: 'Complete full-body garment.' },
          _topGarment: pick,
          _bottomGarment: null,
        };
      }
      throw new Error('Need at least 1 top and 1 bottom (or a dress/saree) in your wardrobe.');
    }

    // Shuffle candidates so the user gets varied combinations across sessions
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    // Evaluate candidate pair(s) with fine-tuned Task B model
    let bestResult = null;
    let highestScore = -1;

    // Check up to 2 candidate pairs using Task B judge
    const pairsToTest = shuffled.slice(0, 2);

    for (const pair of pairsToTest) {
      const anchor = `${pair.top.summary}: ${pair.top.analyzed_garment || pair.top.category}`;
      const candidate = `${pair.bottom.summary}: ${pair.bottom.analyzed_garment || pair.bottom.category}`;

      const comp = await this.evaluateCompatibility(anchor, candidate);
      const score = comp?.score ?? 4.0;
      const rationale = comp?.rationale || 'Complementary colors and balanced proportions.';

      const result = {
        top_label: pair.top.summary,
        bottom_label: pair.bottom.summary,
        colorLogic: rationale,
        silhouetteLogic: 'Balanced proportions suited for daily comfort.',
        score,
        probability: comp?.probability ?? 0.85,
        rationale,
        compatibility: comp || { compatible: true, score, probability: 0.85, rationale },
        _topGarment: pair.top,
        _bottomGarment: pair.bottom,
      };

      if (!bestResult || score > highestScore) {
        bestResult = result;
        highestScore = score;
      }

      // If the first candidate scores high (>= 4.0), take it immediately to save time
      if (score >= 4.0) break;
    }

    return bestResult;
  }

  // ── Internals ─────────────────────────────────────────
  async _ensureConnected() {
    if (this.connected) return;
    const r = await this.checkConnection();
    if (!r.ok) throw new Error(`LM Studio not reachable: ${r.error}`);
  }

  async _post(path, body) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 180000);
    try {
      const r = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: c.signal,
      });
      clearTimeout(t);
      if (!r.ok) { let e = ''; try { e = await r.text(); } catch {} throw new Error(`LM Studio ${r.status}: ${e.substring(0, 300)}`); }
      return await r.json();
    } catch (e) { clearTimeout(t); if (e.name === 'AbortError') throw new Error('Timeout (3 min).'); throw e; }
  }

  // Same as _post but won't throw - returns null on failure
  async _postSafe(path, body) {
    try { return await this._post(path, body); }
    catch { return null; }
  }

  _parseGarment(text) {
    const obj = extractJSON(text);
    if (!obj) throw new Error(`No JSON:\n${text.substring(0, 400)}`);
    if (!obj.summary) throw new Error('Missing "summary".');
    if (!obj.analyzed_garment) throw new Error('Missing "analyzed_garment".');
    if (!obj.category) throw new Error('Missing "category".');
    const CATS = ['Kurti','Lehenga','Dupatta','Palazzo','Churidar','Salwar','Saree','Sherwani','Anarkali','Dress','Gown','Skirt','Jeans','Pants','Blazer','Jacket','Top','Shirt','Bottom','Trousers'];
    const m = CATS.find((c) => c.toLowerCase() === obj.category.toLowerCase());
    if (m) obj.category = m;
    if (obj.category.toLowerCase() === 'bottom') obj.category = 'Pants';
    return { summary: obj.summary.trim(), analyzed_garment: obj.analyzed_garment.trim(), category: obj.category.trim() };
  }
}

export default new LMStudioService();