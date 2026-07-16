import { useCallback, useEffect, useMemo, useState } from "react";
import { gameLevels, sectionOrder, sections } from "./data/portfolio";
import type { PortfolioSection, PortfolioSectionId } from "./data/portfolio";
import { MemoryQuestGame } from "./game/MemoryQuestGame";

const storageKey = "anjana-memory-unlocks";

type AppMode = "intro" | "game" | "browse" | "preview";

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
          <h1>Anjana&apos;s Memory Quest</h1>
          <div className="typewriter" aria-live="polite">
            {visibleLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>
              {activeLine}
              <span className="cursor">_</span>
            </p>
          </div>
          <button type="button" className="skip-narration" onClick={onEnterQuest}>
            Skip
          </button>
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
          <div className="gesture-avatar" aria-hidden="true">
            <span className="pixelart-to-css" />
            <span className="avatar-specs" />
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

function RewardOverlay({
  section,
  mode,
  position,
  total,
  previousSection,
  nextSection,
  previousUnlocked,
  nextUnlocked,
  onPrev,
  onNext,
  onClose,
  allUnlocked,
  onContinue,
  onPreview,
}: {
  section: PortfolioSection;
  mode: Exclude<AppMode, "intro">;
  position: number;
  total: number;
  previousSection: PortfolioSection | null;
  nextSection: PortfolioSection | null;
  previousUnlocked: boolean;
  nextUnlocked: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  allUnlocked: boolean;
  onContinue: () => void;
  onPreview: () => void;
}) {
  const browseMode = mode === "browse" || mode === "preview";
  const previewMode = mode === "preview";
  const previousLocked = previousSection && !previousUnlocked && !browseMode;
  const nextLocked = nextSection && !nextUnlocked && !browseMode;

  return (
    <section className="reward-overlay" aria-live="polite">
      <article className="reward-card reward-reveal" key={section.id}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close memory view">
          x
        </button>
        {previewMode ? (
          <button
            type="button"
            className="modal-tool minimize-tool"
            onClick={onClose}
            aria-label="go back to game mode"
            title="go back to game mode"
          >
            ⤢
          </button>
        ) : (
          <button
            type="button"
            className="modal-tool preview-tool"
            onClick={onPreview}
            aria-label="preview mode"
            title="preview mode"
          >
            ⛶
          </button>
        )}
        <div className="reward-card-header">
          <div>
            <span className="memory-position">
              {position}/{total}
            </span>
            <h2>{section.title}</h2>
          </div>
          <div className="reward-header-actions">
            <span className={section.status === "verified" ? "status verified" : "status pending"}>
              {section.status === "verified" ? "Resume verified" : "Needs final copy"}
            </span>
          </div>
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
        <div className="reward-nav">
          <button
            type="button"
            className={previousLocked ? "continue-button locked" : "continue-button"}
            onClick={previousUnlocked || browseMode ? onPrev : undefined}
            disabled={!previousSection}
            aria-disabled={previousLocked ? true : undefined}
          >
            {previousSection
              ? previousLocked
                ? `Lvl ${previousSection.level} locked`
                : `Prev: ${previousSection.title}`
              : "No previous"}
          </button>
          <button type="button" className="continue-button primary" onClick={onContinue}>
            {previewMode
              ? "Back to game"
              : mode === "browse"
                ? "Back to home"
                : allUnlocked
                  ? "Back to game"
                  : "Continue"}
          </button>
          <button
            type="button"
            className={nextLocked ? "continue-button locked" : "continue-button"}
            onClick={nextUnlocked || browseMode ? onNext : undefined}
            disabled={!nextSection}
            aria-disabled={nextLocked ? true : undefined}
          >
            {nextSection
              ? nextLocked
                ? `Lvl ${nextSection.level} locked - play to unlock`
                : `Next: ${nextSection.title}`
              : "No next"}
          </button>
        </div>
      </article>
    </section>
  );
}

function MemoryLog({
  open,
  mode,
  unlocked,
  selectedId,
  onClose,
  onSelect,
  onReset,
  onHome,
  onPreview,
}: {
  open: boolean;
  mode: Exclude<AppMode, "intro">;
  unlocked: PortfolioSectionId[];
  selectedId: PortfolioSectionId | null;
  onClose: () => void;
  onSelect: (sectionId: PortfolioSectionId) => void;
  onReset: () => void;
  onHome: () => void;
  onPreview: () => void;
}) {
  const browseMode = mode === "browse";
  const previewMode = mode === "preview";

  return (
    <aside
      className={`${browseMode || previewMode ? "quest-log browse-log" : "quest-log"} ${open || browseMode || previewMode ? "open" : ""}`}
      aria-label="Memory shard logs"
    >
      <div className="sidebar-header">
        <h2>{browseMode || previewMode ? "All Memories" : "Memory Shards"}</h2>
        <button
          type="button"
          className="icon-button sidebar-preview"
          onClick={onPreview}
          aria-label={previewMode ? "go back to game mode" : "preview mode"}
          title={previewMode ? "go back to game mode" : "preview mode"}
        >
          {previewMode ? "⤢" : "⛶"}
        </button>
        {browseMode || previewMode ? null : (
          <button type="button" className="icon-button close-log" onClick={onClose} aria-label="Close log">
            ×
          </button>
        )}
      </div>
      <span className="counter">
        {browseMode || previewMode ? sections.length : unlocked.length}/{sections.length}
      </span>
      <div className="sidebar-actions">
        <button type="button" onClick={onHome}>
          Home
        </button>
        <button type="button" onClick={onReset}>
          {browseMode || previewMode ? "Start game" : "Reset"}
        </button>
      </div>
      <nav className="treasure-list" aria-label="Unlocked treasure boxes">
        {sections.map((section) => {
          const isUnlocked = browseMode || previewMode || unlocked.includes(section.id);
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
              <small>{isUnlocked ? section.title : "Play to unlock"}</small>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function CompletionOverlay({
  onPreview,
  onClose,
}: {
  onPreview: () => void;
  onClose: () => void;
}) {
  return (
    <section className="completion-overlay" aria-live="polite">
      <article className="completion-card">
        <div className="completion-avatar" aria-hidden="true">
          <span className="pixelart-to-css" />
        </div>
        <div className="completion-copy">
          <h2>Hurray!</h2>
          <p>
            Thank you for helping me unlock every memory shard. My forest trail is complete, and
            Anjana&apos;s portfolio is fully restored.
          </p>
          <div className="completion-actions">
            <button type="button" className="continue-button primary" onClick={onPreview}>
              View complete portfolio
            </button>
            <button type="button" className="continue-button" onClick={onClose}>
              Stay in game
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

function App() {
  const [mode, setMode] = useState<AppMode>("intro");
  const [unlocked, setUnlocked] = useState<PortfolioSectionId[]>(readStoredUnlocks);
  const [selectedId, setSelectedId] = useState<PortfolioSectionId | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [gameRun, setGameRun] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const currentLevel = useMemo(() => {
    const next = gameLevels.find((level) => !unlocked.includes(level.id));
    return next ?? gameLevels[gameLevels.length - 1];
  }, [unlocked]);

  const selectedSection =
    sections.find((section) => {
      if (section.id !== selectedId) return false;
      if (mode === "browse" || mode === "preview") return true;
      return unlocked.includes(section.id);
    }) ?? null;
  const selectedIndex = selectedSection
    ? sections.findIndex((section) => section.id === selectedSection.id)
    : -1;
  const previousSection = selectedIndex > 0 ? sections[selectedIndex - 1] : null;
  const nextSection =
    selectedIndex >= 0 && selectedIndex < sections.length - 1 ? sections[selectedIndex + 1] : null;
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
      if (next.length === sectionOrder.length) {
        setShowCompletion(true);
      }
      return next;
    });
  }, []);

  const openBrowseMode = () => {
    setMode("browse");
    setSelectedId("about");
    setLogOpen(false);
  };

  const resetQuest = () => {
    persistUnlocks([]);
    setSelectedId(null);
    setLogOpen(false);
    setShowCompletion(false);
    setGameRun((run) => run + 1);
    setMode("game");
  };

  const enterQuest = () => {
    setMode("game");
    setSelectedId(null);
    setShowCompletion(false);
  };

  const goHome = () => {
    setMode("intro");
    setSelectedId(null);
    setLogOpen(false);
    setShowCompletion(false);
  };

  const restartLevel = () => {
    setSelectedId(null);
    setShowCompletion(false);
    setGameRun((run) => run + 1);
  };

  const enterPreviewMode = () => {
    const firstVisible = selectedId ?? unlocked[0] ?? sectionOrder[0];
    setSelectedId(firstVisible);
    setMode("preview");
    setLogOpen(false);
    setShowCompletion(false);
  };

  const leavePreviewMode = () => {
    setMode("game");
    setSelectedId(null);
    setLogOpen(false);
  };

  const selectFromLog = (sectionId: PortfolioSectionId) => {
    setSelectedId(sectionId);
    if (mode === "game") {
      setLogOpen(false);
    }
  };

  const moveSelected = (direction: -1 | 1) => {
    if (selectedIndex < 0) return;
    const destination = sections[selectedIndex + direction];
    if (destination && (mode === "browse" || mode === "preview" || unlocked.includes(destination.id))) {
      setSelectedId(destination.id);
    }
  };

  if (mode === "intro") {
    return <IntroScreen onEnterQuest={enterQuest} onOpenMemories={openBrowseMode} />;
  }

  return (
    <main
      className={
        mode === "preview"
          ? "game-screen preview-screen"
          : mode === "browse"
            ? "game-screen browse-screen"
            : "game-screen"
      }
    >
      <MemoryQuestGame
        key={`${currentLevel.id}-${gameRun}`}
        level={currentLevel}
        reducedMotion={false}
        onComplete={unlockSection}
        paused={mode === "browse" || mode === "preview"}
      />

      <div className={mode === "browse" || mode === "preview" ? "game-overlay-hud browse-hidden" : "game-overlay-hud"}>
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
        <button type="button" className="hud-button restart-level" onClick={restartLevel}>
          Restart level
        </button>
      </div>

      <MemoryLog
        open={logOpen}
        mode={mode}
        unlocked={unlocked}
        selectedId={selectedId}
        onClose={() => setLogOpen(false)}
        onSelect={selectFromLog}
        onReset={resetQuest}
        onHome={goHome}
        onPreview={mode === "preview" ? leavePreviewMode : enterPreviewMode}
      />

      {showCompletion && allUnlocked && mode === "game" && !selectedSection ? (
        <CompletionOverlay onPreview={enterPreviewMode} onClose={() => setShowCompletion(false)} />
      ) : null}

      {selectedSection ? (
        <RewardOverlay
          section={selectedSection}
          mode={mode}
          position={Math.max(1, selectedIndex + 1)}
          total={sections.length}
          previousSection={previousSection}
          nextSection={nextSection}
          previousUnlocked={Boolean(previousSection && unlocked.includes(previousSection.id))}
          nextUnlocked={Boolean(nextSection && unlocked.includes(nextSection.id))}
          onPrev={() => moveSelected(-1)}
          onNext={() => moveSelected(1)}
          onClose={
            mode === "preview"
              ? leavePreviewMode
              : mode === "browse"
                ? goHome
                : () => setSelectedId(null)
          }
          allUnlocked={allUnlocked}
          onContinue={
            mode === "preview"
              ? leavePreviewMode
              : mode === "browse"
                ? goHome
                : () => setSelectedId(null)
          }
          onPreview={enterPreviewMode}
        />
      ) : null}
    </main>
  );
}

export default App;
