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
      "Anjana Venugopalan is a 5 Year Integrated M.Tech CSE student at SSN College of Engineering, Chennai, driven by a passion for building technology that creates meaningful impact.",
    story: [
      "With a strong academic record and hands-on experience across artificial intelligence, full-stack development, product engineering, and computer vision, she enjoys working at the intersection of innovation and usability.",
      "What began as a fascination with programming has evolved into a broader interest in designing complete digital experiences. From conceptualizing products and architecting software to refining user interactions, Anjana enjoys understanding every layer of the development process.",
      "She believes that successful technology is not defined solely by its technical sophistication, but by how naturally it fits into people's lives.",
      "Her work is guided by curiosity, creativity, and a constant desire to learn.",
      "Anjana hopes to contribute to products that combine intelligent technology with thoughtful design, making complex systems more accessible, intuitive, and human-centered.",
    ],
    highlights: [
      "Master of Technology, Computer Science and Engineering at Sri Sivasubramaniya Nadar College of Engineering, August 2023 - July 2028.",
      "CGPA: 9.237/10 | Department Rank: 3 | AISSCE: 96.4% (482/500).",
      "Relevant courses include Data Science and Analytics, Machine Learning, Database Management Systems, Applied Optimization Techniques, Software Construction, Design and Analysis of Algorithms, and Data Structures and Algorithms.",
      "Standard 12 AISSCE: 482/500 = 96.4%. Standard 10 AISSCE: 489/500 = 97.8%.",
      "Dual-booted her laptop with Arch Linux alongside Windows because she was done with Windows, and now primarily builds projects on Arch.",
    ],
    featureCards: [
      {
        label: "Academic base",
        title: "CSE foundation",
        body: "Her coursework and project work span algorithms, databases, analytics, machine learning, optimization, software construction, and full-stack systems, backed by a 9.237/10 CGPA and Department Rank 3.",
      },
      {
        label: "Builder",
        title: "Technology with usability",
        body: "She is drawn to the full lifecycle of products: from ideas and architecture to user flows, UI details, and real-world usefulness.",
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
    title: "Anjana's Projects",
    rewardName: "Memory of Making",
    quest:
      "A trail of unfinished inventions flickers ahead. Collect the shard of craft.",
    status: "verified",
    visual: "network",
    layout: "projects",
    summary:
      "Anjana enjoys building products that solve practical problems while balancing technical depth with thoughtful user experience.",
    story: [
      "Her work spans artificial intelligence, networking, developer tooling, full-stack web development, and product discovery, with every project driven by a focus on usability, scalability, and real-world application.",
      "Across every project, her goal remains the same: to build technology that is technically robust, thoughtfully designed, and genuinely useful to the people who use it.",
    ],
    highlights: [
      "Projects span AI-powered assistive technology, responsive business websites, npm tooling, Python CLI architecture visualization, and Raspberry Pi networking systems.",
      "The resume version sharpens the product lens: discovery, search, filtering, purchasing workflows, downstream code-change risk, debugging, release planning, and real-time feedback under hardware constraints.",
      "The common thread is practical software that can be used, understood, shipped, and improved.",
    ],
    projectCards: [
      {
        title: "Assistive Writing Pad for Children with Dysgraphia",
        role: "Python, Computer Vision, Machine Learning, Raspberry Pi",
        description:
          "An AI-powered assistive learning device, currently under active development, that analyzes handwriting in real time and provides personalized corrective feedback for children with dysgraphia.",
        details: [
          "Combines computer vision, handwriting recognition, machine learning, and embedded computing on Raspberry Pi.",
          "Designed around portability, computational constraints, and real-time feedback.",
          "Explores how intelligent systems can make learning more accessible for children with writing difficulties.",
          "Continues to evolve through improvements in recognition accuracy, user interface design, and model performance.",
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
          "An end-to-end e-commerce platform for a handcrafted mandala art brand, built to strengthen the artist's online presence, showcase work through a clean responsive interface, and support product discovery.",
        details: [
          "The project emphasized thoughtful UI design, responsive development, and creating a digital experience that reflected the artist's unique creative identity.",
          "The implementation includes search, filtering, purchasing workflows, a responsive product catalog, shopping flows, and production deployment.",
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
          "An npm package that identifies files, modules, and services affected by code changes to simplify debugging and release planning.",
        details: [
          "Built repository-wide dependency and change impact analysis.",
          "Assesses downstream code-change risk to support faster debugging, safer releases, and better developer decision-making.",
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
          "A Python CLI tool that generates dependency graphs and architectural visualizations, helping developers better understand unfamiliar codebases and navigate complex software systems.",
        details: [
          "Developed and published as a Python CLI package.",
          "Generated dependency graphs to help developers analyze architecture, identify module relationships, and improve onboarding into unfamiliar repositories.",
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
          "A Raspberry Pi-based network packet crafting and analysis platform developed as part of a collaboration with Nokia.",
        details: [
          "Continues the same project pattern: practical tooling, systems curiosity, and hands-on experimentation with real-world technology.",
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
    summary:
      "Through multiple internships, Anjana has gained experience working in fast-paced product environments, contributing to software development from both engineering and product perspectives.",
    story: [
      "As an Associate Intern at Friday Intellytics, she works directly with the founder to shape an AI-powered analytics platform from the ground up.",
      "In that Product & Growth role, she translates ambiguous requirements into prioritized features and drives execution from problem definition through implementation.",
      "Previously, during her internship at Yhills, she focused on building responsive React applications, integrating APIs, and collaborating with teams to develop scalable web solutions while following industry-standard development practices.",
      "Her internship at NoShack Solutions introduced her to production frontend development, where she worked on REST API integration, interactive user interfaces, internal dashboards, and application optimization.",
      "These experiences have shaped her into an engineer who enjoys taking ownership, collaborating across teams, and contributing throughout the entire product lifecycle.",
    ],
    highlights: [
      "Selected by the Friday Intellytics founder from 25+ candidates after an approximately 6-hour evaluation spanning data analytics, system design, AI-agent development, and product ideation.",
      "Her Friday Intellytics responsibilities extend beyond implementation, encompassing product planning, workflow design, feature development, usability improvements, testing, debugging, and the creation of the company's public-facing landing page.",
      "She assumed ownership of desktop application enhancements across data integration, authentication, exports, and UI workflows, while also supporting stakeholder discovery and beta registration.",
      "The work path moves from production frontend foundations to responsive product delivery and then to AI analytics product ownership.",
    ],
    timeline: [
      {
        company: "Friday Intellytics",
        role: "Associate Intern - Product & Growth",
        dates: "May 2026 - Present",
        logo: "/assets/logos/friday-intellytics.svg",
        focus: "AI-powered analytics platform from product strategy to implementation",
        details: [
          "Selected by the founder from 25+ candidates after an approximately 6-hour evaluation spanning data analytics, system design, AI-agent development, and product ideation.",
          "Assumed ownership of desktop application enhancements immediately after onboarding, shipping improvements across data integration, authentication, exports, and UI workflows.",
          "Owned product and development responsibilities for Friday's desktop application, contributing across feature planning, implementation, testing, debugging, and product refinement.",
          "Collaborated directly with the founder to convert the vision of an AI-powered analytics platform into executable user flows, product features, and MVP workflows.",
          "Designed and developed the company's public-facing landing page, translating product positioning into a responsive and user-centric web experience for stakeholder discovery and beta registration.",
          "Built and refined workflows that help users connect data sources, create analysis pipelines, and interact with insights through a conversational interface.",
          "Improved application usability by identifying workflow gaps, resolving user-facing issues, and iterating on features based on internal feedback.",
        ],
      },
      {
        company: "Yhills",
        role: "Web Development Intern (Remote)",
        dates: "Jan 2025 - Mar 2025",
        logo: "/assets/logos/yhills.svg",
        focus: "Responsive user-facing web interfaces and scalable web workflows",
        details: [
          "Developed responsive, user-facing web interfaces using HTML, CSS, JavaScript, and React, with focus on usability, performance, and consistent user experience.",
          "Integrated APIs with frontend components to enable smooth data flow across product workflows and improve end-to-end feature functionality.",
          "Collaborated with mentors and teammates to understand requirements, debug user-facing issues, and deliver functional web features.",
          "Participated in code reviews and documentation to ensure maintainable and scalable code.",
        ],
      },
      {
        company: "NoShack Solutions",
        role: "Frontend Developer Intern",
        dates: "Jul 2024 - Aug 2024",
        logo: "/assets/logos/noshack.svg",
        focus: "Production frontend development and dashboard workflows",
        details: [
          "Integrated REST APIs with the frontend and optimized data rendering in React and JavaScript.",
          "Worked with HTML + CSS for frontend modules and contributed to building interactive user-facing screens.",
          "Connected frontend pages with MongoDB-backed backend services using Node.js and Express.",
          "Assisted in developing internal dashboards and improving UI workflows based on client requirements.",
          "Collaborated with team members on debugging, testing, and enhancing system performance.",
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
    summary:
      "Anjana enjoys learning technologies not simply for the sake of mastering frameworks, but for understanding how they work together to build meaningful products.",
    story: [
      "Her technical expertise includes Python, JavaScript, TypeScript, Java, C, SQL, React, Vue, Node.js, Spring Boot, MongoDB, REST APIs, Git, Linux, and modern deployment platforms.",
      "She has also worked extensively with machine learning, data analytics, and scientific computing libraries including Scikit-learn, Pandas, NumPy, SciPy, and Matplotlib.",
      "Alongside engineering, she has developed a strong interest in product thinking, product discovery, requirements analysis, feature prioritization, UI/UX principles, Agile development, and creating intuitive user experiences that bridge technical functionality with thoughtful design.",
      "A personal part of that technical journey: she dual-booted her laptop to accommodate Arch Linux alongside Windows, and now primarily does her projects on Arch.",
    ],
    highlights: [
      "The skill set is organized as a system: product and design for shaping the experience, analytics and data for reasoning, engineering for building, and platforms for shipping.",
    ],
    skillGroups: [
      {
        title: "Product & Design",
        items: ["Product Discovery", "Requirements Analysis", "Feature Prioritization", "User / Problem Analysis", "User Flows", "Wireframing", "Agile Development", "UI/UX Principles", "Feature Planning", "Product Thinking", "Canva"],
      },
      {
        title: "Analytics & Data",
        items: ["Data Analysis", "Statistical Analysis", "Quantitative Problem Solving", "Data Visualization", "SQL", "Python", "Pandas", "NumPy", "Matplotlib", "SciPy", "Scikit-learn", "Seaborn", "Statistics", "Excel"],
      },
      {
        title: "Technical",
        items: ["JavaScript", "TypeScript", "Java", "C", "HTML", "CSS", "React.js", "Vue.js", "Node.js", "Spring Boot", "REST APIs"],
      },
      {
        title: "Databases & Platforms",
        items: ["MongoDB", "SQL", "Neo4j", "Git", "Linux", "Vercel", "Render"],
      },
    ],
    featureCards: [
      {
        label: "Certificates",
        title: "Full-stack learning",
        body: "Completed The Complete Full-Stack Web Development Bootcamp and a Value-Added Course in Full Stack Web App Development using Spring Boot and Vue.js.",
      },
      {
        label: "Environment",
        title: "Arch-first workflow",
        body: "Her Linux setup is not just a tag; it is part of how she experiments, builds, and ships projects.",
      },
    ],
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
    summary:
      "Beyond technical expertise, Anjana believes that impactful products are built through collaboration, empathy, and effective communication.",
    story: [
      "Her leadership experiences across student organizations and internships have strengthened her ability to manage teams, coordinate large-scale events, communicate across diverse groups, and take ownership of responsibilities.",
      "She enjoys solving problems collaboratively, adapting quickly to new challenges, and approaching projects with curiosity and a growth mindset.",
      "Whether leading an event, brainstorming product ideas, or working alongside developers and designers, she values clarity, accountability, and continuous learning.",
      "She also stepped into open source this year after being accepted as a GirlScript Summer of Code contributor; as someone new to open source, she has one PR merged and has raised a few issues.",
    ],
    highlights: [
      "Leadership, communication, ownership, collaboration, adaptability, clarity, accountability, empathy, and continuous learning are presented here as lived habits rather than one-word claims.",
      "Her Friday Intellytics work adds a product-growth lens: ambiguous requirements, direct founder collaboration, prioritized feature decisions, and ownership from problem definition through implementation.",
    ],
    featureCards: [
      {
        title: "Leadership",
        body: "Student organization roles and internships have trained her to manage teams, coordinate responsibilities, structure committees, and make decisions under real constraints.",
      },
      {
        title: "Communication",
        body: "She communicates across diverse groups: founders, mentors, teammates, developers, designers, event volunteers, and student communities.",
      },
      {
        title: "Collaboration",
        body: "She enjoys solving problems collaboratively and adapts quickly when projects, teams, or requirements change.",
      },
      {
        title: "Growth mindset",
        body: "Her GSSoC start reflects her willingness to enter new technical communities, learn in public, and contribute incrementally.",
      },
    ],
    tags: ["Leadership", "Empathy", "Communication", "Ownership", "Adaptability", "Growth mindset"],
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
      "Outside academics, Anjana is deeply involved in the technical and creative communities at SSN.",
    story: [
      "Over the years, she has held leadership positions across several student organizations, including serving as Club Head of SSN Design Club, Joint Secretary of IEEE Women in Engineering (WIE), Joint Event Coordinator of SSN ACE, Treasurer of SSN ACM Student Chapter, Deputy PR Lead and Full Stack Core Member of the SSN Coding Club, Under Secretary General of SSN SNUC MUN, and a core member of multiple technical and entrepreneurship clubs.",
      "These experiences have allowed her to organize large-scale technical events, mentor peers, manage teams, and contribute to initiatives that strengthen the student community.",
      "Her involvement beyond the classroom reflects a genuine enthusiasm for building communities, fostering collaboration, and creating opportunities for others to learn and grow.",
    ],
    highlights: [
      "Club Head, SSN Design Club, 2026-27; previously Junior Core, 2025-26. Promoted for design excellence and rapid execution, then selected and structured a 16-member Core Committee.",
      "Joint Event Coordinator, SSN ACE (ACE Office Bearer), 2025-26.",
      "Core organizer for Invente, coordinating 10+ competitions and approximately 200 registrations while owning design and documentation.",
      "Joint Secretary, SSN IEEE WIE, 2025.",
      "Coordinated 5 verticals and approximately 30-35 members for IEEE WIE, helped nearly double the team size, and led WISE 2025 with ACM-W.",
      "Treasurer, SSN ACM Student Chapter, 2025-26; contributed to ACM Hour of Code and helped secure approximately US$250 in ACM funding.",
      "Full-Stack Development Core, SSN Coding Club, 2025-26.",
      "Deputy PR Lead, SSN Coding Club, 2025-26.",
      "Event Management member, SSN ACM, 2025-26.",
      "Under Secretary General, SSN SNUC MUN, 2025.",
      "Additional leadership spans Core PR at SSN Networks, Head Girl, Director of Event Management at Polemic Debating Venture, and MC/compere roles for ICCIDS, Sports Day, CSI Inauguration, and ACM Competitive Thinking Workshop.",
      "Core Member, QFactorial, 2025.",
      "Junior Core, Gradient Design Club (SDC), 2025.",
      "Creative and PR Member, Lakshya E-Cell Entrepreneurship Club, 2025-26.",
    ],
    featureCards: [
      {
        label: "Community",
        title: "Building student spaces",
        body: "Her roles combine event planning, mentoring, team management, committee structure, design support, public relations, and technical community work.",
      },
      {
        label: "Impact",
        title: "Beyond participation",
        body: "The focus is not only attending clubs, but strengthening the student community through repeat responsibility.",
      },
    ],
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
    summary:
      "For Anjana, creativity has always existed alongside technology.",
    story: [
      "She found expression through traditional art. Working primarily with hand-drawn illustrations and mixed media, art has been an integral part of her life from an early age.",
      "At the age of 14, she held her own public art exhibition, an experience that not only strengthened her artistic confidence but also shaped the way she approaches creativity and problem-solving today.",
      "Her interest in design naturally evolved alongside her technical journey. As the Head of the Gradient Design Club at SSN, she leads the college's design community, mentors aspiring designers, and oversees the visual identity of student initiatives and events.",
      "Through this role, she has developed a deeper appreciation for design as a tool for communication, accessibility, and storytelling.",
      "Beyond art and design, Anjana enjoys being on stage. Whether compering events, hosting programs, or speaking before large audiences, she finds energy in engaging with people and creating memorable experiences.",
      "Years of public speaking have strengthened her confidence, communication skills, and ability to connect with diverse audiences.",
      "Looking ahead, she hopes to build a career where technology and design complement one another. Her long-term vision is to create products that are not only technically innovative but also intuitive, visually thoughtful, and centered around the people who use them.",
    ],
    highlights: [
      "Traditional art and mixed media remain a long-running creative practice.",
      "Design leadership at Gradient connects her creative identity to her technical journey.",
      "Public speaking, compering, and hosting shape how she communicates with people.",
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
    summary:
      "Anjana's journey has been shaped by a balance of academic excellence, technical curiosity, creative expression, and leadership.",
    story: [
      "As of the sixth semester, she holds the 3rd Department Rank in the Integrated M.Tech Computer Science and Engineering program at Sri Sivasubramaniya Nadar College of Engineering, maintaining a CGPA of 9.237/10 through consistent academic performance.",
      "She also secured 1st place at MIT Tech Symposium 2026 and VIT Intercollegiate Tech Symposium for Causal Deforestation Propagation Prediction via Road-Aware Graph Attention Networks, earning Rs. 8,000 in combined prize winnings.",
      "Her leadership journey began well before college when she served as the School Pupil Leader (Head Girl), representing the student body and leading school-wide initiatives.",
      "Since then, she has continued to take on leadership roles across multiple student organizations at SSN, including serving as Joint Secretary of IEEE Women in Engineering, Joint Event Coordinator of SSN ACE, and currently leading the Gradient Design Club.",
      "These experiences have strengthened her ability to manage teams, organize large-scale events, and foster collaborative communities.",
      "Her technical accomplishments include being a Finalist in the Internal Smart India Hackathon and securing a position in the Top 15% globally in Kaggle's Spaceship Titanic Machine Learning Competition.",
      "Outside engineering, creativity has remained a defining part of her identity. At the age of 14, she hosted her own art exhibition, an early milestone that continues to influence her approach to design, communication, and product thinking.",
      "For Anjana, success is measured not only by academic achievements or technical projects, but by continuously learning, leading with purpose, and creating work that leaves a meaningful impact.",
      "She was also accepted as a GirlScript Summer of Code contributor earlier this year, with one PR merged and a few issues raised as she begins contributing to open source.",
    ],
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
