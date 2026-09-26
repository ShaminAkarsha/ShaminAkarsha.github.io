// Supabase settings come from build-time env vars (see .env.example).
// When they are missing the site runs exactly as before, from src/data.js.
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const hasBackend = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const SECTIONS = ['profile', 'about', 'projects', 'research', 'achievements'];
