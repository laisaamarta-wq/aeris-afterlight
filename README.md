# AERIS° — Drop 01 · Afterlight

Production source for the AERIS° storefront: a futuristic fashion e-commerce site with
editorial photography, a three.js "Explore the piece" viewer, shop, product, collection,
journal, about, stores, bag and checkout.

## Stack

- Plain HTML, CSS and ES modules. No framework, no build step.
- three.js 0.160 (via jsDelivr import map) for the 3D viewer and GLB models.
- Fonts: Antonio, Geist, Geist Mono (Google Fonts).
- Client-side routing with the History API. `vercel.json` rewrites every path without a
  file extension (`/shop`, `/product/meridian-shell`, …) to `index.html`.

## Layout

```
public/
  index.html        app shell
  css/site.css      all styles
  js/               app.js (router, nav, bag), pages.js, ui.js, commerce.js, store.js, viewer3d.js
  data/catalog.js   products, collections, journal, stores (replace with real data here)
  assets.js         image dimensions / variants
  img/              WebP photography (full size + -sm variants)
  models/           GLB garments for the 3D viewer
vercel.json         output directory, SPA rewrites, security + cache headers
```

## Deploy

Vercel project linked to this repository. Every push to `main` deploys to production;
other branches get preview deployments. No environment variables are required.

## Local preview

```
npx serve public -s
```
