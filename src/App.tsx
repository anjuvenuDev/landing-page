import { useCallback, useEffect, useMemo, useState } from "react";
import { gameLevels, sectionOrder, sections } from "./data/portfolio";
import type { PortfolioSection, PortfolioSectionId } from "./data/portfolio";
import { MemoryQuestGame } from "./game/MemoryQuestGame";

const storageKey = "anjana-memory-unlocks";

type AppMode = "intro" | "game" | "browse" | "preview" | "slides";

const narrationLines = [
  "I wake inside a forest that feels older than memory.",
  "The trees know my name, but I cannot remember why I came here.",
  "Every path is guarded by a small trial: a jump, a choice, a shard of myself.",
  "If I open the treasure boxes, my memories return as pieces of my portfolio.",
  "Come with me through the woods. Help me remember who I am becoming.",
];

const inventoryAssets = {
  chest: "/assets/sunnyland/chest.png",
  crate: "/assets/sunnyland/crate-ornate.png",
  plainCrate: "/assets/sunnyland/crate-plain.png",
};

const highlightPhrases = [
  "SSN College of Engineering",
  "5 Year Integrated M.Tech CSE",
  "artificial intelligence",
  "full-stack development",
  "product engineering",
  "computer vision",
  "meaningful impact",
  "AI-powered",
  "Raspberry Pi",
  "React.js",
  "TypeScript",
  "Node.js",
  "MongoDB",
  "Tailwind CSS",
  "REST APIs",
  "npm package",
  "Python CLI",
  "Friday Intellytics",
  "Yhills",
  "NoShack Solutions",
  "Arch Linux",
  "GirlScript Summer of Code",
  "GSSoC",
  "IEEE Women in Engineering",
  "SSN ACE",
  "SSN Coding Club",
  "Gradient Design Club",
  "public art exhibition",
  "3rd Department Rank",
  "CGPA of 9.237/10",
  "Smart India Hackathon",
  "Top 15%",
  "Kaggle",
  "School Pupil Leader",
].sort((a, b) => b.length - a.length);

const highlightRegex = new RegExp(
  `(${highlightPhrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "gi",
);

const contributionLevels = [
  0, 2, 3, 0, 1, 4, 2, 0, 3, 1, 0, 2, 4, 3, 0, 1, 2, 0, 3, 4,
  1, 3, 4, 2, 0, 2, 3, 1, 4, 0, 2, 4, 3, 1, 0, 2, 3, 1, 4, 0,
  2, 4, 1, 0, 3, 2, 4, 1, 0, 3, 2, 0, 1, 4, 3, 2, 0, 1, 3, 4,
  0, 2, 3, 4, 1, 0, 2, 1, 3, 4, 0, 2, 1, 3, 0, 4, 2, 1, 3, 0,
  3, 1, 0, 2, 4, 3, 1, 0, 2, 1, 4, 3, 0, 2, 4, 1, 0, 3, 2, 1,
  1, 0, 3, 4, 2, 1, 0, 2, 3, 1, 0, 4, 2, 3, 1, 0, 2, 4, 3, 1,
  2, 4, 3, 1, 0, 2, 1, 3, 4, 0, 2, 1, 3, 4, 2, 0, 1, 3, 4, 2,
];

function HighlightText({ text }: { text: string }) {
  return (
    <>
      {text.split(highlightRegex).map((part, index) => {
        const isHighlighted = highlightPhrases.some((phrase) => phrase.toLowerCase() === part.toLowerCase());
        return isHighlighted ? (
          <strong className="text-highlight" key={`${part}-${index}`}>
            {part}
          </strong>
        ) : (
          part
        );
      })}
    </>
  );
}

function ProjectContributionBoard() {
  return (
    <div className="project-portal contribution-board" aria-hidden="true">
      <div className="contribution-months">
        {["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
      <div className="contribution-grid">
        {contributionLevels.map((level, index) => (
          <span className={`contribution-cell level-${level}`} key={`${level}-${index}`} />
        ))}
      </div>
      <div className="contribution-caption">
        <span className="github-glyph">GH</span>
        <span>repositories, commits, experiments</span>
      </div>
    </div>
  );
}

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

function requestBrowserFullscreen() {
  const target = document.documentElement;
  if (target.requestFullscreen) {
    void target.requestFullscreen().catch(() => undefined);
  }
}

function exitBrowserFullscreen() {
  if (document.fullscreenElement && document.exitFullscreen) {
    void document.exitFullscreen().catch(() => undefined);
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
  onSkipToProfile,
}: {
  onEnterQuest: () => void;
  onSkipToProfile: () => void;
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
            <button type="button" onClick={onSkipToProfile}>
              Skip to profile
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

function PortfolioVisual({ section }: { section: PortfolioSection }) {
  if (section.images?.length) {
    return (
      <div className={`image-collage collage-${section.id}`} aria-label={`${section.title} photos`}>
        {section.images.map((image) => (
          <figure className={`portfolio-photo-frame photo-${image.variant ?? "wide"} media-${section.id}`} key={image.src}>
            <img src={image.src} alt={image.alt} style={{ objectPosition: image.position }} />
          </figure>
        ))}
      </div>
    );
  }

  if (section.image) {
    return (
      <figure className={`portfolio-photo-frame photo-${section.image.variant ?? "wide"} media-${section.id}`}>
        <img src={section.image.src} alt={section.image.alt} style={{ objectPosition: section.image.position }} />
      </figure>
    );
  }

  if (section.layout === "projects") {
    return <ProjectContributionBoard />;
  }

  if (section.timeline?.length) {
    return (
      <div className="company-stack" aria-label="Work experience companies">
        {section.timeline.map((step) => (
          <div className="company-token" key={step.company}>
            <img src={step.logo} alt={`${step.company} logo`} />
            <span>{step.company}</span>
          </div>
        ))}
      </div>
    );
  }

  return <SectionIllustration section={section} />;
}

function PortfolioLinks({ section }: { section: PortfolioSection }) {
  return (
    <>
      {section.links?.length ? (
        <div className="link-row" aria-label={`${section.title} links`}>
          {section.links.map((link) => (
            <a className={`portfolio-link link-${link.type}`} key={link.href} href={link.href} target="_blank" rel="noreferrer">
              <span className="link-icon" aria-hidden="true">
                {link.type === "github" || link.type === "profile" ? "GH" : link.type === "social" ? "IG" : "GO"}
              </span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      ) : null}
      <div className="tag-row">
        {section.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </>
  );
}

function InventoryToken({ type = "crate" }: { type?: keyof typeof inventoryAssets }) {
  return <img className="inventory-token" src={inventoryAssets[type]} alt="" aria-hidden="true" />;
}

function FeatureCards({ section }: { section: PortfolioSection }) {
  if (!section.featureCards?.length) return null;

  return (
    <div className="feature-card-grid">
      {section.featureCards.map((card) => (
        <article className="feature-card" key={`${card.title}-${card.label ?? ""}`}>
          <InventoryToken />
          <div>
            <h3>{card.title}</h3>
            <p>
              <HighlightText text={card.body} />
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProjectCards({ section }: { section: PortfolioSection }) {
  if (!section.projectCards?.length) return null;

  return (
    <div className="project-card-grid">
      {section.projectCards.map((project) => (
        <article className="project-card" key={project.title}>
          <div className="project-card-head">
            <InventoryToken type="chest" />
            <div>
              <h3>{project.title}</h3>
              <p className="project-role">{project.role}</p>
            </div>
          </div>
          <p>
            <HighlightText text={project.description} />
          </p>
          {project.details?.length ? (
            <ul className="compact-list project-detail-list">
              {project.details.map((detail) => (
                <li key={detail}>
                  <HighlightText text={detail} />
                </li>
              ))}
            </ul>
          ) : null}
          <div className="stack-row">
            {project.stack.map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </div>
          <div className="link-row project-links" aria-label={`${project.title} links`}>
            {project.links.map((link) => (
              <a className={`portfolio-link link-${link.type}`} key={link.href} href={link.href} target="_blank" rel="noreferrer">
                <span className="link-icon" aria-hidden="true">
                  {link.type === "github" || link.type === "profile" ? "GH" : link.type === "package" ? "NPM" : "GO"}
                </span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function WorkRoadmap({ section }: { section: PortfolioSection }) {
  if (!section.timeline?.length) return null;

  return (
    <div className="work-roadmap">
      {section.timeline.map((step) => (
        <article className="work-step" key={step.company}>
          <div className="work-step-head">
            <img src={step.logo} alt={`${step.company} logo`} />
            <div>
              <h3>{step.company}</h3>
              <p className="work-meta">
                {step.role} · {step.dates}
              </p>
            </div>
          </div>
          <strong>
            <HighlightText text={step.focus} />
          </strong>
          <ul className="compact-list">
            {step.details.map((detail) => (
              <li key={detail}>
                <HighlightText text={detail} />
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function SkillWall({ section }: { section: PortfolioSection }) {
  if (!section.skillGroups?.length) return null;

  return (
    <div className="skill-wall">
      {section.skillGroups.map((group) => (
        <section className="skill-group" key={group.title}>
          <div className="skill-group-head">
            <InventoryToken type="plainCrate" />
            <h3>{group.title}</h3>
          </div>
          <div>
            {group.items.map((item) => (
              <span className="skill-brick" key={item}>
                {item}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MemoryHighlights({ section }: { section: PortfolioSection }) {
  if (!section.highlights.length) return null;

  return (
    <ul className="memory-highlights">
      {section.highlights.map((highlight) => (
        <li key={highlight}>
          <InventoryToken type="plainCrate" />
          <span>
            <HighlightText text={highlight} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function PortfolioMap({
  activeId,
  unlocked,
  onSelect,
  onHome,
}: {
  activeId: PortfolioSectionId;
  unlocked: PortfolioSectionId[];
  onSelect: (sectionId: PortfolioSectionId) => void;
  onHome: () => void;
}) {
  return (
    <aside className="portfolio-map" aria-label="Portfolio game map">
      <h2>Game Map</h2>
      <nav className="portfolio-map-path" aria-label="Memory map">
        {sections.map((section, index) => {
          const isUnlocked = unlocked.includes(section.id);
          const isActive = section.id === activeId;
          return (
            <button
              type="button"
              className={`map-node node-${index + 1}${isActive ? " active" : ""}`}
              key={section.id}
              disabled={!isUnlocked}
              onClick={() => onSelect(section.id)}
            >
              <span className="map-node-pad">
                <img src={isActive ? "/assets/sunnyland/chest.png" : "/assets/sunnyland/crate-ornate.png"} alt="" />
              </span>
              <strong>{section.level}: {section.rewardName.replace("Memory of ", "")}</strong>
              <small>{isUnlocked ? section.title : "Play to unlock"}</small>
            </button>
          );
        })}
      </nav>
      <div className="portfolio-map-actions">
        <button type="button" onClick={onHome} aria-label="Home">
          <span className="map-action-icon">⌂</span>
          Home
        </button>
        <span className="map-action-chip" aria-label="Game guide">
          <span className="map-action-icon">◈</span>
          Guide
        </span>
        <span className="map-action-chip" aria-label="Quest log">
          <span className="map-action-icon">▣</span>
          Log
        </span>
      </div>
    </aside>
  );
}

function PortfolioCopy({ section }: { section: PortfolioSection }) {
  const aboutParagraph =
    section.id === "about" && section.story?.length
      ? [section.summary, ...section.story].join(" ")
      : null;

  return (
    <div className="portfolio-copy">
      <div className="portfolio-narrative">
        {aboutParagraph ? (
          <p className="summary about-single-paragraph">
            <HighlightText text={aboutParagraph} />
          </p>
        ) : (
          <p className="summary">
            <HighlightText text={section.summary} />
          </p>
        )}
        {!aboutParagraph && section.story?.length ? (
          <div className="story-lines">
            {section.story.map((line) => (
              <p key={line}>
                <HighlightText text={line} />
              </p>
            ))}
          </div>
        ) : null}
      </div>
      <div className="portfolio-primary">
        <ProjectCards section={section} />
        <WorkRoadmap section={section} />
        <SkillWall section={section} />
        <FeatureCards section={section} />
      </div>
      <div className="portfolio-secondary">
        <PortfolioLinks section={section} />
        <MemoryHighlights section={section} />
      </div>
    </div>
  );
}

function PortfolioContent({
  section,
  mode,
}: {
  section: PortfolioSection;
  mode: "preview" | "slide";
}) {
  return (
    <div className={`portfolio-content portfolio-${section.layout} portfolio-${mode} section-${section.id}`}>
      <div className="portfolio-media">
        <PortfolioVisual section={section} />
      </div>
      <PortfolioCopy section={section} />
    </div>
  );
}

function SidePreview({
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
  onFullscreen,
  unlocked,
  onSelectSection,
  onHome,
}: {
  section: PortfolioSection;
  mode: Exclude<AppMode, "intro" | "slides">;
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
  onFullscreen: () => void;
  unlocked: PortfolioSectionId[];
  onSelectSection: (sectionId: PortfolioSectionId) => void;
  onHome: () => void;
}) {
  const previewMode = mode === "preview";
  const previousLocked = previousSection && !previousUnlocked;
  const nextLocked = nextSection && !nextUnlocked;

  return (
    <section className="side-preview" aria-live="polite">
      <PortfolioMap activeId={section.id} unlocked={unlocked} onSelect={onSelectSection} onHome={onHome} />
      <article className="side-preview-panel reward-reveal" key={section.id}>
        <button type="button" className="preview-close" onClick={onClose} aria-label="Close memory view">
          x
        </button>
        <button
          type="button"
          className="preview-expand"
          onClick={onFullscreen}
          aria-label="Open fullscreen preview"
          title="preview mode"
        >
          ⛶
        </button>
        <div className="side-preview-header">
          <h2>{section.title}</h2>
          <div className="quest-progress" aria-label={`Memory ${position} of ${total}`}>
            <span>Quest Progress</span>
            <div>
              <i style={{ width: `${(position / total) * 100}%` }} />
            </div>
            <strong>{position}/{total}</strong>
          </div>
        </div>
        <PortfolioContent section={section} mode="preview" />
        <div className="side-preview-nav">
          <button
            type="button"
            className={previousLocked ? "continue-button locked" : "continue-button"}
            onClick={previousUnlocked ? onPrev : undefined}
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
              ? "Play again"
              : mode === "browse"
                ? "Back to home"
                : allUnlocked
                  ? "Play again"
                  : "Continue"}
          </button>
          <button
            type="button"
            className={nextLocked ? "continue-button locked" : "continue-button"}
            onClick={nextUnlocked ? onNext : undefined}
            disabled={!nextSection}
            aria-disabled={nextLocked ? true : undefined}
          >
            {nextSection
              ? nextLocked
                ? `Lvl ${nextSection.level} locked - play to unlock`
                : `Next: ${nextSection.title}`
              : "Play to unlock"}
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
}: {
  open: boolean;
  mode: Exclude<AppMode, "intro" | "slides">;
  unlocked: PortfolioSectionId[];
  selectedId: PortfolioSectionId | null;
  onClose: () => void;
  onSelect: (sectionId: PortfolioSectionId) => void;
  onReset: () => void;
  onHome: () => void;
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
        {browseMode || previewMode ? null : (
          <button type="button" className="icon-button close-log" onClick={onClose} aria-label="Close log">
            ×
          </button>
        )}
      </div>
      <span className="counter">
        {unlocked.length}/{sections.length}
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
              <small>{isUnlocked ? section.title : "Play to unlock"}</small>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function FullscreenSlides({
  section,
  position,
  total,
  previousSection,
  nextSection,
  onPrev,
  onNext,
  onExit,
}: {
  section: PortfolioSection;
  position: number;
  total: number;
  previousSection: PortfolioSection | null;
  nextSection: PortfolioSection | null;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}) {
  return (
    <section className="portfolio-slides" aria-label="Portfolio preview">
      <button
        type="button"
        className="slide-mode-button"
        onClick={onExit}
        aria-label="go back to game mode"
        title="go back to game mode"
      >
        ⤢
      </button>
      <button
        type="button"
        className="slide-arrow slide-prev"
        onClick={onPrev}
        disabled={!previousSection}
        aria-label="Previous slide"
      >
        &lt;
      </button>
      <article className="slide-page" key={section.id}>
        <header className="slide-header">
          <h2>{section.title}</h2>
          <span aria-label={`Memory ${position} of ${total}`}>{position}/{total}</span>
        </header>
        <PortfolioContent section={section} mode="slide" />
      </article>
      <button
        type="button"
        className="slide-arrow slide-next"
        onClick={onNext}
        disabled={!nextSection}
        aria-label="Next slide"
      >
        &gt;
      </button>
    </section>
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
  const [replayLevelId, setReplayLevelId] = useState<PortfolioSectionId | null>(null);

  const currentLevel = useMemo(() => {
    const next = gameLevels.find((level) => !unlocked.includes(level.id));
    return next ?? gameLevels[gameLevels.length - 1];
  }, [unlocked]);
  const displayedLevel = replayLevelId
    ? gameLevels.find((level) => level.id === replayLevelId) ?? currentLevel
    : currentLevel;
  const visibleSections = useMemo(
    () => sections.filter((section) => unlocked.includes(section.id)),
    [unlocked],
  );

  const selectedSection =
    sections.find((section) => {
      if (section.id !== selectedId) return false;
      return unlocked.includes(section.id);
    }) ?? null;
  const selectedIndex = selectedSection
    ? visibleSections.findIndex((section) => section.id === selectedSection.id)
    : -1;
  const previousSection = selectedIndex > 0 ? visibleSections[selectedIndex - 1] : null;
  const nextSection =
    selectedIndex >= 0 && selectedIndex < visibleSections.length - 1
      ? visibleSections[selectedIndex + 1]
      : null;
  const allUnlocked = unlocked.length === sections.length;

  const persistUnlocks = useCallback((nextUnlocks: PortfolioSectionId[]) => {
    setUnlocked(nextUnlocks);
    window.localStorage.setItem(storageKey, JSON.stringify(nextUnlocks));
  }, []);

  const unlockSection = useCallback((sectionId: PortfolioSectionId) => {
    setSelectedId(sectionId);
    setMode("preview");
    setLogOpen(false);
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

  const skipToProfile = () => {
    persistUnlocks([...sectionOrder]);
    setSelectedId(sectionOrder[0]);
    setMode("slides");
    setLogOpen(false);
    setShowCompletion(false);
    requestBrowserFullscreen();
  };

  const resetQuest = () => {
    persistUnlocks([]);
    setSelectedId(null);
    setLogOpen(false);
    setShowCompletion(false);
    setReplayLevelId(null);
    setGameRun((run) => run + 1);
    setMode("game");
  };

  const enterQuest = () => {
    setMode("game");
    setSelectedId(null);
    setShowCompletion(false);
    setReplayLevelId(null);
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

  const replaySelectedLevel = () => {
    if (!selectedSection) return;
    setReplayLevelId(selectedSection.id);
    setSelectedId(null);
    setLogOpen(false);
    setShowCompletion(false);
    setMode("game");
    setGameRun((run) => run + 1);
  };

  const getFirstVisibleSectionId = () =>
    selectedId && unlocked.includes(selectedId) ? selectedId : unlocked[0] ?? null;

  const leavePreviewMode = () => {
    setMode("game");
    setSelectedId(null);
    setLogOpen(false);
    setReplayLevelId(null);
  };

  const enterSlidesMode = () => {
    const firstVisible = getFirstVisibleSectionId();
    if (!firstVisible) return;
    setSelectedId(firstVisible);
    setMode("slides");
    setLogOpen(false);
    setShowCompletion(false);
    requestBrowserFullscreen();
  };

  const leaveSlidesMode = () => {
    if (!selectedId) {
      setSelectedId(getFirstVisibleSectionId());
    }
    setMode("preview");
    setLogOpen(false);
    exitBrowserFullscreen();
  };

  const selectFromLog = (sectionId: PortfolioSectionId) => {
    setSelectedId(sectionId);
    if (mode === "game") {
      setMode("preview");
      setLogOpen(false);
    }
  };

  const moveSelected = (direction: -1 | 1) => {
    if (selectedIndex < 0) return;
    const destination = visibleSections[selectedIndex + direction];
    if (destination) {
      setSelectedId(destination.id);
    }
  };

  useEffect(() => {
    if (mode !== "slides") return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const destination = visibleSections[selectedIndex - 1];
        if (destination) setSelectedId(destination.id);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        const destination = visibleSections[selectedIndex + 1];
        if (destination) setSelectedId(destination.id);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        exitBrowserFullscreen();
        setMode("preview");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, selectedIndex, visibleSections]);

  useEffect(() => {
    if (mode !== "slides") return undefined;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setMode("preview");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [mode]);

  if (mode === "intro") {
    return <IntroScreen onEnterQuest={enterQuest} onSkipToProfile={skipToProfile} />;
  }

  return (
    <main
      className={
        mode === "preview"
          ? "game-screen preview-screen"
          : mode === "slides"
            ? "game-screen slide-screen"
          : mode === "browse"
            ? "game-screen browse-screen"
            : "game-screen"
      }
    >
      <MemoryQuestGame
        key={`${displayedLevel.id}-${gameRun}`}
        level={displayedLevel}
        reducedMotion={false}
        onComplete={unlockSection}
        paused={mode === "browse" || mode === "preview" || mode === "slides"}
      />

      <div
        className={
          mode === "browse" || mode === "preview" || mode === "slides"
            ? "game-overlay-hud browse-hidden"
            : "game-overlay-hud"
        }
      >
        <button
          type="button"
          className="icon-button log-toggle"
          onClick={() => setLogOpen((open) => !open)}
          aria-label="Open memory log"
        >
          ☰
        </button>
        <div className="hud-right">
          <div className="hud-actions">
            <div className="objective-pill">
              {allUnlocked ? "All memories restored" : `Next: ${currentLevel.rewardName}`}
            </div>
            <button
              type="button"
              className="icon-button restart-level"
              onClick={restartLevel}
              aria-label="Restart level"
              title="Restart level"
            >
              ↻
            </button>
          </div>
          <div className="controls-hint">Move: arrows/A-D · Jump: space/W/up</div>
        </div>
      </div>

      {mode !== "slides" && mode !== "preview" ? (
        <MemoryLog
          open={logOpen}
          mode={mode}
          unlocked={unlocked}
          selectedId={selectedId}
          onClose={() => setLogOpen(false)}
          onSelect={selectFromLog}
          onReset={resetQuest}
          onHome={goHome}
        />
      ) : null}

      {showCompletion && allUnlocked && mode === "game" && !selectedSection ? (
        <CompletionOverlay onPreview={enterSlidesMode} onClose={() => setShowCompletion(false)} />
      ) : null}

      {selectedSection && mode === "slides" ? (
        <FullscreenSlides
          section={selectedSection}
          position={Math.max(1, selectedIndex + 1)}
          total={visibleSections.length}
          previousSection={previousSection}
          nextSection={nextSection}
          onPrev={() => moveSelected(-1)}
          onNext={() => moveSelected(1)}
          onExit={leaveSlidesMode}
        />
      ) : null}

      {selectedSection && mode !== "slides" ? (
        <SidePreview
          section={selectedSection}
          mode={mode}
          position={Math.max(1, selectedIndex + 1)}
          total={visibleSections.length}
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
              ? replaySelectedLevel
              : mode === "browse"
                ? goHome
                : allUnlocked
                  ? replaySelectedLevel
                  : () => setSelectedId(null)
          }
          onFullscreen={enterSlidesMode}
          unlocked={unlocked}
          onSelectSection={selectFromLog}
          onHome={goHome}
        />
      ) : null}
    </main>
  );
}

export default App;
