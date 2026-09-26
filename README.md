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

The project URL and public anon key are in `.env.production`, which the build
reads. The database tables and security rules come from `supabase/schema.sql`
(already applied to the connected project).

To give yourself edit access (one time):

1. Supabase dashboard > **Authentication > Users > Add user > Create new user**:
   your email and a strong password, with "Auto Confirm User" ticked.
2. **SQL Editor**: run this with your email filled in:
   ```sql
   insert into public.site_admins (user_id) select id from auth.users where email = 'you@example.com';
   ```
3. **Authentication > Sign In / Providers**: turn off "Allow new users to sign up".
4. Open `https://<your-site>/#/login`, sign in, and save each section once to move
   it into the database.

Using a different Supabase project: run `supabase/schema.sql` in its SQL Editor,
then put its Project URL and anon key in `.env.production`. For local development,
`npm run dev` uses `.env.local` if present (copy `.env.example`).

Notes:
- The anon key is meant to be public; the row-level security policies are what
  protect your data.
- Free Supabase projects pause after a week without activity. If that happens the
  site keeps working from `src/data.js`; restore the project from the Supabase
  dashboard to get your edits back.
- Password reset: use Authentication > Users in the Supabase dashboard.
- Moving to Azure later: nothing changes; the Supabase settings are part of the build.

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
