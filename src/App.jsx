import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ContentProvider, useContent } from './content.jsx';
import { Reveal, TiltCard, SectionHeading, LinkRow } from './components/ui.jsx';

// Loaded separately so the text appears instantly while the 3D code downloads.
const HeroScene = lazy(() => import('./components/HeroScene.jsx'));
// The login and admin pages are only downloaded when someone opens them.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));
// Hidden mini game, only downloaded once someone finds it.
const BugHunt = lazy(() => import('./components/BugHunt.jsx'));

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const LOGO_TAPS = 5;

// Opens the game on the Konami code, or when the logo is tapped 5 times in a row.
function useEasterEgg() {
  const [open, setOpen] = useState(false);
  const taps = useRef({ count: 0, last: 0 });
  useEffect(() => {
    let pos = 0;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    console.log('%c🐞 Psst, developer: try ↑ ↑ ↓ ↓ ← → ← → B A', 'color:#22d3ee;font-weight:bold');
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const onLogoTap = useCallback(() => {
    const now = Date.now();
    const t = taps.current;
    t.count = now - t.last < 600 ? t.count + 1 : 1;
    t.last = now;
    if (t.count >= LOGO_TAPS) {
      t.count = 0;
      setOpen(true);
    }
  }, []);
  return { open, close: useCallback(() => setOpen(false), []), onLogoTap };
}

const NAV = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['research', 'Research'],
  ['achievements', 'Achievements'],
  ['contact', 'Contact'],
];

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

function Nav({ onLogoTap }) {
  const { profile } = useContent();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <a
        href="#top"
        className="brand"
        onClick={() => {
          setOpen(false);
          onLogoTap();
        }}
      >
        <span className="brand-mark" aria-hidden="true" />
        {profile.name}
      </a>
      <button
        className={`menu-btn ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>
      <nav className={`nav-links ${open ? 'is-open' : ''}`}>
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        {profile.resumeUrl && (
          <a className="btn btn--small" href={profile.resumeUrl} target="_blank" rel="noreferrer">
            Résumé
          </a>
        )}
      </nav>
    </header>
  );
}

function Hero() {
  const { profile } = useContent();
  const [show3d, setShow3d] = useState(false);
  useEffect(() => setShow3d(webglAvailable()), []);

  return (
    <section className="hero" id="top">
      <div className="hero-canvas" aria-hidden="true">
        {show3d && (
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        )}
      </div>
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-content">
        <p className="eyebrow">
          <span className="pulse" aria-hidden="true" /> {profile.role}
        </p>
        <h1>
          Hi, I&rsquo;m <span className="gradient-text">{profile.name}</span>.
        </h1>
        <p className="hero-tagline">{profile.tagline}</p>
        <div className="hero-actions">
          <a href="#projects" className="btn">
            View my work
          </a>
          <a href="#contact" className="btn btn--ghost">
            Get in touch
          </a>
        </div>
        <LinkRow links={profile.links} />
      </div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to About">
        <span />
      </a>
    </section>
  );
}

function About() {
  const { profile, about } = useContent();
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHeading index="01" title="About me" subtitle="Professional interests and background" />
        <div className="about-grid">
          <Reveal className="about-text">
            {profile.photo && <img className="avatar" src={profile.photo} alt={profile.name} />}
            {about.paragraphs?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <h3 className="mini-title">Professional interests</h3>
            <ul className="interest-list">
              {about.interests?.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Reveal>
          <div className="about-side">
            <Reveal delay={100}>
              <TiltCard className="card">
                <h3 className="mini-title">Education</h3>
                <ul className="edu-list">
                  {about.education?.map((e) => (
                    <li key={e.degree}>
                      <strong>{e.degree}</strong>
                      <span>{e.school}</span>
                      <span className="muted">
                        {e.period}
                        {e.note ? ` · ${e.note}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </Reveal>
            <Reveal delay={200}>
              <TiltCard className="card">
                <h3 className="mini-title">Skills</h3>
                {Object.entries(about.skills || {}).map(([group, items]) => (
                  <div key={group} className="skill-group">
                    <span className="skill-label">{group}</span>
                    <div className="tags">
                      {items.map((s) => (
                        <span key={s} className="tag">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  const { projects } = useContent();
  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeading index="02" title="Projects" subtitle="Current work and things I have built" />
        <div className="project-grid">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 100}>
              <TiltCard className="card project-card">
                <div className="project-top">
                  <span className="project-num">{String(i + 1).padStart(2, '0')}</span>
                  {p.status && (
                    <span className={`status ${p.status === 'Current' ? 'status--live' : ''}`}>{p.status}</span>
                  )}
                </div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="tags">
                  {p.tags?.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <LinkRow links={p.links} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Research() {
  const { research } = useContent();
  return (
    <section id="research" className="section">
      <div className="container">
        <SectionHeading index="03" title="Research" subtitle="Publications and ongoing investigations" />
        <div className="research-list">
          {research.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <TiltCard className="card research-card">
                <span className="venue">{r.venue}</span>
                <h3>{r.title}</h3>
                {r.authors && <p className="muted authors">{r.authors}</p>}
                <p>{r.summary}</p>
                <LinkRow links={r.links} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Achievements() {
  const { achievements } = useContent();
  return (
    <section id="achievements" className="section">
      <div className="container">
        <SectionHeading index="04" title="Academic achievements" subtitle="Awards, honours and milestones" />
        <ol className="timeline">
          {achievements.map((a, i) => (
            <Reveal as="li" key={a.title} delay={i * 80}>
              <span className="timeline-dot" aria-hidden="true" />
              <span className="timeline-year">{a.year}</span>
              <div className="card timeline-card">
                <h3>{a.title}</h3>
                <p>{a.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Contact() {
  const { profile } = useContent();
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <Reveal className="contact-box">
          <span className="section-index">05</span>
          <h2>Let&rsquo;s work together</h2>
          <p>
            I&rsquo;m open to research collaborations, internships and full-time roles. The fastest way to reach me
            is by email.
          </p>
          <a className="btn btn--large" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <LinkRow links={profile.links} />
          {profile.location && <p className="muted small">Based in {profile.location}</p>}
        </Reveal>
      </div>
    </section>
  );
}

function Site() {
  const { profile } = useContent();
  useEffect(() => {
    document.title = `${profile.name} · ${profile.role}`;
  }, [profile.name, profile.role]);
  const egg = useEasterEgg();
  return (
    <>
      <Nav onLogoTap={egg.onLogoTap} />
      <main>
        <Hero />
        <About />
        <Projects />
        <Research />
        <Achievements />
        <Contact />
      </main>
      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} {profile.name}. Built with React and Three.js.
        </div>
      </footer>
      {egg.open && (
        <Suspense fallback={<div className="bh bh--loading" aria-label="Loading game" />}>
          <BugHunt onClose={egg.close} />
        </Suspense>
      )}
    </>
  );
}

// Pages live under "#/..." (e.g. #/login, #/admin) so they work on GitHub Pages,
// which cannot rewrite URLs. Plain "#about" style links still scroll the home page.
function useRoute() {
  const read = () => (window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : '/');
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export default function App() {
  const route = useRoute();
  if (route.startsWith('/login') || route.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="page-loading" aria-label="Loading" />}>
        <AdminApp route={route} />
      </Suspense>
    );
  }
  return (
    <ContentProvider>
      <Site />
    </ContentProvider>
  );
}
