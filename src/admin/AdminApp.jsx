import { useCallback, useEffect, useMemo, useState } from 'react';
import * as defaults from '../data.js';
import { hasBackend, SECTIONS } from '../lib/config.js';
import { supabase } from '../lib/supabase.js';
import { clearContentCache } from '../content.jsx';
import { ProfileEditor, AboutEditor, ProjectsEditor, ResearchEditor, AchievementsEditor } from './editors.jsx';
import './admin.css';

const EDITORS = {
  profile: ['Profile', ProfileEditor],
  about: ['About', AboutEditor],
  projects: ['Projects', ProjectsEditor],
  research: ['Research', ResearchEditor],
  achievements: ['Achievements', AchievementsEditor],
};

const go = (path) => {
  window.location.hash = path;
};

function Shell({ children, wide }) {
  useEffect(() => {
    document.title = 'Admin · Portfolio';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
  return (
    <div className="adm">
      <div className={`adm-shell ${wide ? 'adm-shell--wide' : ''}`}>{children}</div>
    </div>
  );
}

function SetupNeeded() {
  return (
    <Shell>
      <div className="adm-card">
        <h1>Database not connected</h1>
        <p>
          This build has no Supabase settings. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{' '}
          (see the README), then rebuild. Until then the site shows the content from <code>src/data.js</code>.
        </p>
        <a className="adm-link" href="#top">← Back to the site</a>
      </div>
    </Shell>
  );
}

function useSession() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

function Login({ session }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) go('/admin');
  }, [session]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError(err.message === 'Invalid login credentials' ? 'Wrong email or password.' : err.message);
  };

  return (
    <Shell>
      <form className="adm-card adm-login" onSubmit={submit}>
        <span className="brand-mark" aria-hidden="true" />
        <h1>Sign in</h1>
        <p className="adm-muted">Manage the content on your portfolio.</p>
        <label>
          Email
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <a className="adm-link" href="#top">← Back to the site</a>
      </form>
    </Shell>
  );
}

function Dashboard({ session }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [saved, setSaved] = useState(null); // what is in the database, per section
  const [drafts, setDrafts] = useState(null);
  const [tab, setTab] = useState('profile');
  const [status, setStatus] = useState({});
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoadError('');
    const [adminRes, contentRes] = await Promise.all([
      supabase.from('site_admins').select('user_id').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('site_content').select('key,value,updated_at'),
    ]);
    if (contentRes.error) {
      setLoadError(contentRes.error.message);
      return;
    }
    setIsAdmin(Boolean(adminRes.data));
    const rows = Object.fromEntries(contentRes.data.map((r) => [r.key, r]));
    setSaved(rows);
    setDrafts(Object.fromEntries(SECTIONS.map((k) => [k, structuredClone(rows[k]?.value ?? defaults[k])])));
  }, [session.user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!drafts || !saved) return {};
    return Object.fromEntries(
      SECTIONS.map((k) => [k, JSON.stringify(drafts[k]) !== JSON.stringify(saved[k]?.value ?? defaults[k]) || !saved[k]])
    );
  }, [drafts, saved]);

  useEffect(() => {
    const unsaved = Object.values(dirty).some(Boolean);
    const warn = (e) => {
      if (unsaved) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async (key) => {
    setStatus((s) => ({ ...s, [key]: { busy: true } }));
    const { data, error } = await supabase
      .from('site_content')
      .upsert({ key, value: drafts[key], updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) {
      setStatus((s) => ({ ...s, [key]: { error: error.message } }));
      return;
    }
    clearContentCache();
    setSaved((r) => ({ ...r, [key]: data }));
    setStatus((s) => ({ ...s, [key]: { ok: true } }));
  };

  const discard = (key) => {
    if (!window.confirm('Discard your unsaved changes to this section?')) return;
    setDrafts((d) => ({ ...d, [key]: structuredClone(saved[key]?.value ?? defaults[key]) }));
    setStatus((s) => ({ ...s, [key]: {} }));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    go('/login');
  };

  if (loadError) {
    return (
      <Shell>
        <div className="adm-card">
          <h1>Couldn&rsquo;t load content</h1>
          <p className="adm-error">{loadError}</p>
          <p className="adm-muted">If the table is missing, run supabase/schema.sql in the Supabase SQL Editor.</p>
          <button className="btn" onClick={load}>Try again</button>
        </div>
      </Shell>
    );
  }
  if (!drafts) return <div className="page-loading" aria-label="Loading" />;

  const [title, Editor] = EDITORS[tab];
  const st = status[tab] || {};

  return (
    <Shell wide>
      <header className="adm-top">
        <div>
          <h1>Content manager</h1>
          <p className="adm-muted">Signed in as {session.user.email}</p>
        </div>
        <div className="adm-top-actions">
          <a className="btn btn--ghost btn--small" href="#top" target="_blank" rel="noreferrer">View site ↗</a>
          <button className="btn btn--ghost btn--small" onClick={signOut}>Sign out</button>
        </div>
      </header>

      {!isAdmin && (
        <div className="adm-banner" role="alert">
          This account can sign in but isn&rsquo;t allowed to edit yet, so saving will fail. Add it to the{' '}
          <code>site_admins</code> table (last step of the setup in the README).
        </div>
      )}

      <nav className="adm-tabs" aria-label="Sections">
        {SECTIONS.map((k) => (
          <button key={k} className={k === tab ? 'is-active' : ''} onClick={() => setTab(k)} aria-current={k === tab}>
            {EDITORS[k][0]}
            {dirty[k] && <span className="adm-dot" title="Unsaved changes" />}
          </button>
        ))}
      </nav>

      <section className="adm-card adm-editor">
        <div className="adm-editor-head">
          <h2>{title}</h2>
          <span className="adm-muted small">
            {saved[tab]
              ? `Last saved ${new Date(saved[tab].updated_at).toLocaleString()}`
              : 'Not in the database yet: showing the built-in content. Save to publish it.'}
          </span>
        </div>
        <Editor value={drafts[tab]} onChange={(v) => setDrafts((d) => ({ ...d, [tab]: v }))} />
      </section>

      <div className="adm-savebar">
        <span className={`small ${st.error ? 'adm-error' : 'adm-muted'}`} role="status">
          {st.error
            ? `Not saved: ${st.error}`
            : st.ok && !dirty[tab]
              ? 'Saved. Changes are live on the site.'
              : dirty[tab]
                ? 'Unsaved changes'
                : 'Up to date'}
        </span>
        <div className="adm-top-actions">
          <button className="btn btn--ghost btn--small" onClick={() => discard(tab)} disabled={!dirty[tab] || !saved[tab]}>
            Discard
          </button>
          <button className="btn btn--small" onClick={() => save(tab)} disabled={st.busy || !dirty[tab]}>
            {st.busy ? 'Saving…' : `Save ${title.toLowerCase()}`}
          </button>
        </div>
      </div>
    </Shell>
  );
}

export default function AdminApp({ route }) {
  if (!hasBackend) return <SetupNeeded />;
  return <AdminRoutes route={route} />;
}

function AdminRoutes({ route }) {
  const session = useSession();
  useEffect(() => {
    if (session === null && route.startsWith('/admin')) go('/login');
  }, [session, route]);

  if (session === undefined) return <div className="page-loading" aria-label="Loading" />;
  if (route.startsWith('/login') || !session) return <Login session={session} />;
  return <Dashboard session={session} />;
}
