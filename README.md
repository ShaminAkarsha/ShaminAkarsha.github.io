# Portfolio

A mobile-responsive personal portfolio built with React, Vite and Three.js
(via react-three-fiber and drei).

## Edit your content

There are two ways, and they work together:

1. **Content manager (recommended).** Sign in at `/#/login` on your site and edit
   your profile, about, projects, research and achievements in the browser. Saving
   publishes the change straight away, with no rebuild. This needs the Supabase
   setup below.
2. **`src/data.js`.** The built-in content. The site uses it for any section that
   isn't in the database yet, and for everything when Supabase isn't set up or
   can't be reached.

- Résumé: put `resume.pdf` in `public/` (or point `resumeUrl` at a link).
- Photo: put an image in `public/` and set `photo: 'me.jpg'`.

## Database and login (Supabase)

GitHub Pages only serves static files, so the database and login are provided by
[Supabase](https://supabase.com) (free tier), called directly from the browser.
Anyone can read the content; only accounts listed in `site_admins` can change it,
enforced by row-level security in the database.

One-time setup:

1. Create a project at [supabase.com](https://supabase.com) (New project; any name,
   pick a region near you, save the database password somewhere safe).
2. **SQL Editor > New query**: paste all of `supabase/schema.sql` and click **Run**.
3. **Authentication > Sign In / Providers**: turn **off** "Allow new users to sign up",
   so nobody else can create an account.
4. **Authentication > Users > Add user > Create new user**: enter your email and a
   strong password, and tick "Auto Confirm User".
5. **SQL Editor**: run the last line of `schema.sql` with your email filled in, to
   make that user an admin:
   ```sql
   insert into public.site_admins (user_id) select id from auth.users where email = 'you@example.com';
   ```
6. **Project Settings > API** (or **Data API**): copy the **Project URL** and the
   **anon public** key. Never use the `service_role` / secret key in this site.
7. On GitHub: repo **Settings > Secrets and variables > Actions > Variables** tab,
   add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with those two values, then
   re-run the deploy workflow (Actions > Deploy to GitHub Pages > Run workflow).
8. Open `https://<your-site>/#/login`, sign in, and save each section once to move
   it into the database.

For local development, copy `.env.example` to `.env.local` and fill in the same two
values.

Notes:
- The anon key is meant to be public; the row-level security policies are what
  protect your data.
- Free Supabase projects pause after a week without activity. If that happens the
  site keeps working from `src/data.js`; restore the project from the Supabase
  dashboard to get your edits back.
- Password reset: use Authentication > Users in the Supabase dashboard.
- Moving to Azure later: the build still needs only the two `VITE_SUPABASE_*`
  variables, so Supabase keeps working from Azure Static Web Apps too.

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
