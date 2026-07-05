export type PortfolioSectionId =
  | "about"
  | "projects"
  | "work"
  | "tech"
  | "soft"
  | "activities"
  | "hobbies"
  | "achievements";

export type PortfolioSection = {
  id: PortfolioSectionId;
  level: number;
  title: string;
  rewardName: string;
  quest: string;
  status: "verified" | "needs-copy";
  visual: "map" | "network" | "timeline" | "skills" | "compass" | "guilds" | "garden" | "trophy";
  summary: string;
  highlights: string[];
  tags: string[];
  links?: {
    label: string;
    href: string;
    type: "github" | "live" | "profile";
  }[];
};

export type GameLevel = {
  id: PortfolioSectionId;
  level: number;
  title: string;
  rewardName: string;
  quest: string;
  shardLabel: string;
  obstacleCount: number;
  palette: {
    sky: string;
    glow: string;
    ground: string;
  };
};

export const sections: PortfolioSection[] = [
  {
    id: "about",
    level: 1,
    title: "About Anjana",
    rewardName: "Memory of Self",
    quest:
      "The forest hums her name. Guide Anjana toward the first memory shard.",
    status: "needs-copy",
    visual: "map",
    summary:
      "Final personal introduction pending. Resume-backed facts: Anjana Venugopalan is an Integrated M.Tech CSE student at SSN College of Engineering in Chennai, building across product, frontend, analytics, and developer tooling.",
    highlights: [
      "Integrated M.Tech CSE student at Sri Sivasubramaniya Nadar College of Engineering.",
      "Works across frontend engineering, product thinking, analytics, and developer tools.",
      "Currently Associate Intern at Friday Intellytics.",
    ],
    tags: ["Product", "Frontend", "Analytics", "Developer tools"],
  },
  {
    id: "projects",
    level: 2,
    title: "Projects",
    rewardName: "Memory of Making",
    quest:
      "A trail of unfinished inventions flickers ahead. Collect the shard of craft.",
    status: "verified",
    visual: "network",
    summary:
      "Anjana builds practical products across assistive technology, commerce, dependency analysis, and architecture visualization.",
    highlights: [
      "Assistive Writing Pad for Children with Dysgraphia: Python, computer vision, machine learning, and Raspberry Pi-based real-time handwriting feedback.",
      "Handmade By Shweta: full-stack e-commerce platform using React, TypeScript, Node.js, MongoDB, Tailwind CSS, and REST APIs.",
      "Code Impact Analyzer: npm package for identifying files, modules, and services affected by code changes.",
      "Code-Viz: Python CLI and PyPI package for visualizing code dependencies and software architecture.",
    ],
    tags: ["React", "Python", "Node.js", "ML", "CLI", "MongoDB"],
    links: [
      {
        label: "Dysgraphia Pad repo",
        href: "https://github.com/anjuvenuDev/dysgraphia_pad",
        type: "github",
      },
      {
        label: "Impact Analyzer repo",
        href: "https://github.com/anjuvenuDev/impact-analyzer",
        type: "github",
      },
      {
        label: "Code-Viz repo",
        href: "https://github.com/anjuvenuDev/code-viz",
        type: "github",
      },
      {
        label: "Handmade By Shweta live",
        href: "https://handmadebyshweta.com",
        type: "live",
      },
      {
        label: "GitHub profile",
        href: "https://github.com/anjuvenuDev",
        type: "profile",
      },
    ],
  },
  {
    id: "work",
    level: 3,
    title: "Work Experience",
    rewardName: "Memory of Practice",
    quest:
      "The woods become a product maze. Jump cleanly through the workflow gaps.",
    status: "verified",
    visual: "timeline",
    summary:
      "Her experience spans AI analytics product development, frontend engineering, API integration, and production web interfaces.",
    highlights: [
      "Associate Intern at Friday Intellytics, May 2026 to present: product and development ownership for a desktop AI analytics application.",
      "Converted founder vision into executable user flows, MVP workflows, and product features.",
      "Designed and developed Friday's public-facing landing page.",
      "Web Development Intern at Yhills, Jan 2025 to Mar 2025: React interfaces, API integration, code reviews, and documentation.",
      "Frontend Developer Intern at NoShack Solutions, Jul 2024 to Aug 2024: REST API integration, React/JavaScript rendering, Node.js/Express and MongoDB-backed workflows.",
    ],
    tags: ["Product", "React", "APIs", "MVP", "Debugging"],
  },
  {
    id: "tech",
    level: 4,
    title: "Technical Skills",
    rewardName: "Memory of Tools",
    quest:
      "Ancient runes rearrange into stacks and systems. Gather the right symbols.",
    status: "verified",
    visual: "skills",
    summary:
      "Anjana's skill set combines product design, analytics, frontend/backend engineering, databases, and deployment platforms.",
    highlights: [
      "Product and design: user flows, wireframing, agile development, UI/UX principles, feature planning, product thinking, Canva.",
      "Analytics and data: SQL, Python, Pandas, NumPy, Matplotlib, SciPy, Scikit-learn, Seaborn, statistics.",
      "Technical: JavaScript, TypeScript, Java, C, HTML, CSS, React.js, Vue.js, Node.js, Spring Boot, REST APIs.",
      "Databases and platforms: MongoDB, SQL, Neo4j, Git, Linux, Vercel, Render.",
    ],
    tags: ["TypeScript", "React", "Python", "SQL", "Spring Boot"],
  },
  {
    id: "soft",
    level: 5,
    title: "Soft Skills",
    rewardName: "Memory of Voice",
    quest:
      "A quiet grove asks for the skills behind the code. Reach the lantern.",
    status: "needs-copy",
    visual: "compass",
    summary:
      "Final soft-skills copy pending. Resume-backed signals include product ownership, direct founder collaboration, event coordination, code reviews, documentation, and cross-team debugging.",
    highlights: [
      "Product ownership and feature planning.",
      "Direct stakeholder collaboration.",
      "Event coordination and leadership.",
      "Documentation, reviews, and iterative debugging.",
    ],
    tags: ["Leadership", "Communication", "Ownership", "Collaboration"],
  },
  {
    id: "activities",
    level: 6,
    title: "Extra-curricular Activities",
    rewardName: "Memory of Guilds",
    quest:
      "The forest opens into guild halls. Each banner marks a community she shaped.",
    status: "verified",
    visual: "guilds",
    summary:
      "Anjana is active across technical, leadership, design, entrepreneurship, and event communities at SSN.",
    highlights: [
      "Joint Event Coordinator, SSN ACE, 2025-26.",
      "Joint Secretary, SSN IEEE WIE, 2025.",
      "Full-Stack Development Core and Deputy PR Lead, SSN Coding Club, 2025-26.",
      "Event Management member, SSN ACM, 2025-26.",
      "Under Secretary General, SSN SNUC MUN, 2025.",
      "Core Member, QFactorial; Junior Core, Gradient Design Club; Creative and PR Member, Lakshya E-Cell.",
    ],
    tags: ["ACE", "IEEE WIE", "Coding Club", "ACM", "MUN"],
  },
  {
    id: "hobbies",
    level: 7,
    title: "Hobbies & Interests",
    rewardName: "Memory of Wonder",
    quest:
      "Past the code-lit path, a smaller trail waits for the things that keep her curious.",
    status: "needs-copy",
    visual: "garden",
    summary:
      "Final hobbies and interests copy pending. This reward is ready for Anjana's personal interests, creative pursuits, and non-academic story.",
    highlights: [
      "Awaiting final hobbies and interests from Anjana.",
      "This section can include creative work, reading, games, design, music, public speaking, communities, or any personal anchors she wants recruiters to remember.",
    ],
    tags: ["Pending copy", "Personal"],
  },
  {
    id: "achievements",
    level: 8,
    title: "Achievements",
    rewardName: "Memory of Proof",
    quest:
      "The final thicket guards a bright archive. Finish the run and reclaim the proof.",
    status: "verified",
    visual: "trophy",
    summary:
      "Her achievements show consistent academic strength, hackathon performance, machine learning competition results, and event leadership recognition.",
    highlights: [
      "Ranked 3rd in the Department of M.Tech CSE with 9.185/10 CGPA for 4 consecutive semesters.",
      "Finalist in the Internal Smart India Hackathon under the Smart Healthcare Management System problem statement.",
      "Top 15% Global Leaderboard in the Kaggle Spaceship Titanic ML Competition with approximately 82% accuracy.",
      "Recognized multiple times for organizing and coordinating technical events under ACM, IEEE WIE, and ACE.",
    ],
    tags: ["CGPA 9.185", "Hackathon", "Kaggle", "Leadership"],
  },
];

export const gameLevels: GameLevel[] = sections.map((section, index) => ({
  id: section.id,
  level: section.level,
  title: section.title,
  rewardName: section.rewardName,
  quest: section.quest,
  shardLabel: section.rewardName.replace("Memory of ", ""),
  obstacleCount: 2 + (index % 3),
  palette: [
    { sky: "#13241f", glow: "#ffd166", ground: "#3d6b3d" },
    { sky: "#172034", glow: "#80ffdb", ground: "#315a45" },
    { sky: "#20162f", glow: "#c084fc", ground: "#405d3b" },
    { sky: "#10242b", glow: "#7dd3fc", ground: "#365344" },
    { sky: "#25172a", glow: "#ff8fab", ground: "#4a5536" },
    { sky: "#14251d", glow: "#facc15", ground: "#315f4c" },
    { sky: "#1c2130", glow: "#a7f3d0", ground: "#4a6234" },
    { sky: "#201820", glow: "#f9a8d4", ground: "#365c47" },
  ][index],
}));

export const sectionOrder = sections.map((section) => section.id);
