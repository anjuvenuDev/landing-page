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
  details?: string[];
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
      "Anjana Venugopalan is a 5 Year Integrated M.Tech CSE student at SSN College of Engineering, Chennai, driven by a passion for building technology that creates meaningful impact. With a strong academic record and hands-on experience across artificial intelligence, full-stack development, product engineering, and computer vision, she enjoys working at the intersection of innovation and usability. What began as a fascination with programming has evolved into a broader interest in designing complete digital experiences. From conceptualizing products and architecting software to refining user interactions, Anjana enjoys understanding every layer of the development process. She believes that successful technology is not defined solely by its technical sophistication, but by how naturally it fits into people's lives. Her work is guided by curiosity, creativity, and a constant desire to learn. Anjana hopes to contribute to products that combine intelligent technology with thoughtful design, making complex systems more accessible, intuitive, and human-centered.",
    story: [
      "SSN College of Engineering, Chennai | 5 Year Integrated M.Tech CSE | Aug 2023 - Jul 2028 | CGPA 9.237/10 | Department Rank 3.",
      "Senior secondary school | AISSCE 482/500, 96.4%.",
      "Secondary school | AISSE 489/500, 97.8%.",
      "Arch Linux convert: dual-booted Arch alongside Windows because Windows is boring, she said.",
    ],
    highlights: [
      "Relevant coursework: Data Science and Analytics, Machine Learning, Database Management Systems, Applied Optimization Techniques, Software Construction, Design and Analysis of Algorithms, Data Structures and Algorithms.",
      "Product instinct: she likes understanding the complete route from problem framing to shipped user experience.",
    ],
    featureCards: [],
    tags: ["Product", "AI", "Frontend", "Design", "Arch Linux"],
  },
  {
    id: "projects",
    level: 2,
    title: "Anjana's Projects",
    rewardName: "Memory of Making",
    quest:
      "A trail of unfinished inventions flickers ahead. Collect the shard of craft.",
    status: "verified",
    visual: "network",
    layout: "projects",
    summary: "",
    story: [],
    highlights: [],
    projectCards: [
      {
        title: "Assistive Writing Pad for Children with Dysgraphia",
        role: "Python, Computer Vision, Machine Learning, Raspberry Pi",
        description:
          "An AI-powered assistive learning device that analyzes handwriting in real time and gives personalized corrective feedback for children with dysgraphia.",
        details: [
          "Frames a learning problem as a product: portable, affordable, child-friendly, and useful at the exact moment writing feedback is needed.",
          "Balances computer vision, handwriting recognition, ML, and Raspberry Pi constraints without losing sight of the user.",
        ],
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
        role: "React.js, TypeScript, Node.js, MongoDB, Tailwind CSS, REST APIs",
        description:
          "An e-commerce platform for a handcrafted mandala art brand, designed to turn an artist's offline identity into a usable online storefront.",
        details: [
          "Converted business needs into search, filtering, product discovery, purchasing flows, and responsive storefront decisions.",
          "Built with a visual identity that keeps the artwork central instead of making the technology feel loud.",
        ],
        stack: ["React", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS", "REST APIs"],
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
        role: "JavaScript, Node.js, npm",
        description:
          "An npm package that maps files, modules, and services affected by code changes so teams can debug and plan releases faster.",
        details: [
          "Turns repository dependencies into a decision tool: what changed, what could break, and what deserves review.",
          "Designed for practical developer workflow value instead of another static report.",
        ],
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
        role: "Python, Graph Analysis, CLI Development, PyPI",
        description:
          "A Python CLI that turns codebases into dependency graphs and architecture maps for faster onboarding and system understanding.",
        details: [
          "Built around a clear developer pain point: unfamiliar code is easier to reason about when relationships are visible.",
          "Packaged as a command-line tool so the output can fit naturally into engineering workflows.",
        ],
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
        role: "Raspberry Pi networking collaboration",
        description:
          "A Raspberry Pi-based network packet crafting and analysis platform developed as part of a Nokia collaboration.",
        details: [
          "Blends networking fundamentals with hands-on systems experimentation and compact hardware constraints.",
        ],
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
    summary: "",
    story: [],
    highlights: [],
    timeline: [
      {
        company: "NoShack Solutions",
        role: "Frontend Developer Intern",
        dates: "Jul 2024 - Aug 2024",
        logo: "/assets/logos/noshack.svg",
        focus: "Production frontend foundations",
        details: [
          "Integrated APIs into React and JavaScript product interfaces.",
          "Built interactive screens and internal dashboard workflows.",
          "Improved data rendering, debugging flow, testing, and frontend performance.",
        ],
      },
      {
        company: "Yhills",
        role: "Web Development Intern",
        dates: "Jan 2025 - Mar 2025",
        logo: "/assets/logos/yhills.svg",
        focus: "Responsive product delivery",
        details: [
          "Developed responsive user-facing web pages with HTML, CSS, JavaScript, and React.",
          "Connected APIs to frontend components so product workflows felt complete.",
          "Collaborated with mentors and teammates to clarify requirements and ship maintainable features.",
        ],
      },
      {
        company: "Friday Intellytics",
        role: "Associate Intern - Product & Growth",
        dates: "May 2026 - Present",
        logo: "/assets/logos/friday-intellytics.svg",
        focus: "AI analytics product ownership",
        details: [
          "Owned desktop app improvements across data, auth, export, and interface flows.",
          "Worked with the founder on feature planning, MVP flows, tests, beta signups, and product refinement.",
        ],
      },
    ],
    tags: ["Product planning", "React", "APIs", "MVP workflows", "Debugging"],
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
    summary: "",
    story: [],
    highlights: [],
    skillGroups: [
      {
        title: "Product Thinking",
        items: ["Product Discovery", "Requirements Analysis", "Feature Prioritization", "User / Problem Analysis", "Feature Planning", "Agile Development", "UI/UX Principles", "Product Thinking"],
      },
      {
        title: "Analytics & Data",
        items: ["Data Analysis", "Statistical Analysis", "Quantitative Problem Solving", "Data Visualization", "SQL", "Excel", "PowerPoint"],
      },
      {
        title: "Languages",
        items: ["Python", "JavaScript", "TypeScript", "Java", "C", "SQL"],
      },
      {
        title: "Frontend",
        items: ["React.js", "Vue.js", "HTML", "CSS", "Tailwind CSS", "Responsive UI", "Canva"],
      },
      {
        title: "Backend & Data Stores",
        items: ["Node.js", "Spring Boot", "REST APIs", "MongoDB", "Neo4j"],
      },
      {
        title: "ML & Scientific",
        items: ["Scikit-learn", "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn"],
      },
      {
        title: "Tools & Platforms",
        items: ["Git", "Linux", "Arch Linux", "Vercel", "Render"],
      },
    ],
    featureCards: [],
    tags: ["Python", "TypeScript", "React.js", "SQL", "Linux", "Product Thinking"],
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
    summary: "",
    story: [],
    highlights: [
      "Accepted as a GirlScript Summer of Code contributor earlier this year; new to open source, with one PR merged and a few issues raised.",
      "Her stage work includes compering ICCIDS, Sports Day, CSI Inauguration, and ACM Competitive Thinking Workshop.",
    ],
    featureCards: [
      {
        title: "Leadership",
        body: "Builds teams, structures responsibilities, and keeps people aligned during student organization work and internships.",
      },
      {
        title: "Communication",
        body: "Comfortable speaking across founders, mentors, developers, designers, volunteers, and large audiences as a compere.",
      },
      {
        title: "Ownership",
        body: "Takes ambiguous tasks from problem framing to execution, especially in product and event settings.",
      },
      {
        title: "Collaboration",
        body: "Works across mixed groups without losing clarity, accountability, or the human side of the task.",
      },
      {
        title: "Adaptability",
        body: "Learns fast when requirements, tools, or team contexts change.",
      },
      {
        title: "Growth Mindset",
        body: "Uses open source, internships, and communities as places to learn in public and contribute incrementally.",
      },
    ],
    tags: ["Leadership", "Empathy", "Communication", "Ownership", "Adaptability", "Growth mindset"],
  },
  {
    id: "activities",
    level: 6,
    title: "Leadership and Impact",
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
    summary: "",
    story: [],
    highlights: [
      "Club Head, SSN Design Club, 2026-27; Junior Core, 2025-26. Selected and structured a 16-member Core Committee.",
      "Joint Event Coordinator, SSN ACE, 2025-26. Core organizer for Invente: 10+ competitions and about 200 registrations.",
      "Joint Secretary, SSN IEEE WIE, 2025-26; Event Management, 2024-25. Coordinated 5 verticals and about 30-35 members; helped nearly double the team size; led WISE 2025 with ACM-W.",
      "Treasurer, SSN ACM Student Chapter, 2025-26; Event Management, 2024-25. Supported ACM Hour of Code and helped secure about US$250 in ACM funding.",
      "Deputy PR Lead and Full-Stack Development Core, SSN Coding Club, 2025-26.",
      "Under Secretary General, SSN SNUC MUN, 2025.",
      "Core PR, SSN Networks; Creative and PR Member, Lakshya E-Cell Entrepreneurship Club; Core Member, QFactorial.",
      "Head Girl, Director of Event Management at Polemic Debating Venture, and MC/compere for ICCIDS, Sports Day, CSI Inauguration, and ACM Competitive Thinking Workshop.",
    ],
    featureCards: [],
    tags: ["SSN ACE", "IEEE WIE", "Coding Club", "ACM", "MUN", "Gradient", "Lakshya"],
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
    summary: "",
    story: [
      "For Anjana, creativity has always existed alongside technology. Traditional art, mixed media, stage hosting, and design leadership shape the way she thinks about products: useful things should also feel expressive, clear, and human.",
    ],
    highlights: [
      "Traditional art and mixed media remain a long-running creative practice; she hosted a public art exhibition at age 14.",
      "Her design leadership at SSN connects visual identity, communication, accessibility, and student community work.",
      "Public speaking, compering, and hosting shape how she connects with audiences.",
    ],
    featureCards: [
      {
        title: "Art",
        body: "A practice built around hand-drawn illustration, mixed media, patience, observation, and visual storytelling.",
      },
      {
        title: "Design",
        body: "A tool for communication, accessibility, storytelling, and creating memorable student initiatives.",
      },
      {
        title: "Stage",
        body: "Compering and speaking help her engage people directly and create experiences that feel alive.",
      },
    ],
    links: [
      {
        label: "art.anjjj",
        href: "https://www.instagram.com/art.anjjj/",
        type: "social",
      },
    ],
    tags: ["Traditional art", "Mixed media", "Gradient Design Club", "Public speaking", "Storytelling"],
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
    summary: "",
    story: [],
    highlights: [
      "Ranked 3rd in the Department of M.Tech CSE with a CGPA of 9.237/10 as of the sixth semester.",
      "1st Place at MIT Tech Symposium 2026 and VIT Intercollegiate Tech Symposium for Causal Deforestation Propagation Prediction via Road-Aware Graph Attention Networks, with Rs. 8,000 in combined prize winnings.",
      "Finalist in the Internal Smart India Hackathon under the Smart Healthcare Management System problem statement.",
      "Placed in the Top 15% Global Leaderboard in the Kaggle Spaceship Titanic ML Competition, achieving approximately 82% accuracy.",
      "Recognized multiple times for excellence in organizing and coordinating technical events under ACM, IEEE WIE, and ACE.",
      "Served as School Pupil Leader (Head Girl) and later continued leadership across SSN student organizations.",
      "Hosted a public art exhibition at age 14.",
    ],
    featureCards: [
      {
        label: "Research",
        title: "1st Place Symposium Wins",
        body: "Causal Deforestation Propagation Prediction via Road-Aware Graph Attention Networks won at MIT Tech Symposium 2026 and VIT Intercollegiate Tech Symposium.",
      },
      {
        label: "Academics",
        title: "3rd Department Rank",
        body: "Integrated M.Tech CSE, SSN College of Engineering, with consistent academic performance recorded across the uploaded documents.",
      },
      {
        label: "ML",
        title: "Kaggle Top 15%",
        body: "Spaceship Titanic Machine Learning Competition, approximately 82% accuracy.",
      },
      {
        label: "Hackathon",
        title: "Internal SIH Finalist",
        body: "Finalist under the Smart Healthcare Management System problem statement.",
      },
      {
        label: "Open Source",
        title: "GSSoC Contributor",
        body: "Accepted earlier this year; one pull request merged and a few issues raised.",
      },
    ],
    tags: ["CGPA 9.237", "Department Rank", "Kaggle", "Smart India Hackathon", "GSSoC", "Leadership", "Art exhibition"],
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
