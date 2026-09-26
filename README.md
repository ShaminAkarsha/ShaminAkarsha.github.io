# Portfolio

A mobile-responsive personal portfolio built with React, Vite and Three.js
(via react-three-fiber and drei).

## Edit your content

Everything on the page comes from **`src/data.js`**: your name, links, about text,
interests, education, skills, projects, research and achievements. Edit that one
file; no other code changes are needed.

- Résumé: put `resume.pdf` in `public/` (or point `resumeUrl` at a link).
- Photo: put an image in `public/` and set `photo: 'me.jpg'`.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Deploy

The build is plain static files in `dist/` with relative paths, so it works on any
static host.

- **GitHub Pages**: push to a repo's `main` branch, then in Settings > Pages set
  Source to "GitHub Actions". `.github/workflows/deploy.yml` does the rest.
- **Vercel / Netlify**: import the repo. Build command `npm run build`,
  output directory `dist`.
- **Azure Static Web Apps** (later): app location `/`, output location `dist`.

## What's 3D

- Hero: a distorted, glowing core with a wireframe shell, orbit rings,
  floating shapes and a particle field that follow the pointer.
- Cards tilt in 3D toward the pointer with a moving highlight.
- The 3D scene loads after the text, uses fewer particles and lower resolution on
  phones, stays still for visitors who prefer reduced motion, and is skipped
  entirely on devices without WebGL.
