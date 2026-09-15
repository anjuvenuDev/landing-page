import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { gameLevels, sections } from './data/portfolio';
import type { PortfolioSection, PortfolioSectionId } from './data/portfolio';
import { challenges } from './game/levels';
import { Analytics } from "@vercel/analytics/next";

const Game = lazy(() => import('./game/MemoryQuestGame').then(m => ({ default: m.MemoryQuestGame })));
const icons = ['✦', '⌘', '⚑', '⌬', '♡', '♜', '❋', '♛'];

const shortNames = ['About me', 'Projects', 'Experience', 'Tech stack', 'People skills', 'Leadership', 'Off the clock', 'Achievements'];
const narration = ['I wake inside a forest that feels older than memory. The trees know my name… but I have forgotten my story.', 'Somewhere in these woods are eight treasures. My inventions, my adventures, and the little things that make me who I am.', 'Help me find them. Follow the trail, collect the sparks, and open each chest — one memory at a time.'];
const unlockKey = 'anjana-memory-unlocks';
const accessKey = 'anjana-memory-access';
type View = 'map' | 'home' | 'story' | 'choose' | 'game' | 'journal';
type AccessMode = 'quest' | 'browse';

function savedUnlocks(): PortfolioSectionId[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(unlockKey) || '[]');
    return Array.isArray(value) ? sections.filter(s => value.includes(s.id)).map(s => s.id) : [];
  } catch {
    return [];
  }
}

function urlWantsTreasury() {
  return ['preview', 'slides', 'browse', 'journal'].includes(new URLSearchParams(location.search).get('view') || '');
}

function savedAccess(): AccessMode {
  try {
    if (localStorage.getItem(accessKey) === 'browse') return 'browse';
  } catch { /* private browsing */ }
  return urlWantsTreasury() ? 'browse' : 'quest';
}

function initialSection() {
  return Math.max(0, sections.findIndex(s => s.id === new URLSearchParams(location.search).get('section')));
}
function initialView(): View {
  return urlWantsTreasury() ? 'journal' : 'story';
}

const techIcons: Record<string, string> = {
  Python: 'python', JavaScript: 'javascript', TypeScript: 'typescript', Java: 'java', C: 'c',
  React: 'react', 'React.js': 'react', 'Vue.js': 'vuejs', HTML: 'html5', CSS: 'css3', 'Tailwind CSS': 'tailwindcss',
  'Node.js': 'nodejs', 'Spring Boot': 'spring', MongoDB: 'mongodb', Neo4j: 'neo4j', 'Scikit-learn': 'scikitlearn',
  Pandas: 'pandas', NumPy: 'numpy', Matplotlib: 'matplotlib', Git: 'git', Linux: 'linux', 'Arch Linux': 'archlinux',
  Vercel: 'vercel', Canva: 'canva', 'Raspberry Pi': 'raspberrypi',
};
function BrandIcon({ name }: { name: string }) { return <img className={`brand-mark brand-${name}`} src={`/assets/tech/${name}.svg`} alt="" aria-hidden="true" />; }
function Tags({ items }: { items: string[] }) { return <div className="tags">{items.map(item => <span key={item}>{techIcons[item] && <BrandIcon name={techIcons[item]} />}{item}</span>)}</div>; }
function Links({ section }: { section: PortfolioSection }) { return <div className="text-links">{section.links?.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.type === 'social' && <BrandIcon name="instagram" />}{link.label} ↗</a>)}</div>; }
function Portrait({ kind, alt }: { kind: 'about' | 'mic' | 'stage'; alt: string }) {
  const source = { about: 'about-anjana.jpg', mic: 'activity-mic.jpg', stage: 'activity-stage.jpg' }[kind];
  return <div className={`profile-orbit profile-${kind}`}><div className="profile-disc" /><div className="profile-photo-frame"><img src={`/assets/portfolio/${source}`} alt={alt} style={{ maskImage: `url(/assets/portfolio/${kind}-mask.webp)` }} /></div><span className="orbit-star" aria-hidden="true">✦</span></div>;
}
function JournalContent({ section }: { section: PortfolioSection }) {
  if (section.id === 'about') return <div className="about-grid">
    <div className="about-copy"><h2>Anjana Venugopalan</h2><p>I build thoughtful products across AI, full-stack development, and design — from assistive learning devices to tools for developers.</p><Tags items={['AI & computer vision', 'Product development', 'UI/UX design']} /><div className="education"><h3>SSN College of Engineering</h3><p>Integrated M.Tech · Computer Science<br />2023 – 2028</p><div className="stats"><div><b>9.237<span>/10</span></b><small>CGPA</small></div><div><b>#3</b><small>Department rank</small></div></div></div><a className="text-link" href="https://github.com/anjuvenuDev" target="_blank" rel="noreferrer"><BrandIcon name="github" />Explore my GitHub ↗</a></div>
    <Portrait kind="about" alt="Anjana Venugopalan" />
  </div>;
  if (section.projectCards) return <div className="project-grid">{section.projectCards.map((p, i) => <article className="project-card" key={p.title}><span className="project-index" aria-hidden="true">{['⌘', '❋', '⌬', '◈', 'π'][i]}</span><div className="project-copy"><h2>{p.title}</h2><p>{p.description}</p><Tags items={p.stack} /><div className="text-links">{p.links.map(l => <a href={l.href} target="_blank" rel="noreferrer" key={l.href}>{l.type === 'github' && <BrandIcon name="github" />}{l.label} ↗</a>)}</div></div></article>)}</div>;
  if (section.timeline) return <div className="timeline">{[...section.timeline].reverse().map(job => <article className="work-card" key={job.company}><div className="company-identity"><img className="company-logo" src={job.logo} alt={`${job.company} logo`} /><div><h2>{job.company}</h2><p>{job.dates}</p></div></div><div className="job-copy"><h3>{job.role}</h3><ul>{job.details.map(d => <li key={d}>{d}</li>)}</ul></div></article>)}</div>;
  if (section.skillGroups) return <div className="skill-grid">{section.skillGroups.map((group, i) => <article className="skill-card" key={group.title}><span className="skill-icon" aria-hidden="true">{icons[i]}</span><h2>{group.title}</h2><Tags items={group.items} /></article>)}</div>;
  if (section.id === 'activities') return <div className="leadership-grid"><div className="highlights">{section.highlights.map((t, i) => <article key={t}><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><p>{t}</p></article>)}</div><div className="portrait-duo"><Portrait kind="stage" alt="Anjana hosting on stage" /></div></div>;
  return <><div className={section.id === 'hobbies' ? 'hobby-grid' : ''}>{section.id === 'hobbies' && <div className="art-window" tabIndex={0} aria-label="Scroll to explore Anjana’s artwork"><img className="art-gallery" src={section.image!.src} alt={section.image!.alt} /></div>}<div className="feature-grid">{section.featureCards?.map((f, i) => <article key={f.title}><span className="skill-icon" aria-hidden="true">{icons[i]}</span><h2>{f.title}</h2><p>{f.body}</p></article>)}</div></div><Links section={section} /></>;
}

function levelLocked(i: number, nextLevel: number, freeBrowse: boolean) {
  if (freeBrowse || nextLevel < 0) return false;
  return i > nextLevel;
}

export default function App() {
  const [view, setView] = useState<View>(initialView);
  const [selected, setSelected] = useState(initialSection);
  const [unlocked, setUnlocked] = useState(savedUnlocks);
  const [access, setAccess] = useState<AccessMode>(savedAccess);
  const [level, setLevel] = useState(0);
  const [story, setStory] = useState(0);
  const [reward, setReward] = useState(false);
  const [paused, setPaused] = useState(false);
  const [trailOpen, setTrailOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [avatarJump, setAvatarJump] = useState(false);
  const [run, setRun] = useState(0);
  const [reduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [expanded, setExpanded] = useState(() => new URLSearchParams(location.search).get('view') === 'slides');
  const [typed, setTyped] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);

  const freeBrowse = access === 'browse';
  const nextLevel = sections.findIndex(s => !unlocked.includes(s.id));
  const canPlayLevel = useCallback((i: number) => !levelLocked(i, nextLevel, freeBrowse), [nextLevel, freeBrowse]);
  const canViewSection = useCallback((i: number) => freeBrowse || unlocked.includes(sections[i].id), [freeBrowse, unlocked]);

  const section = sections[selected];
  const current = challenges[level];

  const go = (next: View) => {
    if (next !== 'journal') {
      setExpanded(false);
      if (document.fullscreenElement) void document.exitFullscreen();
    }
    setView(next === 'home' ? 'story' : next);
    if (next === 'home') {
      setStory(0);
      setGameStarted(false);
      setTrailOpen(false);
    }
    setPaused(false);
  };

  const openTreasury = (free = false) => {
    if (free) setAccess('browse');
    setReward(false);
    setTrailOpen(false);
    if (free) setSelected(0);
    else {
      const latest = [...sections].reverse().find(s => unlocked.includes(s.id));
      setSelected(latest ? sections.findIndex(s => s.id === latest.id) : 0);
    }
    go('journal');
  };

  const begin = (index: number) => {
    // Playing the quest always uses progression locks (even if treasury was opened earlier).
    setAccess('quest');
    const target = (!levelLocked(index, nextLevel, false)) ? index : (nextLevel < 0 ? 0 : nextLevel);
    setGameStarted(false);
    setLevel(target);
    setReward(false);
    setTrailOpen(false);
    go('map');
  };

  const selectLevel = (i: number) => {
    setLevel(i);
    if (matchMedia('(max-width: 760px)').matches) {
      requestAnimationFrame(() => document.querySelector('.map-detail')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' }));
    }
  };

  const enterLevel = (i: number) => {
    if (!canPlayLevel(i)) return;
    setLevel(i);
    setTrailOpen(false);
    setPaused(false);
    setRun(r => r + 1);
    setGameStarted(true);
    go('game');
  };
        <Analytics />

  useEffect(() => { if (view !== 'story') return; setTyped(0); const timer = window.setInterval(() => setTyped(n => Math.min(n + 1, narration[story].length)), 30); return () => clearInterval(timer); }, [view, story]);
  useEffect(() => { const change = () => { if (!document.fullscreenElement) setExpanded(false); }; document.addEventListener('fullscreenchange', change); return () => document.removeEventListener('fullscreenchange', change); }, []);
  const toggleExpanded = () => { if (expanded) { setExpanded(false); if (document.fullscreenElement) void document.exitFullscreen(); } else { setExpanded(true); document.documentElement.requestFullscreen?.().catch(() => {}); } };
  const closeTreasury = useCallback(() => { setExpanded(false); if (document.fullscreenElement) void document.exitFullscreen(); setView(gameStarted ? 'game' : 'map'); setPaused(false); }, [gameStarted]);
  const complete = useCallback((id: PortfolioSectionId) => {
    setUnlocked(old => old.includes(id) ? old : [...old, id]);
    setSelected(sections.findIndex(s => s.id === id));
    setReward(true);
    setTrailOpen(false);
    // Tear down the Phaser instance immediately so the next level is a clean boot
    // (async destroy raced with remount when the paused game was kept alive under journal).
    setGameStarted(false);
    setPaused(false);
    setView('journal');
  }, []);

  useEffect(() => { try { localStorage.setItem(unlockKey, JSON.stringify(unlocked)); } catch { /* Private browsing remains playable. */ } }, [unlocked]);
  useEffect(() => { try { localStorage.setItem(accessKey, access); } catch { /* Private browsing remains playable. */ } }, [access]);
  useEffect(() => {
    if (view === 'journal' && !canViewSection(selected) && !freeBrowse) {
      const latest = [...sections].reverse().find(s => unlocked.includes(s.id));
      setSelected(latest ? sections.findIndex(s => s.id === latest.id) : 0);
    }
  }, [view, selected, canViewSection, freeBrowse, unlocked]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (view !== 'game') heading.current?.focus();
    else (document.activeElement as HTMLElement | null)?.blur?.();
    const url = new URL(location.href);
    url.search = view === 'journal' ? `?view=${expanded ? 'slides' : 'journal'}&section=${sections[selected].id}` : '';
    history.replaceState(null, '', url);
  }, [view, selected, expanded]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (view === 'game' && trailOpen) { setTrailOpen(false); setPaused(false); return; }
      if (view === 'game') setPaused(p => !p);
      else if (view === 'journal') closeTreasury();
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [view, closeTreasury, trailOpen]);
  useEffect(() => { const listener = () => { if (document.hidden && view === 'game') setPaused(true); }; document.addEventListener('visibilitychange', listener); return () => document.removeEventListener('visibilitychange', listener); }, [view]);

  const mapStops = (opts: { inGame?: boolean } = {}) => (
    <nav className={`map-route${opts.inGame ? ' trail-drawer-route' : ''}`} aria-label="Level roadmap">
      {challenges.map((c, i) => {
        const locked = levelLocked(i, nextLevel, freeBrowse);
        const collected = unlocked.includes(sections[i].id);
        return (
          <button
            key={c.name}
            type="button"
            className={`map-stop${level === i ? ' active' : ''}${collected ? ' collected' : ''}${locked ? ' locked' : ''}`}
            aria-current={level === i ? 'step' : undefined}
            aria-disabled={opts.inGame ? locked : undefined}
            onClick={() => {
              if (opts.inGame) {
                if (locked) return;
                enterLevel(i);
                return;
              }
              selectLevel(i);
            }}
          >
            <span className="map-node"><img src="/assets/sunnyland/chest.png" alt="" /><b>{i + 1}</b></span>
            <span>{c.name}<small>{collected ? 'Memory recovered' : locked ? 'Locked' : c.difficulty}</small></span>
          </button>
        );
      })}
    </nav>
  );

  return <div className={`app view-${view} chapter-${section.id}${expanded ? ' treasury-expanded' : ''}${reduced ? ' reduced' : ''}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    <main id="main">
    {(view === 'story' || view === 'choose') && <section className="interlude opening"><div className="landscape" /><div className="opening-content"><h1 ref={heading} tabIndex={-1}>The Memory Quest</h1><button className={`cover-avatar ${avatarJump ? 'jumping' : ''}`} aria-label="Make Anjana open the treasure" onClick={() => setAvatarJump(true)} onAnimationEnd={() => setAvatarJump(false)}><span className="avatar-actor"><span className="pixelart-to-css" /></span><span className="avatar-ground" /><img className="avatar-chest" src="/assets/sunnyland/chest.png" alt="" /><span className="avatar-spark" aria-hidden="true">✦</span></button><article className="dialogue-box">{view === 'story' ? <><p className="narration" aria-label={narration[story]}>{reduced ? narration[story] : narration[story].slice(0, typed)}<span className="text-cursor" aria-hidden="true">▾</span></p><div className="dialogue-actions"><button className="skip-narration" onClick={() => go('choose')}>Skip story</button><div className="story-dots">{[0,1,2].map(i => <span className={i === story ? 'active' : ''} key={i} />)}</div><button className="button primary" onClick={() => { if (!reduced && typed < narration[story].length) setTyped(narration[story].length); else if (story < 2) setStory(story + 1); else go('choose'); }}>{typed < narration[story].length && !reduced ? 'Continue' : story < 2 ? 'Next' : 'Begin'} ▸</button></div></> : <><h2>Choose your path</h2><p>Find my memories in the forest, or open the treasury.</p><div className="story-actions"><button className="button primary" onClick={() => begin(nextLevel < 0 ? 0 : nextLevel)}>{unlocked.length > 0 && nextLevel >= 0 ? 'Continue quest' : nextLevel < 0 ? 'Replay quest' : 'Play the quest'} ▸</button><button className="button ghost" onClick={() => openTreasury(true)}>Open treasury ▸</button></div></>}</article><footer className="home-footer"><div className="home-socials"><a href="https://www.linkedin.com/in/anjanavenu2005/" target="_blank" rel="noreferrer"><BrandIcon name="linkedin" />LinkedIn</a><a href="https://github.com/anjuvenuDev" target="_blank" rel="noreferrer"><BrandIcon name="github" />GitHub</a></div><p>Play on desktop for the best experience.</p>{unlocked.length > 0 && <button className="saved-quest" onClick={() => begin(nextLevel < 0 ? 0 : nextLevel)}>{unlocked.length}/8 levels completed · {nextLevel < 0 ? 'Play again' : 'Continue'} →</button>}</footer></div></section>}

    {view === 'map' && <section className="world-map"><div className="landscape" /><button className="home-button map-home" onClick={() => go('home')}>⌂ Home</button><header className="map-heading"><h1 ref={heading} tabIndex={-1}>The memory trail</h1><p>{unlocked.length}/8 levels completed</p></header><div className="map-layout">{mapStops()}<article className="map-detail"><img className="map-preview" src={`/assets/levels/${current.background}.png`} alt={current.name} /><div className="map-detail-copy"><span className="level-badge">Level {level + 1} / 8</span><h2>{current.name}</h2><div className="difficulty"><span>{current.difficulty}</span><span>{'▮'.repeat(level + 1)}<i>{'▯'.repeat(7 - level)}</i></span></div><p>{current.description}</p><p className="map-reward"><img src="/assets/sunnyland/chest.png" alt="" />{sections[level].title}</p><p className="map-objective">{canPlayLevel(level) ? `Collect ${current.platforms.length - 1} sparks, then open the treasure.` : 'Recover earlier memories to unlock this level.'}</p><details><summary>How to play</summary><p>Move with ← → or A / D. Jump with Space / W. Use the on-screen arrows on mobile. Esc pauses. Falls return you to your last safe landing; collected sparks stay with you.</p></details><button className="button primary" disabled={!canPlayLevel(level)} onClick={() => enterLevel(level)}>{canPlayLevel(level) ? `Enter level ${level + 1} ▸` : 'Locked'}</button></div></article></div></section>}

    {gameStarted && <section hidden={view !== 'game'} className="game-stage" aria-label={`Level ${level + 1}: ${current.name}`}>
      <div className="game-toolbar">
        <button className="home-button" onClick={() => go('home')}>⌂ <span>Home</span></button>
        <span><small>LEVEL 0{level + 1}</small><b>{current.name}</b></span>
        <span className="game-difficulty">{current.difficulty} · {unlocked.length}/8 memories</span>
        <button className="button small" onClick={() => { setTrailOpen(true); setPaused(true); }}>Trail</button>
        <button className="button small" onClick={() => setPaused(!paused)}>{paused && !trailOpen ? 'Resume ▷' : 'Pause Ⅱ'}</button>
        <button className="button small" onClick={() => openTreasury(false)}>Treasury</button>
      </div>
      <Suspense fallback={<div className="loading">Loading the forest…</div>}>
        <Game key={`${level}-${run}`} level={gameLevels[level]} reducedMotion={reduced} onComplete={complete} paused={paused || trailOpen || view !== 'game'} />
      </Suspense>
      {trailOpen && (
        <aside className="trail-drawer" aria-label="Memory trail">
          <div className="trail-drawer-head">
            <div>
              <small>PROGRESS</small>
              <h2>Memory trail</h2>
              <p>{unlocked.length}/8 memories recovered</p>
            </div>
            <button type="button" className="button small" onClick={() => { setTrailOpen(false); setPaused(false); }}>Close</button>
          </div>
          {mapStops({ inGame: true })}
        </aside>
      )}
      {paused && !trailOpen && <div className="pause-overlay"><article className="story-card"><span className="eyebrow">TAKE A BREATHER</span><h2>Adventure paused.</h2><button className="button primary" onClick={() => setPaused(false)}>Keep exploring →</button><button className="button ghost" onClick={() => { setRun(r => r + 1); setPaused(false); }}>Restart this level</button><button className="button ghost" onClick={() => { setTrailOpen(true); }}>Check the trail</button><button className="button ghost" onClick={() => openTreasury(false)}>Open portfolio ↗</button></article></div>}
      <div className="game-tip">Move: ← → / A D <span>·</span> Jump: Space / W <span>·</span> Collect sparks. Find your memory.</div>
    </section>}

    {view === 'journal' && <div className="journal-shell"><aside className="journal-sidebar"><h2>The treasury</h2><nav aria-label="Portfolio chapters">{sections.map((s, i) => {
      const open = canViewSection(i);
      return <button className={`${selected === i ? 'selected' : ''}${open ? '' : ' locked'}`} key={s.id} aria-current={selected === i ? 'page' : undefined} disabled={!open} onClick={() => { if (!open) return; setSelected(i); setReward(false); }}><span className="chapter-icon">{open ? icons[i] : '🔒'}</span><span>{shortNames[i]}</span><i>{open ? (unlocked.includes(s.id) || freeBrowse ? '✦' : '↗') : 'Locked'}</i></button>;
    })}</nav><div className="sidebar-quest"><span>{unlocked.length}/8 MEMORIES COLLECTED</span><div className="progress-track"><i style={{ width: `${unlocked.length / 8 * 100}%` }} /></div><button onClick={() => begin(nextLevel < 0 ? 0 : nextLevel)}>{nextLevel < 0 ? 'Replay the quest' : 'Enter the game'} →</button></div><a className="github-link" href="https://github.com/anjuvenuDev" target="_blank" rel="noreferrer"><BrandIcon name="github" />Find me on GitHub ↗</a></aside><div className="journal-main">{reward && canViewSection(selected) && <div className="reward-banner" role="status"><span>✦</span><div><b>{unlocked.length === 8 ? 'The story is complete!' : 'Memory recovered!'}</b><p>{section.rewardName} added to your journal.</p></div><button onClick={() => begin(Math.min(selected + 1, 7))} disabled={!canPlayLevel(Math.min(selected + 1, 7)) && selected < 7}>{selected === 7 ? 'Replay final level' : `Enter level ${selected + 2}`} →</button></div>}<div className="treasury-tools"><button className="home-button" onClick={() => go('home')}>⌂ Home</button><div><button className="view-button" onClick={toggleExpanded} aria-label={expanded ? 'Exit fullscreen section' : 'Fullscreen section'} disabled={!canViewSection(selected)}><span aria-hidden="true">{expanded ? '⤡' : '⛶'}</span> {expanded ? 'Compact view' : 'Full screen'}</button><button className="close-treasury" onClick={closeTreasury} aria-label="Close treasury and return to game" title="Return to game (Esc)">×</button></div></div><header className="chapter-header"><img src="/assets/sunnyland/chest.png" alt="" /><h1 ref={heading} tabIndex={-1}>{shortNames[selected]}</h1></header><div className="chapter-body" key={section.id}>{canViewSection(selected) ? <JournalContent section={section} /> : <div className="memory-locked" role="status"><span aria-hidden="true">🔒</span><h2>Memory sealed</h2><p>Recover this chapter on the memory trail before it opens in the treasury.</p><button className="button primary" onClick={() => begin(nextLevel < 0 ? 0 : nextLevel)}>Return to the trail →</button></div>}</div><footer className="chapter-footer"><button disabled={selected === 0 || !canViewSection(selected - 1)} onClick={() => { setSelected(s => s - 1); setReward(false); }}>← Previous chapter</button><span>{String(selected + 1).padStart(2, '0')} / 08</span>{selected < 7 ? <button disabled={!canViewSection(selected + 1)} onClick={() => { setSelected(s => s + 1); setReward(false); }}>Next: {shortNames[selected + 1]} →</button> : <button onClick={() => go('home')}>Back to the beginning ↗</button>}</footer><div className="next-level-card"><span>{icons[Math.min(selected + 1, 7)]}</span><div><h3>{selected < 7 ? `Level ${selected + 2}: ${challenges[selected + 1].name}` : 'Revisit the forest'}</h3></div><button className="button primary" disabled={selected < 7 && !canPlayLevel(selected + 1)} onClick={() => begin(selected < 7 ? selected + 1 : 0)}>{selected < 7 ? (canPlayLevel(selected + 1) ? `Enter level ${selected + 2}` : 'Level locked') : 'Play again'} →</button></div></div></div>}
    </main>
  </div>;
}
