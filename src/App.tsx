import { useCallback, useMemo, useState } from "react";
import { gameLevels, sectionOrder, sections } from "./data/portfolio";
import type { PortfolioSectionId } from "./data/portfolio";
import { MemoryQuestGame } from "./game/MemoryQuestGame";

const storageKey = "anjana-memory-unlocks";

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

function App() {
  const [unlocked, setUnlocked] = useState<PortfolioSectionId[]>(readStoredUnlocks);
  const [selectedId, setSelectedId] = useState<PortfolioSectionId>("about");
  const [reducedMotion, setReducedMotion] = useState(false);

  const currentLevel = useMemo(() => {
    const next = gameLevels.find((level) => !unlocked.includes(level.id));
    return next ?? gameLevels[gameLevels.length - 1];
  }, [unlocked]);

  const selectedSection = sections.find((section) => section.id === selectedId) ?? sections[0];
  const allUnlocked = unlocked.length === sections.length;

  const persistUnlocks = useCallback((nextUnlocks: PortfolioSectionId[]) => {
    setUnlocked(nextUnlocks);
    window.localStorage.setItem(storageKey, JSON.stringify(nextUnlocks));
  }, []);

  const unlockSection = useCallback(
    (sectionId: PortfolioSectionId) => {
      setSelectedId(sectionId);
      setUnlocked((current) => {
        if (current.includes(sectionId)) return current;
        const next = sectionOrder.filter((id) => [...current, sectionId].includes(id));
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const unlockAll = () => {
    persistUnlocks([...sectionOrder]);
    setSelectedId("about");
  };

  const resetQuest = () => {
    persistUnlocks([]);
    setSelectedId("about");
  };

  const visibleRewards = sections.filter((section) => unlocked.includes(section.id));
  const nextLevelLabel = allUnlocked
    ? "All memories restored"
    : `Next reward: ${currentLevel.rewardName}`;

  return (
    <main className="app-shell">
      <section className="hero-stage" aria-label="Game portfolio">
        <div className="story-panel">
          <p className="eyebrow">Anjana Venugopalan presents</p>
          <h1>Memory Quest</h1>
          <p>
            Anjana is lost in the trance of a mystic forest. Help her run
            through the woods, dodge thorn stumps, collect memory shards, and
            rediscover each part of her story.
          </p>
          <div className="control-grid" aria-label="Game controls">
            <span>Move</span>
            <strong>Arrow keys / A-D</strong>
            <span>Jump</span>
            <strong>Space / W / Up</strong>
          </div>
        </div>

        <div className="game-frame">
          <div className="game-topbar">
            <span>{nextLevelLabel}</span>
            <label className="motion-toggle">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(event) => setReducedMotion(event.target.checked)}
              />
              Calm motion
            </label>
          </div>
          <MemoryQuestGame
            level={currentLevel}
            reducedMotion={reducedMotion}
            onComplete={unlockSection}
          />
        </div>
      </section>

      <aside className="memory-sidebar" aria-label="Unlocked memory rewards">
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">Reward Log</p>
            <h2>Recovered Memories</h2>
          </div>
          <span className="counter">
            {unlocked.length}/{sections.length}
          </span>
        </div>

        <div className="sidebar-actions">
          <button type="button" onClick={unlockAll}>
            Unlock all
          </button>
          <button type="button" onClick={resetQuest}>
            Reset
          </button>
        </div>

        <nav className="reward-list" aria-label="Portfolio section rewards">
          {sections.map((section) => {
            const isUnlocked = unlocked.includes(section.id);
            const isActive = selectedId === section.id;
            return (
              <button
                type="button"
                key={section.id}
                className={isActive ? "active" : ""}
                disabled={!isUnlocked}
                onClick={() => setSelectedId(section.id)}
              >
                <span>Lvl {section.level}</span>
                <strong>{section.rewardName}</strong>
                <small>{isUnlocked ? section.title : "Locked memory"}</small>
              </button>
            );
          })}
        </nav>

        {visibleRewards.length === 0 ? (
          <p className="empty-state">
            Complete the first short run or unlock all to open Anjana's
            portfolio memories.
          </p>
        ) : null}
      </aside>

      <section className="reward-detail" aria-live="polite">
        <div className="reward-card">
          <div className="reward-card-header">
            <div>
              <p className="eyebrow">Unlocked Section</p>
              <h2>{selectedSection.title}</h2>
            </div>
            <span
              className={
                selectedSection.status === "verified"
                  ? "status verified"
                  : "status pending"
              }
            >
              {selectedSection.status === "verified" ? "Resume verified" : "Needs final copy"}
            </span>
          </div>
          <p className="summary">{selectedSection.summary}</p>
          <ul>
            {selectedSection.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
          <div className="tag-row">
            {selectedSection.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
