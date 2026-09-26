import { createContext, useContext, useEffect, useState } from 'react';
import * as defaults from './data.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, hasBackend, SECTIONS } from './lib/config.js';

const CACHE_KEY = 'portfolio-content-v1';
const FALLBACK = Object.fromEntries(SECTIONS.map((k) => [k, defaults[k]]));

const ContentContext = createContext(FALLBACK);

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(rows) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    /* storage unavailable: nothing to do */
  }
}

// Sections missing from the database keep their src/data.js values.
export function mergeContent(rows) {
  return { ...FALLBACK, ...(rows || {}) };
}

// Reads every section with one plain REST call, without loading the Supabase client.
export async function fetchContent(signal) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=key,value`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    signal,
  });
  if (!res.ok) throw new Error(`Content request failed (${res.status})`);
  const list = await res.json();
  return Object.fromEntries(list.filter((r) => SECTIONS.includes(r.key)).map((r) => [r.key, r.value]));
}

export function clearContentCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function ContentProvider({ children }) {
  const cached = hasBackend ? readCache() : null;
  const [content, setContent] = useState(() => mergeContent(cached));
  // Without a cached copy, wait briefly for the database so placeholder text doesn't flash.
  const [ready, setReady] = useState(!hasBackend || Boolean(cached));

  useEffect(() => {
    if (!hasBackend) return;
    const ctrl = new AbortController();
    const giveUp = setTimeout(() => setReady(true), 2500);
    fetchContent(ctrl.signal)
      .then((rows) => {
        writeCache(rows);
        setContent(mergeContent(rows));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.warn('Using built-in content:', err.message);
      })
      .finally(() => {
        clearTimeout(giveUp);
        setReady(true);
      });
    return () => {
      clearTimeout(giveUp);
      ctrl.abort();
    };
  }, []);

  if (!ready) return <div className="page-loading" aria-label="Loading" />;
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
