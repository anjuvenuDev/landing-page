import { useCallback, useEffect, useMemo, useState } from "react";
import { gameLevels, sectionOrder, sections } from "./data/portfolio";
import type { PortfolioSection, PortfolioSectionId } from "./data/portfolio";
import { MemoryQuestGame } from "./game/MemoryQuestGame";

const storageKey = "anjana-memory-unlocks";

type AppMode = "intro" | "quest" | "archive";

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
  onOpenArchive,
}: {
  onEnterQuest: () => void;
  onOpenArchive: () => void;
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
          <p className="eyebrow">Flashback sequence</p>
          <h1>Anjana Memory Quest</h1>
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
            <button type="button" onClick={onOpenArchive}>
              Unlock memory shards
            </button>
          </div>
        </div>
        <div className="avatar-stage" aria-label="Pixel avatar of Anjana">
          <div className="gesture-avatar">
            <span className="hair hair-left" />
            <span className="hair hair-right" />
            <span className="face" />
            <span className="glasses left" />
            <span className="glasses right" />
            <span className="smile" />
            <span className="body" />
            <span className="arm arm-left" />
            <span className="arm arm-right" />
            <span className="leg leg-left" />
            <span className="leg leg-right" />
          </div>
          <div className="speech-runes">
            <span>?</span>
            <span>!</span>
            <span>★</span>
          </div>
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

function RewardDetail({ section }: { section: PortfolioSection | null }) {
  if (!section) {
    return (
      <div className="reward-card locked-detail">
        <p className="eyebrow">Quest start</p>
        <h2>Choose a treasure box</h2>
        <p className="summary">
          Run the next level to reveal a memory shard, or use the archive path
          to unlock the full portfolio immediately.
        </p>
      </div>
    );
  }

  return (
    <article className="reward-card reward-reveal" key={section.id}>
      <div className="reward-card-header">
        <div>
          <p className="eyebrow">Treasure opened</p>
          <h2>{section.title}</h2>
        </div>
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
    </article>
  );
}

function MemoryLog({
  unlocked,
  selectedId,
  onSelect,
  onUnlockAll,
  onReset,
}: {
  unlocked: PortfolioSectionId[];
  selectedId: PortfolioSectionId | null;
  onSelect: (sectionId: PortfolioSectionId) => void;
  onUnlockAll: () => void;
  onReset: () => void;
}) {
  return (
    <aside className="quest-log" aria-label="Memory shard logs">
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">Left log</p>
          <h2>Memory Shards</h2>
        </div>
        <span className="counter">
          {unlocked.length}/{sections.length}
        </span>
      </div>
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
    setMode("archive");
  };

  const resetQuest = () => {
    persistUnlocks([]);
    setSelectedId(null);
    setMode("quest");
  };

  const enterQuest = () => {
    setMode("quest");
    if (unlocked.length > 0 && !selectedId) {
      setSelectedId(unlocked[unlocked.length - 1]);
    }
  };

  if (mode === "intro") {
    return <IntroScreen onEnterQuest={enterQuest} onOpenArchive={unlockAll} />;
  }

  const nextLevelLabel = allUnlocked
    ? "All memories restored"
    : `Next treasure: ${currentLevel.rewardName}`;

  return (
    <main className={`workspace ${mode}`}>
      <MemoryLog
        unlocked={unlocked}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onUnlockAll={unlockAll}
        onReset={resetQuest}
      />

      <section className="mission-panel" aria-label="Game and unlocked section">
        <header className="mission-header">
          <div>
            <p className="eyebrow">{mode === "archive" ? "Archive mode" : "Quest mode"}</p>
            <h1>{mode === "archive" ? "Recovered Portfolio" : "Forest Run"}</h1>
          </div>
          <div className="mission-controls">
            <button type="button" onClick={() => setMode(mode === "archive" ? "quest" : "archive")}>
              {mode === "archive" ? "Return to game" : "Open archive"}
            </button>
            <label className="motion-toggle">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(event) => setReducedMotion(event.target.checked)}
              />
              Calm motion
            </label>
          </div>
        </header>

        {mode === "quest" ? (
          <div className="game-panel scene-enter">
            <div className="game-topbar">
              <span>{nextLevelLabel}</span>
              <span>Move: arrows/A-D · Jump: space/W/up · Open chest: touch it</span>
            </div>
            <MemoryQuestGame
              level={currentLevel}
              reducedMotion={reducedMotion}
              onComplete={unlockSection}
            />
          </div>
        ) : (
          <div className="archive-map scene-enter" aria-label="Unlocked memory map">
            {sections.map((section) => {
              const isUnlocked = unlocked.includes(section.id);
              return (
                <button
                  type="button"
                  key={section.id}
                  disabled={!isUnlocked}
                  className={selectedId === section.id ? "map-treasure active" : "map-treasure"}
                  onClick={() => setSelectedId(section.id)}
                >
                  <span className="box-icon" />
                  <strong>{section.title}</strong>
                  <small>{isUnlocked ? "Open memory" : "Locked"}</small>
                </button>
              );
            })}
          </div>
        )}

        <section className="reward-detail" aria-live="polite">
          <RewardDetail section={selectedSection} />
        </section>
      </section>
    </main>
  );
}

export default App;
