export type PortfolioSectionId =
  | "about"
  | "projects"
  | "work"
  | "tech"
  | "soft"
  | "activities"
  | "hobbies"
  | "achievements";

export type PortfolioLinkType = "github" | "live" | "profile" | "social" | "package";

export type PortfolioLink = {
  label: string;
  href: string;
  type: PortfolioLinkType;
};

export type PortfolioImage = {
  src: string;
  alt: string;
  position?: string;
  variant?: "portrait" | "wide" | "phone" | "collage";
};

export type FeatureCard = {
  label?: string;
  title: string;
  body: string;
};

export type ProjectCard = {
  title: string;
  role: string;
  description: string;
  stack: string[];
  links: PortfolioLink[];
};

export type WorkStep = {
  company: string;
  role: string;
  dates: string;
  logo: string;
  focus: string;
  details: string[];
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type PortfolioSection = {
  id: PortfolioSectionId;
  level: number;
  title: string;
  rewardName: string;
  quest: string;
  status: "verified" | "needs-copy";
  visual: "map" | "network" | "timeline" | "skills" | "compass" | "guilds" | "garden" | "trophy";
  layout: "image" | "projects" | "timeline" | "skills" | "diagram" | "gallery" | "achievements";
  summary: string;
  story?: string[];
  highlights: string[];
  tags: string[];
  image?: PortfolioImage;
  images?: PortfolioImage[];
  featureCards?: FeatureCard[];
  projectCards?: ProjectCard[];
  timeline?: WorkStep[];
  skillGroups?: SkillGroup[];
  links?: PortfolioLink[];
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
    status: "verified",
    visual: "map",
    layout: "image",
    image: {
      src: "/assets/portfolio/about-anjana.jpg",
      alt: "Anjana Venugopalan",
      position: "50% 42%",
      variant: "portrait",
    },
    summary:
      "Integrated M.Tech CSE student at SSN who builds at the intersection of AI, full-stack engineering, product thinking, and design.",
    story: [
      "I like understanding the full shape of a product: the user problem, the system behind it, and the small interaction details that make it feel natural.",
      "My work moves across assistive AI, developer tools, web products, analytics workflows, and design-led experiences.",
    ],
    highlights: [
      "5 Year Integrated M.Tech CSE student at SSN College of Engineering, Chennai.",
      "Associate Intern at Friday Intellytics, working on product and development for an AI analytics platform.",
      "Comfortable moving between code, user flows, debugging, and visual communication.",
    ],
    featureCards: [
      {
        label: "Builder",
        title: "Product-minded engineer",
        body: "Turns product ideas into flows, interfaces, and working software.",
      },
      {
        label: "Explorer",
        title: "AI + systems curiosity",
        body: "Experiments with computer vision, analytics, developer tooling, and embedded systems.",
      },
      {
        label: "Setup",
        title: "Arch Linux convert",
        body: "Dual-booted Arch alongside Windows and now builds most projects from that setup.",
      },
    ],
    tags: ["Product", "AI", "Frontend", "Design", "Arch Linux"],
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
    layout: "projects",
    summary:
      "A practical project trail across assistive technology, developer tooling, networking, and creative commerce.",
    highlights: [
      "Builds products with a bias toward usability, scale, and real-world application.",
      "Projects combine AI, full-stack development, CLI tooling, networking, and thoughtful interfaces.",
    ],
    projectCards: [
      {
        title: "Assistive Writing Pad",
        role: "AI assistive technology",
        description:
          "A Raspberry Pi-based learning device for children with dysgraphia, using computer vision and ML to analyze handwriting and provide corrective feedback.",
        stack: ["Python", "Computer Vision", "ML", "Raspberry Pi"],
        links: [
          {
            label: "GitHub",
            href: "https://github.com/anjuvenuDev/assistive-writing-pad",
            type: "github",
          },
        ],
      },
      {
        title: "Handmade By Shweta",
        role: "Creative business web presence",
        description:
          "A responsive brand site for a handcrafted mandala art business, built to showcase work clearly and strengthen discoverability.",
        stack: ["React", "TypeScript", "Responsive UI"],
        links: [
          {
            label: "Repository",
            href: "https://github.com/anjuvenuDev/mandala",
            type: "github",
          },
          {
            label: "Live site",
            href: "https://handmadebyshweta.com",
            type: "live",
          },
        ],
      },
      {
        title: "Code Impact Analyzer",
        role: "Developer tooling",
        description:
          "An npm package that identifies files and modules affected by code changes, making debugging and release planning easier.",
        stack: ["JavaScript", "Node.js", "npm"],
        links: [
          {
            label: "GitHub",
            href: "https://github.com/anjuvenuDev/impact-analyzer",
            type: "github",
          },
        ],
      },
      {
        title: "Code-Viz",
        role: "Architecture visualization CLI",
        description:
          "A Python CLI package that generates dependency graphs so unfamiliar codebases become easier to read and reason about.",
        stack: ["Python", "CLI", "Graph Analysis", "PyPI"],
        links: [
          {
            label: "GitHub",
            href: "https://github.com/anjuvenuDev/code-viz",
            type: "github",
          },
        ],
      },
      {
        title: "PacketPi",
        role: "Networking platform",
        description:
          "A Raspberry Pi-based packet crafting and analysis platform developed through a Nokia collaboration.",
        stack: ["Raspberry Pi", "Networking", "Packet Analysis"],
        links: [
          {
            label: "GitHub",
            href: "https://github.com/anjuvenuDev/packetpi",
            type: "github",
          },
        ],
      },
    ],
    tags: ["AI", "React", "CLI", "Networking", "Developer tools"],
    links: [
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
    layout: "timeline",
    summary:
      "A growing path through frontend implementation, web product delivery, and AI analytics product ownership.",
    highlights: [
      "Contributed across feature planning, implementation, testing, debugging, and product refinement.",
      "Worked directly with founders, mentors, and teammates to convert requirements into usable software.",
    ],
    timeline: [
      {
        company: "NoShack Solutions",
        role: "Frontend Developer Intern",
        dates: "Jul 2024 - Aug 2024",
        logo: "/assets/logos/noshack.svg",
        focus: "Production frontend foundations",
        details: [
          "Integrated REST APIs into React and JavaScript screens.",
          "Connected frontend modules with Node.js, Express, and MongoDB-backed services.",
          "Supported dashboard workflows, testing, debugging, and UI optimization.",
        ],
      },
      {
        company: "Yhills",
        role: "Web Development Intern",
        dates: "Jan 2025 - Mar 2025",
        logo: "/assets/logos/yhills.svg",
        focus: "Responsive web delivery",
        details: [
          "Built responsive interfaces with HTML, CSS, JavaScript, and React.",
          "Integrated APIs and improved data flow across product workflows.",
          "Participated in code reviews, documentation, and collaborative debugging.",
        ],
      },
      {
        company: "Friday Intellytics",
        role: "Associate Intern",
        dates: "May 2026 - Present",
        logo: "/assets/logos/friday-intellytics.svg",
        focus: "AI analytics product ownership",
        details: [
          "Converted founder vision into user flows, MVP workflows, and product features.",
          "Built workflows for connecting data sources, creating analysis pipelines, and interacting with insights conversationally.",
          "Designed and developed the public-facing landing page while iterating on usability gaps.",
        ],
      },
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
    layout: "skills",
    summary:
      "A toolset that spans product design, analytics, web engineering, databases, deployment, and system-level curiosity.",
    highlights: [
      "Comfortable building across the frontend/backend boundary and grounding product ideas in implementation.",
      "Uses Linux heavily, with Arch now serving as the main project environment.",
    ],
    skillGroups: [
      {
        title: "Product & Design",
        items: ["User flows", "Wireframing", "UI/UX principles", "Feature planning", "Agile", "Canva"],
      },
      {
        title: "Analytics & Data",
        items: ["Python", "SQL", "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Scikit-learn", "Statistics"],
      },
      {
        title: "Engineering",
        items: ["JavaScript", "TypeScript", "Java", "C", "HTML", "CSS", "React", "Vue", "Node.js", "Spring Boot", "REST APIs"],
      },
      {
        title: "Data & Platforms",
        items: ["MongoDB", "SQL", "Neo4j", "Git", "Linux", "Vercel", "Render"],
      },
    ],
    tags: ["TypeScript", "React", "Python", "SQL", "Linux"],
  },
  {
    id: "soft",
    level: 5,
    title: "Soft Skills",
    rewardName: "Memory of Voice",
    quest:
      "A quiet grove asks for the skills behind the code. Reach the lantern.",
    status: "verified",
    visual: "compass",
    layout: "diagram",
    summary:
      "Her non-technical strengths come from ownership-heavy internships, leadership roles, event work, and public communication.",
    highlights: [
      "Owns ambiguity by turning broad ideas into action plans, flows, and working features.",
      "Communicates clearly across founders, mentors, teammates, designers, and student communities.",
      "Adapts quickly across frontend work, product thinking, event management, and open-source contribution.",
    ],
    featureCards: [
      {
        title: "Ownership",
        body: "Takes responsibility for product workflows, user-facing issues, and delivery details.",
      },
      {
        title: "Communication",
        body: "Comfortable presenting, hosting, documenting, reviewing, and aligning people around work.",
      },
      {
        title: "Collaboration",
        body: "Works across teams and communities, from internships to student organizations.",
      },
      {
        title: "Growth mindset",
        body: "New to open source, accepted into GirlScript Summer of Code, with one PR merged and issues raised.",
      },
    ],
    tags: ["Leadership", "Communication", "Ownership", "Collaboration", "Adaptability"],
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
    layout: "gallery",
    images: [
      {
        src: "/assets/portfolio/activity-mic.jpg",
        alt: "Anjana speaking at an event",
        position: "50% 38%",
        variant: "portrait",
      },
      {
        src: "/assets/portfolio/activity-stage.jpg",
        alt: "Anjana on stage with a microphone",
        position: "54% 45%",
        variant: "wide",
      },
    ],
    summary:
      "Outside academics, Anjana is active in technical, design, leadership, entrepreneurship, and event communities at SSN.",
    highlights: [
      "Joint Event Coordinator, SSN ACE, 2025-26.",
      "Joint Secretary, SSN IEEE WIE, 2025.",
      "Full-Stack Development Core and Deputy PR Lead, SSN Coding Club, 2025-26.",
      "Event Management member, SSN ACM; Under Secretary General, SSN SNUC MUN.",
      "Core Member, QFactorial; Junior Core, Gradient Design Club; Creative and PR Member, Lakshya E-Cell.",
    ],
    featureCards: [
      {
        label: "Community",
        title: "Builder of student spaces",
        body: "Organizes events, mentors peers, and helps shape technical communities beyond the classroom.",
      },
      {
        label: "Stage",
        title: "Comfortable with audiences",
        body: "Compering, speaking, and hosting have strengthened confidence and clarity.",
      },
    ],
    tags: ["ACE", "IEEE WIE", "Coding Club", "ACM", "MUN", "Gradient"],
  },
  {
    id: "hobbies",
    level: 7,
    title: "Hobbies & Interests",
    rewardName: "Memory of Wonder",
    quest:
      "Past the code-lit path, a smaller trail waits for the things that keep her curious.",
    status: "verified",
    visual: "garden",
    layout: "gallery",
    image: {
      src: "/assets/portfolio/art-grid.png",
      alt: "Anjana's art page art.anjjj",
      variant: "phone",
    },
    summary:
      "Creativity has always existed alongside technology: traditional art, design leadership, and public speaking all shape how she builds.",
    highlights: [
      "Works primarily with hand-drawn illustrations and mixed media.",
      "Held a public art exhibition at age 14.",
      "Leads the Gradient Design Club at SSN and mentors aspiring designers.",
      "Enjoys being on stage through compering, hosting, and speaking before large audiences.",
    ],
    featureCards: [
      {
        title: "Art",
        body: "A long-running creative practice that sharpened patience, observation, and visual storytelling.",
      },
      {
        title: "Design",
        body: "Treats design as communication: making ideas accessible, memorable, and human.",
      },
      {
        title: "Public speaking",
        body: "Draws energy from hosting events and connecting with an audience.",
      },
    ],
    links: [
      {
        label: "art.anjjj",
        href: "https://www.instagram.com/art.anjjj/",
        type: "social",
      },
    ],
    tags: ["Art", "Design", "Public speaking", "Mixed media"],
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
    layout: "achievements",
    summary:
      "Academic consistency, technical curiosity, creative confidence, and leadership all show up across her milestones.",
    highlights: [
      "Ranked 3rd in the Department of M.Tech CSE with CGPA 9.185/10 for 4 consecutive semesters.",
      "Finalist in Internal Smart India Hackathon under the Smart Healthcare Management System problem statement.",
      "Top 15% globally in Kaggle Spaceship Titanic ML Competition with approximately 82% accuracy.",
      "Accepted as a GirlScript Summer of Code contributor, with one PR merged and issues raised.",
      "Served as School Pupil Leader and later took leadership roles across ACE, IEEE WIE, Coding Club, Gradient, and more.",
      "Hosted a public art exhibition at age 14.",
    ],
    featureCards: [
      {
        label: "Rank",
        title: "3rd Department Rank",
        body: "Integrated M.Tech CSE, SSN College of Engineering.",
      },
      {
        label: "ML",
        title: "Kaggle Top 15%",
        body: "Spaceship Titanic competition, approximately 82% accuracy.",
      },
      {
        label: "Build",
        title: "SIH Finalist",
        body: "Internal Smart India Hackathon, healthcare management problem statement.",
      },
      {
        label: "Open Source",
        title: "GSSoC Contributor",
        body: "Accepted earlier this year; one PR merged and multiple issues raised.",
      },
    ],
    tags: ["CGPA 9.185", "Hackathon", "Kaggle", "GSSoC", "Leadership"],
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
