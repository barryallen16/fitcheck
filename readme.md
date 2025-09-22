### Women's kurti 
prompt used for generating those kurti dataset is as follows:

```
A product photograph of a simple black cotton kurti with subtle tonal embroidery on the neckline and sleeves. The kurti is presented floating against a clean, pure white background with a soft drop shadow. The image is a straight-on, full-length shot, captured in a studio with soft, even lighting. Minimalist and elegant.
```
---
### Women's Jeans Prompt

```
A product photograph of simple Women's [Color] denim high-rise curvy fit jeans with no embellishments. The jeans are presented floating against a clean, pure white background with a soft drop shadow. The image is a straight-on, full-length shot, captured in a studio with soft, even lighting. Minimalist and elegant.
```
---
### Men's Jeans prompt
```
A product photograph of simple Men's [Color] denim relaxed fit jeans with no embellishments. The jeans are presented floating against a clean, pure white background with a soft drop shadow. The image is a straight-on, full-length shot, captured in a studio with soft, even lighting. Minimalist and elegant.
```
### Mens's tops
```
Studio product photograph of a [Item Name] — [Description/Cultural Note]. The garment is presented floating gracefully against a seamless, pure white infinity background, casting a soft, natural drop shadow beneath to imply depth. Shot straight-on in full-length view, perfectly centered and symmetrical, with fabric texture, stitching, and design details (e.g., embroidery, collar style, buttons, drape) subtly visible to convey premium quality. Lit with soft, diffused studio lighting from multiple angles to highlight silhouette and material without harsh shadows. No models, mannequins, or props — minimalist, clean, and elegant aesthetic. High-resolution, commercial-grade product photography style, suitable for e-commerce or luxury brand catalog. Ultra-detailed, photorealistic, 8K.

Example context for AI: If item is “White Kurta”, emphasize traditional cotton weave and festival elegance. If “Organza Jacket”, highlight sheer texture and layering potential. If “Blue Sherwani”, focus on embroidery and regal drape.
```

### new womens kurti prompt
```
    Hyper-realistic, studio-quality product photograph of a women’s simple [colour] cotton kurti with subtle tonal embroidery in near-[colour] thread along the neckline and sleeves — delicate chain stitch or shadow-work, visible only by texture, no contrast. The kurti floats mid-air, front-facing, perfectly centered, against a seamless pure [colour] (RGB 255,255,255) background with a soft, feathered drop shadow beneath. Styled on an invisible curvy-fit form: gently shaped at bust and waist, A-line silhouette falling to mid-thigh, sleeves draped naturally. No mannequin, no hanger, no neck, no shoulders, no head, no torso — only the fabric and its shape. Shot straight-on at mid-torso height with an 85mm-equivalent lens — full-length, centered, zero distortion. Lit with soft, even 5500K daylight-balanced light from 45° left/right softboxes + frontal fill — no glare, true white preserved, cotton weave and embroidery texture razor-sharp. Minimalist, elegant, no props, logos, text, watermark, jewelry, floor, patterned background, studio equipment, lighting gear, or human elements. --style photographic --ar 3:4 --no mannequin, hanger, neck, head, torso, shoulders, stand, hook, clothing rack, pole, wire, shadow cast by object, studio, lights, tripod, umbrella, background pattern, model, person
```
---
## New prompts
### Women's and Men's tops and bottom folder images prompt
```
Ultra-realistic studio product photograph of a [gender like men’s/ women's] [clothing name like "olive green kurta", "black pajama"] — presented in minimalist, clean, elegant isolation. Garment artfully arranged flat or softly draped to naturally reveal its silhouette, fabric drape, texture, weave, and any embroidery or detailing — without distortion or artificial posing. No models. No mannequins. No accessories. No props. No logos. No text. Pure, seamless, infinity white background (#FFFFFF).

Lighting: Professionally lit with soft, multi-directional diffused studio lights — balanced to sculpt form, highlight material depth, and accentuate craftsmanship — while maintaining zero harsh shadows, zero specular glare, and zero color cast. Shadows, if any, are feather-soft and naturally integrated.

Focus: Tack-sharp detail on fabric grain, stitching, embellishments, and structural lines — rendered with photorealistic precision. Composition is calm, centered, and editorial-grade — optimized for luxury e-commerce, lookbooks, or catalog use.

Style: Quiet sophistication. Timeless. Neutral. High-fashion product photography aesthetic — think premium ethnic wear brand campaign meets museum textile archive.

Render at 8K resolution, 300 DPI, with true-to-life color accuracy and micro-detail clarity
```

---
### commands for pushing vite project to production
```
bun vite build && git add . && git commit -m "updating website" && git push origin main
cd ..
git subtree split --prefix dataset-website/dist -b dist-branch
git push origin dist-branch:website-prod --force
git branch -D dist-branch
```

### supa base table schema 
```
create table public.outfits (
  id serial not null,
  top text not null,
  bottom text not null,
  gender text not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint outfits_pkey primary key (id)
) TABLESPACE pg_default;
```