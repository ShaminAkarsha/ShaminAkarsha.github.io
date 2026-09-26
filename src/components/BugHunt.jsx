import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

// Hidden mini game: squash bugs as they pop out of the code tiles before they
// ship to production. Opened by the Konami code or by tapping the logo 5 times.

const GAME_SECONDS = 30;
const SPACING = 2.1;
const BEST_KEY = 'bughunt-best';

const TYPES = {
  bug: { points: 10, color: '#f472b6', glow: '#7a1848' },
  critical: { points: 30, color: '#facc15', glow: '#6b4d00' },
  feature: { points: -20, color: '#34d399', glow: '#0b4d36' },
};

const RANKS = [
  [300, 'Principal Debugger'],
  [200, 'Senior Engineer'],
  [100, 'Junior Developer'],
  [0, 'Intern (it happens)'],
];

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(n) {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    /* storage blocked: keep the score for this visit only */
  }
}

function pickType() {
  const r = Math.random();
  if (r < 0.14) return 'feature';
  if (r < 0.26) return 'critical';
  return 'bug';
}

// A dark tile with a few coloured "lines of code" and a hole in the middle.
function Tile({ position, seed }) {
  const lines = useMemo(() => {
    const colors = ['#7c5cff', '#22d3ee', '#f472b6', '#94a0b8'];
    return Array.from({ length: 4 }, (_, i) => ({
      w: 0.35 + ((seed * 7 + i * 13) % 9) / 14,
      indent: ((seed + i) % 3) * 0.14,
      color: colors[(seed + i) % colors.length],
      z: -0.62 + i * 0.1,
    }));
  }, [seed]);
  return (
    <group position={position}>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[1.8, 0.24, 1.8]} />
        <meshStandardMaterial color="#111a30" roughness={0.6} metalness={0.2} />
      </mesh>
      {lines.map((l, i) => (
        <mesh key={i} position={[-0.72 + l.indent + l.w / 2, 0.005, l.z]}>
          <boxGeometry args={[l.w, 0.01, 0.05]} />
          <meshBasicMaterial color={l.color} transparent opacity={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.006, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#03060d" />
      </mesh>
    </group>
  );
}

function Critter({ type }) {
  const legs = useRef();
  const { color, glow } = TYPES[type];
  useFrame(({ clock }) => {
    if (legs.current) legs.current.rotation.y = Math.sin(clock.elapsedTime * 22) * 0.25;
  });
  if (type === 'feature') {
    // Features are not bugs: a green block with a check mark. Don't squash them.
    return (
      <group position={[0, 0.35, 0]}>
        <mesh>
          <boxGeometry args={[0.62, 0.62, 0.62]} />
          <meshStandardMaterial color={color} emissive={glow} roughness={0.3} />
        </mesh>
        <mesh position={[-0.08, 0.02, 0.32]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.07, 0.3, 0.02]} />
          <meshBasicMaterial color="#04241a" />
        </mesh>
        <mesh position={[-0.2, -0.05, 0.32]} rotation={[0, 0, 0.8]}>
          <boxGeometry args={[0.07, 0.16, 0.02]} />
          <meshBasicMaterial color="#04241a" />
        </mesh>
      </group>
    );
  }
  return (
    <group position={[0, 0.28, 0]}>
      <mesh scale={[0.42, 0.26, 0.55]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={color} emissive={glow} roughness={0.25} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0.5]} scale={0.22}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#1b1030" roughness={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.09, 0.12, 0.66]} rotation={[0.9, 0, s * 0.4]}>
          <cylinderGeometry args={[0.012, 0.012, 0.3]} />
          <meshBasicMaterial color="#1b1030" />
        </mesh>
      ))}
      <mesh position={[0, 0.26, 0]} scale={[0.02, 0.01, 0.5]}>
        <boxGeometry />
        <meshBasicMaterial color="#1b1030" />
      </mesh>
      <group ref={legs}>
        {[-0.25, 0, 0.25].flatMap((z) =>
          [-1, 1].map((s) => (
            <mesh key={`${z}${s}`} position={[s * 0.45, -0.1, z]} rotation={[0, 0, s * 1.1]}>
              <cylinderGeometry args={[0.018, 0.018, 0.34]} />
              <meshBasicMaterial color="#1b1030" />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}

function Bug({ bug, position, clock, onSquash }) {
  const body = useRef();
  const ring = useRef();
  const ringMat = useRef();
  useFrame(() => {
    const t = clock.current.t;
    const g = body.current;
    if (!g) return;
    if (bug.hitAt != null) {
      const k = Math.min((t - bug.hitAt) / 0.25, 1);
      g.scale.set(1 + k * 0.4, Math.max(0.12, 1 - k), 1 + k * 0.4);
      if (ring.current) {
        const r = 0.3 + (t - bug.hitAt) * 4;
        ring.current.scale.set(r, r, r);
        ringMat.current.opacity = Math.max(0, 0.8 - (t - bug.hitAt) * 1.8);
      }
      return;
    }
    const age = t - bug.born;
    const left = bug.born + bug.life - t;
    const up = Math.min(age / 0.15, 1, left / 0.15);
    g.position.y = -0.7 + up * 0.7;
    g.rotation.y = Math.sin(age * 6) * 0.35;
  });
  const hit = (e) => {
    e.stopPropagation();
    if (bug.hitAt == null) onSquash(bug.id);
  };
  const pts = TYPES[bug.type].points;
  return (
    <group position={[position[0], 0, position[2] + 0.25]}>
      <group ref={body} position={[0, -0.7, 0]}>
        <Critter type={bug.type} />
      </group>
      {/* Generous invisible hit area so bugs are easy to tap on a phone. */}
      <mesh position={[0, 0.35, 0]} onPointerDown={hit}>
        <sphereGeometry args={[0.8, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {bug.hitAt != null && (
        <>
          <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[0.9, 1, 40]} />
            <meshBasicMaterial ref={ringMat} color={TYPES[bug.type].color} transparent opacity={0.8} />
          </mesh>
          <Html position={[0, 1, 0]} center zIndexRange={[5, 0]}>
            <span className={`bh-pop ${pts < 0 ? 'bh-pop--bad' : ''}`}>{pts > 0 ? `+${pts}` : pts}</span>
          </Html>
        </>
      )}
    </group>
  );
}

function World({ phase, onScore, onShip, onTick, onEnd }) {
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.85;
  const cols = portrait ? 3 : 4;
  const rows = portrait ? 4 : 3;

  const tiles = useMemo(() => {
    const out = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        out.push([(c - (cols - 1) / 2) * SPACING, 0, (r - (rows - 1) / 2) * SPACING]);
    return out;
  }, [cols, rows]);

  // Pull the camera back far enough that the whole board fits the screen.
  useEffect(() => {
    const aspect = size.width / size.height;
    const halfW = (cols * SPACING) / 2 + 0.4;
    const halfD = (rows * SPACING) / 2 + 0.4;
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const fitW = halfW / Math.tan(hFov / 2);
    const fitD = (halfD * 1.25) / Math.tan(vFov / 2);
    const dist = Math.max(fitW, fitD) + 1.2;
    camera.position.set(0, dist * 0.87, dist * 0.5);
    camera.lookAt(0, 0, 0.35);
  }, [camera, size.width, size.height, cols, rows]);

  const clock = useRef({ t: 0 });
  const bugsRef = useRef([]);
  const [bugs, setBugs] = useState([]);
  const state = useRef({ nextSpawn: 0.5, id: 0, lastSec: GAME_SECONDS, ended: false });

  const commit = (list) => {
    bugsRef.current = list;
    setBugs(list);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    clock.current.t = 0;
    state.current = { nextSpawn: 0.5, id: 0, lastSec: GAME_SECONDS, ended: false };
    commit([]);
  }, [phase]);

  useFrame((_, rawDt) => {
    if (phase !== 'playing') return;
    const s = state.current;
    if (s.ended) return;
    const dt = Math.min(rawDt, 0.1);
    const t = (clock.current.t += dt);
    const left = Math.max(0, Math.ceil(GAME_SECONDS - t));
    if (left !== s.lastSec) {
      s.lastSec = left;
      onTick(left);
    }
    if (t >= GAME_SECONDS) {
      s.ended = true;
      commit([]);
      onEnd();
      return;
    }

    let list = bugsRef.current;
    let changed = false;
    const kept = [];
    for (const b of list) {
      if (b.hitAt != null) {
        if (t - b.hitAt < 0.6) kept.push(b);
        else changed = true;
      } else if (t > b.born + b.life) {
        if (b.type !== 'feature') onShip();
        changed = true;
      } else kept.push(b);
    }
    list = kept;

    // Spawn faster and keep bugs up for less time as the clock runs down.
    const progress = t / GAME_SECONDS;
    s.nextSpawn -= dt;
    if (s.nextSpawn <= 0) {
      s.nextSpawn = 0.85 - progress * 0.45 + Math.random() * 0.2;
      const busy = new Set(list.map((b) => b.tile));
      const free = tiles.map((_, i) => i).filter((i) => !busy.has(i));
      if (free.length) {
        const type = pickType();
        list = [
          ...list,
          {
            id: ++s.id,
            tile: free[Math.floor(Math.random() * free.length)],
            type,
            born: t,
            life: (type === 'critical' ? 0.9 : 1.6) - progress * 0.55,
            hitAt: null,
          },
        ];
        changed = true;
      }
    }
    if (changed) commit(list);
  });

  const squash = useCallback(
    (id) => {
      const b = bugsRef.current.find((x) => x.id === id);
      if (!b || b.hitAt != null) return;
      commit(bugsRef.current.map((x) => (x.id === id ? { ...x, hitAt: clock.current.t } : x)));
      onScore(TYPES[b.type].points, b.type);
      try {
        navigator.vibrate?.(b.type === 'feature' ? [30, 40, 30] : 15);
      } catch {
        /* vibration not supported */
      }
    },
    [onScore]
  );

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 8, 5]} intensity={1.4} />
      <pointLight position={[-6, 3, -2]} intensity={40} color="#22d3ee" />
      <pointLight position={[6, 3, 2]} intensity={40} color="#7c5cff" />
      {tiles.map((p, i) => (
        <Tile key={i} position={p} seed={i} />
      ))}
      {bugs.map((b) => (
        <Bug key={b.id} bug={b} position={tiles[b.tile]} clock={clock} onSquash={squash} />
      ))}
    </>
  );
}

export default function BugHunt({ onClose }) {
  const [phase, setPhase] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [shipped, setShipped] = useState(0);
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);
  const [flash, setFlash] = useState(false);
  const scoreRef = useRef(0);
  const startBtn = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (phase !== 'playing') startBtn.current?.focus();
  }, [phase]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setShipped(0);
    setTimeLeft(GAME_SECONDS);
    setNewBest(false);
    setPhase('playing');
  };

  const onScore = useCallback((pts, type) => {
    scoreRef.current = Math.max(0, scoreRef.current + pts);
    setScore(scoreRef.current);
    if (type === 'feature') {
      setFlash(true);
      setTimeout(() => setFlash(false), 250);
    }
  }, []);
  const onShip = useCallback(() => setShipped((n) => n + 1), []);
  const onEnd = useCallback(() => {
    const final = scoreRef.current;
    setBest((b) => {
      if (final > b) {
        saveBest(final);
        setNewBest(true);
        return final;
      }
      return b;
    });
    setPhase('over');
  }, []);

  const rank = RANKS.find(([min]) => score >= min)[1];

  return (
    <div className={`bh ${flash ? 'bh--flash' : ''}`} role="dialog" aria-modal="true" aria-label="Bug Hunt mini game">
      <Canvas className="bh-canvas" camera={{ fov: 45, position: [0, 9, 5] }} dpr={[1, 2]}>
        <World phase={phase} onScore={onScore} onShip={onShip} onTick={setTimeLeft} onEnd={onEnd} />
      </Canvas>

      <div className="bh-hud">
        <span>
          <small>Score</small>
          {score}
        </span>
        <span className={timeLeft <= 5 && phase === 'playing' ? 'bh-urgent' : ''}>
          <small>Time</small>
          {timeLeft}s
        </span>
        <span>
          <small>Shipped</small>
          {shipped}
        </span>
        <button className="bh-close" onClick={onClose} aria-label="Close game">
          ×
        </button>
      </div>

      {phase !== 'playing' && (
        <div className="bh-panel">
          {phase === 'ready' ? (
            <>
              <p className="eyebrow">You found an easter egg</p>
              <h2>
                <span className="gradient-text">Bug Hunt</span>
              </h2>
              <p>Squash the bugs before they ship to production. You have {GAME_SECONDS} seconds.</p>
              <ul className="bh-legend">
                <li>
                  <i style={{ background: TYPES.bug.color }} /> Bug +{TYPES.bug.points}
                </li>
                <li>
                  <i style={{ background: TYPES.critical.color }} /> Critical +{TYPES.critical.points}
                </li>
                <li>
                  <i className="bh-square" style={{ background: TYPES.feature.color }} /> Feature, leave it{' '}
                  {TYPES.feature.points}
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="eyebrow">{newBest ? 'New high score' : 'Time is up'}</p>
              <h2>
                <span className="gradient-text">{score}</span> points
              </h2>
              <p>
                Rank: <strong>{rank}</strong>. {shipped} bug{shipped === 1 ? '' : 's'} reached production.
              </p>
            </>
          )}
          <div className="bh-actions">
            <button ref={startBtn} className="btn" onClick={start}>
              {phase === 'ready' ? 'Start debugging' : 'Play again'}
            </button>
            <button className="btn btn--ghost" onClick={onClose}>
              Back to site
            </button>
          </div>
          {best > 0 && <p className="muted small">Best: {best}</p>}
        </div>
      )}
    </div>
  );
}
