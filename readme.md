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

### new womens kurti prompt
```
    Hyper-realistic, studio-quality product photograph of a women’s simple [colour] cotton kurti with subtle tonal embroidery in near-[colour] thread along the neckline and sleeves — delicate chain stitch or shadow-work, visible only by texture, no contrast. The kurti floats mid-air, front-facing, perfectly centered, against a seamless pure [colour] (RGB 255,255,255) background with a soft, feathered drop shadow beneath. Styled on an invisible curvy-fit form: gently shaped at bust and waist, A-line silhouette falling to mid-thigh, sleeves draped naturally. No mannequin, no hanger, no neck, no shoulders, no head, no torso — only the fabric and its shape. Shot straight-on at mid-torso height with an 85mm-equivalent lens — full-length, centered, zero distortion. Lit with soft, even 5500K daylight-balanced light from 45° left/right softboxes + frontal fill — no glare, true white preserved, cotton weave and embroidery texture razor-sharp. Minimalist, elegant, no props, logos, text, watermark, jewelry, floor, patterned background, studio equipment, lighting gear, or human elements. --style photographic --ar 3:4 --no mannequin, hanger, neck, head, torso, shoulders, stand, hook, clothing rack, pole, wire, shadow cast by object, studio, lights, tripod, umbrella, background pattern, model, person
```


### commands for pushing vite project to production
```
git subtree split --prefix dataset-website/dist -b dist-branch
git push origin dist-branch:website-prod --force
git branch -D dist-branch
```