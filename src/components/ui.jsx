import { useEffect, useRef } from 'react';

// Fades and lifts children into view when they scroll onto the screen.
export function Reveal({ children, className = '', as: Tag = 'div', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

// Card that tilts in 3D toward the pointer, with a moving glare highlight.
export function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  const onMove = (e) => {
    const el = ref.current;
    if (!el || !canHover) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 12}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="tilt-inner">{children}</div>
    </div>
  );
}

export function SectionHeading({ index, title, subtitle }) {
  return (
    <Reveal className="section-heading">
      <span className="section-index">{index}</span>
      <h2>{title}</h2>
      {subtitle && <p className="section-sub">{subtitle}</p>}
    </Reveal>
  );
}

export function LinkRow({ links }) {
  if (!links?.length) return null;
  return (
    <div className="link-row">
      {links.map((l) => (
        <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="chip-link">
          {l.label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
