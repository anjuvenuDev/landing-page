import { useCallback, useEffect, useMemo, useState } from "react";
import { gameLevels, sectionOrder, sections } from "./data/portfolio";
import type { PortfolioSection, PortfolioSectionId } from "./data/portfolio";
import { PixelAvatar } from "./avatar/PixelAvatar";
import { MemoryQuestGame } from "./game/MemoryQuestGame";

const storageKey = "anjana-memory-unlocks";

type AppMode = "intro" | "quest";

const narrationLines = [
  "I wake inside a forest that feels older than memory.",
  "The trees know my name, but I cannot remember why I came here.",
  "Every path is guarded by a small trial: a jump, a choice, a shard of myself.",
  "If I open the treasure boxes, my memories return as pieces of my portfolio.",
  "Come with me through the woods. Help me remember who I am becoming.",
];

function readStoredUnlocks(): PortfolioSectionId[] {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as PortfolioSectionId[];
    return parsed.filter((id) => sectionOrder.includes(id));
  } catch {
    return [];
  }
}

function useTypewriter(lines: string[]) {
  const [lineIndex, setLineIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);

  useEffect(() => {
    const activeLine = lines[lineIndex] ?? "";
    if (characterIndex < activeLine.length) {
      const timer = window.setTimeout(() => {
        setCharacterIndex((current) => current + 1);
      }, 34);
      return () => window.clearTimeout(timer);
    }

    if (lineIndex < lines.length - 1) {
      const timer = window.setTimeout(() => {
        setLineIndex((current) => current + 1);
        setCharacterIndex(0);
      }, 760);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [characterIndex, lineIndex, lines]);

  return {
    visibleLines: lines.slice(0, lineIndex),
    activeLine: (lines[lineIndex] ?? "").slice(0, characterIndex),
    complete: lineIndex === lines.length - 1 && characterIndex === lines[lineIndex].length,
  };
}

function IntroScreen({
  onEnterQuest,
  onOpenMemories,
}: {
  onEnterQuest: () => void;
  onOpenMemories: () => void;
}) {
  const { visibleLines, activeLine, complete } = useTypewriter(narrationLines);

  return (
    <main className="intro-screen">
      <div className="intro-forest" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <section className="flashback-panel" aria-label="Story narration">
        <div className="intro-copy">
          <h1>Anjana Memory Quest</h1>
          <button type="button" className="skip-narration" onClick={onEnterQuest}>
            Skip
          </button>
          <div className="typewriter" aria-live="polite">
            {visibleLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>
              {activeLine}
              <span className="cursor">_</span>
            </p>
          </div>
          <div className={complete ? "intro-actions visible" : "intro-actions"}>
            <button type="button" onClick={onEnterQuest}>
              Enter the game
            </button>
            <button type="button" onClick={onOpenMemories}>
              Unlock memory shards
            </button>
          </div>
        </div>
        <div className="avatar-stage" aria-label="Pixel avatar of Anjana">
          <PixelAvatar className="gesture-avatar" />
        </div>
      </section>
    </main>
  );
}

function SectionIllustration({ section }: { section: PortfolioSection }) {
  return (
    <div className={`section-illustration ${section.visual}`} aria-hidden="true">
      {section.visual === "map" ? (
        <>
          <span className="map-node start" />
          <span className="map-node college" />
          <span className="map-node product" />
          <span className="map-path" />
        </>
      ) : null}
      {section.visual === "network" ? (
        <>
          <span className="network-core" />
          <span className="network-node n1">CV</span>
          <span className="network-node n2">ML</span>
          <span className="network-node n3">API</span>
          <span className="network-node n4">CLI</span>
        </>
      ) : null}
      {section.visual === "timeline" ? (
        <>
          <span className="timeline-line" />
          <span className="timeline-dot d1">NoShack</span>
          <span className="timeline-dot d2">Yhills</span>
          <span className="timeline-dot d3">Friday</span>
        </>
      ) : null}
      {section.visual === "skills" ? (
        <>
          <span className="skill-bar b1" />
          <span className="skill-bar b2" />
          <span className="skill-bar b3" />
          <span className="skill-orbit o1">TS</span>
          <span className="skill-orbit o2">SQL</span>
          <span className="skill-orbit o3">Py</span>
        </>
      ) : null}
      {section.visual === "compass" ? (
        <>
          <span className="compass-ring" />
          <span className="compass-needle" />
          <span className="compass-label north">Own</span>
          <span className="compass-label east">Lead</span>
          <span className="compass-label south">Ship</span>
          <span className="compass-label west">Listen</span>
        </>
      ) : null}
      {section.visual === "guilds" ? (
        <>
          <span className="guild-banner g1">ACE</span>
          <span className="guild-banner g2">WIE</span>
          <span className="guild-banner g3">ACM</span>
          <span className="guild-banner g4">MUN</span>
        </>
      ) : null}
      {section.visual === "garden" ? (
        <>
          <span className="garden-stem s1" />
          <span className="garden-stem s2" />
          <span className="garden-stem s3" />
          <span className="garden-moon" />
        </>
      ) : null}
      {section.visual === "trophy" ? (
        <>
          <span className="trophy-cup" />
          <span className="trophy-base" />
          <span className="spark sp1" />
          <span className="spark sp2" />
          <span className="spark sp3" />
        </>
      ) : null}
    </div>
  );
}

function RewardOverlay({
  section,
  allUnlocked,
  onContinue,
}: {
  section: PortfolioSection;
  allUnlocked: boolean;
  onContinue: () => void;
}) {
  return (
    <section className="reward-overlay" aria-live="polite">
      <article className="reward-card reward-reveal" key={section.id}>
        <div className="reward-card-header">
          <h2>{section.title}</h2>
          <span className={section.status === "verified" ? "status verified" : "status pending"}>
            {section.status === "verified" ? "Resume verified" : "Needs final copy"}
          </span>
        </div>
        <div className="reward-body">
          <SectionIllustration section={section} />
          <div className="reward-copy">
            <p className="summary">{section.summary}</p>
            <ul>
              {section.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            {section.links ? (
              <div className="link-row" aria-label="Project links">
                {section.links.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
            <div className="tag-row">
              {section.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <button type="button" className="continue-button" onClick={onContinue}>
          {allUnlocked ? "Back to game" : "Continue to next level"}
        </button>
      </article>
    </section>
  );
}

function MemoryLog({
  open,
  unlocked,
  selectedId,
  onClose,
  onSelect,
  onUnlockAll,
  onReset,
}: {
  open: boolean;
  unlocked: PortfolioSectionId[];
  selectedId: PortfolioSectionId | null;
  onClose: () => void;
  onSelect: (sectionId: PortfolioSectionId) => void;
  onUnlockAll: () => void;
  onReset: () => void;
}) {
  return (
    <aside className={open ? "quest-log open" : "quest-log"} aria-label="Memory shard logs">
      <div className="sidebar-header">
        <h2>Memory Shards</h2>
        <button type="button" className="icon-button close-log" onClick={onClose} aria-label="Close log">
          ×
        </button>
      </div>
      <span className="counter">
        {unlocked.length}/{sections.length}
      </span>
      <div className="sidebar-actions">
        <button type="button" onClick={onUnlockAll}>
          Unlock all
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <nav className="treasure-list" aria-label="Unlocked treasure boxes">
        {sections.map((section) => {
          const isUnlocked = unlocked.includes(section.id);
          const isActive = selectedId === section.id;
          return (
            <button
              type="button"
              key={section.id}
              className={isActive ? "treasure active" : "treasure"}
              disabled={!isUnlocked}
              onClick={() => onSelect(section.id)}
            >
              <span className="box-icon" />
              <span className="box-meta">Lvl {section.level}</span>
              <strong>{section.rewardName}</strong>
              <small>{isUnlocked ? section.title : "Locked"}</small>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function App() {
  const [mode, setMode] = useState<AppMode>("intro");
  const [unlocked, setUnlocked] = useState<PortfolioSectionId[]>(readStoredUnlocks);
  const [selectedId, setSelectedId] = useState<PortfolioSectionId | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const currentLevel = useMemo(() => {
    const next = gameLevels.find((level) => !unlocked.includes(level.id));
    return next ?? gameLevels[gameLevels.length - 1];
  }, [unlocked]);

  const selectedSection =
    sections.find((section) => section.id === selectedId && unlocked.includes(section.id)) ?? null;
  const allUnlocked = unlocked.length === sections.length;

  const persistUnlocks = useCallback((nextUnlocks: PortfolioSectionId[]) => {
    setUnlocked(nextUnlocks);
    window.localStorage.setItem(storageKey, JSON.stringify(nextUnlocks));
  }, []);

  const unlockSection = useCallback((sectionId: PortfolioSectionId) => {
    setSelectedId(sectionId);
    setUnlocked((current) => {
      if (current.includes(sectionId)) return current;
      const next = sectionOrder.filter((id) => [...current, sectionId].includes(id));
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, []);

  const unlockAll = () => {
    persistUnlocks([...sectionOrder]);
    setSelectedId("about");
    setLogOpen(false);
    setMode("quest");
  };

  const resetQuest = () => {
    persistUnlocks([]);
    setSelectedId(null);
    setLogOpen(false);
    setMode("quest");
  };

  const enterQuest = () => {
    setMode("quest");
    setSelectedId(null);
  };

  const selectFromLog = (sectionId: PortfolioSectionId) => {
    setSelectedId(sectionId);
    setLogOpen(false);
  };

  if (mode === "intro") {
    return <IntroScreen onEnterQuest={enterQuest} onOpenMemories={unlockAll} />;
  }

  return (
    <main className="game-screen">
      <MemoryQuestGame level={currentLevel} reducedMotion={reducedMotion} onComplete={unlockSection} />

      <div className="game-overlay-hud">
        <button
          type="button"
          className="icon-button log-toggle"
          onClick={() => setLogOpen((open) => !open)}
          aria-label="Open memory log"
        >
          ☰
        </button>
        <div className="objective-pill">
          {allUnlocked ? "All memories restored" : `Next: ${currentLevel.rewardName}`}
        </div>
        <label className="motion-toggle">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
          Calm
        </label>
      </div>

      <MemoryLog
        open={logOpen}
        unlocked={unlocked}
        selectedId={selectedId}
        onClose={() => setLogOpen(false)}
        onSelect={selectFromLog}
        onUnlockAll={unlockAll}
        onReset={resetQuest}
      />

      {selectedSection ? (
        <RewardOverlay
          section={selectedSection}
          allUnlocked={allUnlocked}
          onContinue={() => setSelectedId(null)}
        />
      ) : null}
    </main>
  );
}

export default App;
