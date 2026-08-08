import { useCallback, useEffect, useMemo, useState } from "react";
import { gameLevels, sectionOrder, sections } from "./data/portfolio";
import type { PortfolioLinkType, PortfolioSection, PortfolioSectionId } from "./data/portfolio";
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
  "M.Tech. Integrated",
  "Department Rank: 3",
  "artificial intelligence",
  "full-stack development",
  "product engineering",
  "computer vision",
  "meaningful impact",
  "Product & Growth",
  "Product Discovery",
  "Requirements Analysis",
  "Feature Prioritization",
  "User / Problem Analysis",
  "Data Analysis",
  "Statistical Analysis",
  "Quantitative Problem Solving",
  "Data Visualization",
  "AI-powered",
  "AI-agent development",
  "system design",
  "product ideation",
  "25+ candidates",
  "6-hour evaluation",
  "desktop application",
  "data integration",
  "authentication",
  "exports",
  "UI workflows",
  "stakeholder discovery",
  "beta registration",
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
  "SSN Design Club",
  "16-member Core Committee",
  "Invente",
  "WISE 2025",
  "ACM Hour of Code",
  "US$250",
  "GirlScript Summer of Code",
  "GSSoC",
  "IEEE Women in Engineering",
  "SSN ACE",
  "SSN Coding Club",
  "Gradient Design Club",
  "public art exhibition",
  "3rd Department Rank",
  "1st Place",
  "MIT Tech Symposium 2026",
  "VIT Intercollegiate Tech Symposium",
  "Road-Aware Graph Attention Networks",
  "Rs. 8,000",
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
    <div className="qd-project-portal" aria-hidden="true">
      <div className="qd-contribution-months">
        {["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
      <div className="qd-contribution-grid">
        {contributionLevels.map((level, index) => (
          <span className={`qd-contribution-cell qd-level-${level}`} key={`${level}-${index}`} />
        ))}
      </div>
      <div className="qd-contribution-caption">
        <span className="qd-github-glyph">GH</span>
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

function readInitialExperience() {
  const storedUnlocks = readStoredUnlocks();
  const params = new URLSearchParams(window.location.search);
  const requestedSection = params.get("section") as PortfolioSectionId | null;
  const requestedView = params.get("view");
  const hasRequestedSection = requestedSection ? sectionOrder.includes(requestedSection) : false;

  if ((requestedView === "preview" || requestedView === "slides") && hasRequestedSection) {
    const unlocked =
      params.get("unlock") === "all"
        ? [...sectionOrder]
        : sectionOrder.filter((id) => storedUnlocks.includes(id) || id === requestedSection);

    return {
      mode: requestedView as AppMode,
      selectedId: requestedSection,
      unlocked,
    };
  }

  return {
    mode: "intro" as AppMode,
    selectedId: null as PortfolioSectionId | null,
    unlocked: storedUnlocks,
  };
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
    <div className={`qd-illustration qd-visual-${section.visual}`} aria-hidden="true">
      {section.visual === "map" ? (
        <>
          <span className="qd-map-node qd-start" />
          <span className="qd-map-node qd-college" />
          <span className="qd-map-node qd-product" />
          <span className="qd-map-path" />
        </>
      ) : null}
      {section.visual === "network" ? (
        <>
          <span className="qd-network-core" />
          <span className="qd-network-node qd-n1">CV</span>
          <span className="qd-network-node qd-n2">ML</span>
          <span className="qd-network-node qd-n3">API</span>
          <span className="qd-network-node qd-n4">CLI</span>
        </>
      ) : null}
      {section.visual === "timeline" ? (
        <>
          <span className="qd-timeline-line" />
          <span className="qd-timeline-dot qd-d1">NoShack</span>
          <span className="qd-timeline-dot qd-d2">Yhills</span>
          <span className="qd-timeline-dot qd-d3">Friday</span>
        </>
      ) : null}
      {section.visual === "skills" ? (
        <>
          <span className="qd-skill-bar qd-b1" />
          <span className="qd-skill-bar qd-b2" />
          <span className="qd-skill-bar qd-b3" />
          <span className="qd-skill-orbit qd-o1">TS</span>
          <span className="qd-skill-orbit qd-o2">SQL</span>
          <span className="qd-skill-orbit qd-o3">Py</span>
        </>
      ) : null}
      {section.visual === "compass" ? (
        <>
          <span className="qd-compass-ring" />
          <span className="qd-compass-needle" />
          <span className="qd-compass-label qd-north">Own</span>
          <span className="qd-compass-label qd-east">Lead</span>
          <span className="qd-compass-label qd-south">Ship</span>
          <span className="qd-compass-label qd-west">Listen</span>
        </>
      ) : null}
      {section.visual === "guilds" ? (
        <>
          <span className="qd-guild-banner qd-g1">ACE</span>
          <span className="qd-guild-banner qd-g2">WIE</span>
          <span className="qd-guild-banner qd-g3">ACM</span>
          <span className="qd-guild-banner qd-g4">MUN</span>
        </>
      ) : null}
      {section.visual === "garden" ? (
        <>
          <span className="qd-garden-stem qd-s1" />
          <span className="qd-garden-stem qd-s2" />
          <span className="qd-garden-stem qd-s3" />
          <span className="qd-garden-moon" />
        </>
      ) : null}
      {section.visual === "trophy" ? (
        <>
          <span className="qd-trophy-cup" />
          <span className="qd-trophy-base" />
          <span className="qd-spark qd-sp1" />
          <span className="qd-spark qd-sp2" />
          <span className="qd-spark qd-sp3" />
        </>
      ) : null}
    </div>
  );
}

function PortfolioVisual({ section }: { section: PortfolioSection }) {
  if (section.images?.length) {
    return (
      <div className={`qd-collage qd-collage-${section.id}`} aria-label={`${section.title} photos`}>
        {section.images.map((image) => (
          <figure className={`qd-photo qd-photo-${image.variant ?? "wide"} qd-media-${section.id}`} key={image.src}>
            <img src={image.src} alt={image.alt} style={{ objectPosition: image.position }} />
          </figure>
        ))}
      </div>
    );
  }

  if (section.image) {
    return (
      <figure className={`qd-photo qd-photo-${section.image.variant ?? "wide"} qd-media-${section.id}`}>
        <img src={section.image.src} alt={section.image.alt} style={{ objectPosition: section.image.position }} />
      </figure>
    );
  }

  if (section.layout === "projects") {
    return <ProjectContributionBoard />;
  }

  if (section.timeline?.length) {
    return (
      <div className="qd-company-stack" aria-label="Work experience companies">
        {section.timeline.map((step) => (
          <div className="qd-company-token" key={step.company}>
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
        <div className="qd-link-row" aria-label={`${section.title} links`}>
          {section.links.map((link) => (
            <a className={`qd-link qd-link-${link.type}`} key={link.href} href={link.href} target="_blank" rel="noreferrer">
              <span className="qd-link-icon" aria-hidden="true">
                <LinkGlyph type={link.type} />
              </span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      ) : null}
      <div className="qd-tag-row">
        {section.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </>
  );
}

function LinkGlyph({ type }: { type: PortfolioLinkType }) {
  if (type === "github" || type === "profile") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.86 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.8c-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.1-1.49-1.1-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.35 9.35 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.95.68 1.92v2.84c0 .27.18.59.69.49A10.23 10.23 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z"
        />
      </svg>
    );
  }

  if (type === "social") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth="2.4"
          d="M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5Z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          d="M15.4 12a3.4 3.4 0 1 1-6.8 0 3.4 3.4 0 0 1 6.8 0Z"
        />
        <path fill="currentColor" d="M17.4 6.3h1.9v1.9h-1.9z" />
      </svg>
    );
  }

  if (type === "package") {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path fill="currentColor" d="M3 6h18v12H3V6Zm3 3v6h3v-3h2v3h3V9h-3v3H9V9H6Zm11 0v6h2V9h-2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path fill="currentColor" d="M5 5h9v3H8v8h8v-6h3v9H5V5Zm10 0h4v4h-2V8.4l-6.3 6.3-1.4-1.4L15.6 7H15V5Z" />
    </svg>
  );
}

function InventoryToken({ type = "crate" }: { type?: keyof typeof inventoryAssets }) {
  return <img className="qd-token" src={inventoryAssets[type]} alt="" aria-hidden="true" />;
}

function FeatureCards({ section }: { section: PortfolioSection }) {
  if (!section.featureCards?.length) return null;

  return (
    <div className="qd-feature-grid">
      {section.featureCards.map((card) => (
        <article className="qd-feature-card" key={`${card.title}-${card.label ?? ""}`}>
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
    <div className="qd-project-grid">
      {section.projectCards.map((project) => (
        <article className="qd-project-card" key={project.title}>
          <div className="qd-project-card-head">
            <InventoryToken type="chest" />
            <div>
              <h3>{project.title}</h3>
              <p className="qd-project-role">{project.role}</p>
            </div>
          </div>
          <p>
            <HighlightText text={project.description} />
          </p>
          {project.details?.length ? (
            <ul className="qd-compact-list qd-project-detail-list">
              {project.details.map((detail) => (
                <li key={detail}>
                  <HighlightText text={detail} />
                </li>
              ))}
            </ul>
          ) : null}
          <div className="qd-stack-row">
            {project.stack.map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </div>
          <div className="qd-link-row qd-project-links" aria-label={`${project.title} links`}>
            {project.links.map((link) => (
              <a className={`qd-link qd-link-${link.type}`} key={link.href} href={link.href} target="_blank" rel="noreferrer">
                <span className="qd-link-icon" aria-hidden="true">
                  <LinkGlyph type={link.type} />
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
    <div className="qd-work-roadmap">
      {section.timeline.map((step) => (
        <article className="qd-work-step" key={step.company}>
          <div className="qd-work-step-head">
            <img src={step.logo} alt={`${step.company} logo`} />
            <div>
              <h3>{step.company}</h3>
              <p className="qd-work-meta">
                {step.role} · {step.dates}
              </p>
            </div>
          </div>
          <strong>
            <HighlightText text={step.focus} />
          </strong>
          <ul className="qd-compact-list">
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
    <div className="qd-skill-wall">
      {section.skillGroups.map((group) => (
        <section className="qd-skill-group" key={group.title}>
          <div className="qd-skill-group-head">
            <InventoryToken type="plainCrate" />
            <h3>{group.title}</h3>
          </div>
          <div>
            {group.items.map((item) => (
              <span className="qd-skill-brick" key={item}>
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
    <ul className="qd-note-grid">
      {section.highlights.map((highlight) => (
        <li className="qd-note" key={highlight}>
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

function NarrativeBlock({ section }: { section: PortfolioSection }) {
  const aboutParagraph =
    section.id === "about" && section.story?.length
      ? [section.summary, ...section.story].join(" ")
      : null;

  return (
    <div className="qd-story">
      {aboutParagraph ? (
        <p className="qd-summary qd-about-paragraph">
          <HighlightText text={aboutParagraph} />
        </p>
      ) : (
        <p className="qd-summary">
          <HighlightText text={section.summary} />
        </p>
      )}
      {!aboutParagraph && section.story?.length ? (
        <div className="qd-story-lines">
          {section.story.map((line) => (
            <p key={line}>
              <HighlightText text={line} />
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MemoryMain({ section }: { section: PortfolioSection }) {
  return (
    <div className="qd-main">
      <ProjectCards section={section} />
      <WorkRoadmap section={section} />
      <SkillWall section={section} />
      <FeatureCards section={section} />
    </div>
  );
}

function MemoryDetails({ section }: { section: PortfolioSection }) {
  return (
    <div className="qd-details">
      <div className="qd-actions">
        <PortfolioLinks section={section} />
      </div>
      <MemoryHighlights section={section} />
    </div>
  );
}

function PortfolioCopy({
  section,
  mode,
}: {
  section: PortfolioSection;
  mode: "preview" | "slide";
}) {
  return (
    <div className={`qd-copy qd-${section.id} qd-layout-${section.layout} qd-mode-${mode}`}>
      <div className="qd-hero">
        <div className="qd-media">
          <PortfolioVisual section={section} />
        </div>
        <NarrativeBlock section={section} />
      </div>
      <MemoryMain section={section} />
      <MemoryDetails section={section} />
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
    <div className={`qd-content qd-content-${section.id} qd-content-${section.layout} qd-content-${mode}`}>
      <PortfolioCopy section={section} mode={mode} />
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
  const [initialExperience] = useState(readInitialExperience);
  const [mode, setMode] = useState<AppMode>(initialExperience.mode);
  const [unlocked, setUnlocked] = useState<PortfolioSectionId[]>(initialExperience.unlocked);
  const [selectedId, setSelectedId] = useState<PortfolioSectionId | null>(initialExperience.selectedId);
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
