export type StatItem = {
  label: string;
  value: string;
};

export type ProfileData = {
  name: string;
  role: string;
  greeting: string;
  heroIntro: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDescription: string;
  aboutTagline: string;
  aboutParagraphs: string[];
  mission: string;
  stats: StatItem[];
  email: string;
  telegram: string;
  telegramHandle: string;
  twitter: string;
  twitterHandle: string;
  availability: string;
  cvUrl: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  meta: string;
  image: string;
  imageAlt: string;
  link: string;
  order: number;
};

export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  period: string;
  brand: string;
  description: string;
  slug?: string;
  order: number;
};

export type EducationItem = {
  id: string;
  school: string;
  degree: string;
  period: string;
  tag: string;
  brand: string;
  order: number;
};

export type StackChipItem = {
  id: string;
  label: string;
  slug: string;
  bg: string;
  fg: string;
  iconUrl?: string;
  order: number;
};

export type PortfolioData = {
  profile: ProfileData;
  projects: ProjectItem[];
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  stack: StackChipItem[];
};

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: "Guy Tibro",
    role: "Social Media & Community Manager",
    greeting: "Hello! I'm Guy Tibro.",
    heroIntro: "Hey 👋🏿, I'm Guy Tibro",
    heroTitle1: "Social Media &",
    heroTitle2: "Community Manager",
    heroDescription:
      "Specialized in the Web3 ecosystem. 5+ years turning crypto communities into sustainable growth engines through high-impact content, automated moderation, and responsive support.",
    aboutTagline:
      "Passionate Web3 strategist with 5+ years of hands-on experience turning crypto audiences into thriving, loyal communities across Telegram, Discord, and X (Twitter).",
    aboutParagraphs: [
      "I help crypto projects amplify their visibility, engagement, and user satisfaction across core channels like Telegram, X (Twitter), and Discord. I specialize in turning passive visitors into loyal, engaged advocates through interactive campaigns (AMAs, trading competitions, airdrops), KOL partnerships, and intelligent bot automation.",
      "Having collaborated with established exchanges and Web3 protocols like Gate.io Exchange, Bitget, Amphor.io, NexGami, and AZEN, I know how to navigate the fast-paced Web3 landscape, engage multicultural communities, and mitigate crisis situations with tact and speed.",
      "My expertise pairs proactive engagement with vigilant community protection: removing spam, preempting phishing attacks, and ensuring users always find knowledgeable, helpful support when they need it most.",
    ],
    mission:
      "To turn every Web3 community into a sustainable growth engine while ensuring a seamless, responsive user experience and vigilant anti-scam protection.",
    stats: [
      { label: "Years Experience", value: "5+" },
      { label: "Web3 Communities", value: "10+" },
      { label: "Remote & Bilingual", value: "100%" },
      { label: "Support & Safety", value: "24/7" },
    ],
    email: "guyweb3cm@gmail.com",
    telegram: "https://t.me/guyletibro",
    telegramHandle: "@guyletibro",
    twitter: "https://twitter.com/guyletibro",
    twitterHandle: "@guyletibro",
    availability: "Available for remote work worldwide",
    cvUrl: "/Tibro_CV.pdf",
  },
  projects: [
    {
      id: "gateio",
      title: "Gate.io Exchange - French Community Growth",
      category: "Exchange Community",
      description:
        "Led official French community operations. Organized AMAs, trading competitions, and influencer activations while deploying moderation bots.",
      meta: "Community Lead • AMAs • Growth Campaigns",
      image:
        "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1000&auto=format&fit=crop",
      imageAlt: "Gate.io Community Growth",
      link: "/projects",
      order: 1,
    },
    {
      id: "bitget",
      title: "Bitget - Customer Feedback & Market Insights",
      category: "Exchange Operations",
      description:
        "Analyzed French trader sentiment and platform friction points. Escalated critical product improvements and improved user retention.",
      meta: "Customer Feedback (CF) Specialist • Retention",
      image:
        "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1000&auto=format&fit=crop",
      imageAlt: "Bitget Customer Support",
      link: "/projects",
      order: 2,
    },
    {
      id: "amphor",
      title: "Amphor.io - DeFi Protocol Moderation & Anti-Scam",
      category: "DeFi Protocol",
      description:
        "Managed day-to-day community support, moderated spam and phishing attacks, and resolved user protocol questions during high-volume periods.",
      meta: "Community Manager • Anti-Phishing • Technical Support",
      image:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000&auto=format&fit=crop",
      imageAlt: "Amphor.io DeFi Protocol",
      link: "/projects",
      order: 3,
    },
    {
      id: "nexgami",
      title: "NexGami & Metavirus - Gaming Web3 Community & KOLs",
      category: "Web3 Gaming",
      description:
        "Built international community across Discord, Telegram, and X. Coordinated bilingual KOL partnerships and interactive AMAs.",
      meta: "Community Lead • KOL Partnerships • GameFi AMAs",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
      imageAlt: "NexGami Web3 Gaming",
      link: "/projects",
      order: 4,
    },
  ],
  experiences: [
    {
      id: "gateio",
      company: "Gate.io Exchange",
      role: "French Community Manager",
      period: "Mar 2024 – Jun 2025",
      brand: "#1B59F8",
      description:
        "Led and managed the Gate.io community. Organized AMAs, trading competitions, giveaways. Managed KOL collaborations and programmed automated moderation bots.",
      order: 1,
    },
    {
      id: "amphor",
      company: "Amphor.io",
      role: "English Community Manager",
      period: "May 2024 – Apr 2025",
      brand: "#7A5AF8",
      description:
        "Managed and moderated the community, removed spam, assisted users with protocol questions, and handled fraud/scam situations.",
      order: 2,
    },
    {
      id: "nexgami",
      company: "NexGami & Metavirus",
      role: "English & French Community Manager",
      period: "Mar 2023 – Jan 2025",
      brand: "#EE46BC",
      description:
        "Moderated Telegram, Twitter/X, and Discord. Coordinated KOL partnerships, created bilingual content, and organized interactive AMAs.",
      order: 3,
    },
    {
      id: "azen",
      company: "AZEN",
      role: "English CM & Business Developer (BD)",
      period: "Dec 2023 – Aug 2024",
      brand: "#12B76A",
      description:
        "Formulated visibility and growth strategies, negotiated business partnerships, and moderated community discussions.",
      order: 4,
    },
    {
      id: "bitget",
      company: "Bitget",
      role: "Customer Feedback Specialist – French Market",
      period: "2023",
      brand: "#00B4D8",
      description:
        "Collected and analyzed user feedback to improve platform UX. Escalated technical issues and supported French traders.",
      order: 5,
    },
    {
      id: "commex",
      company: "Commex Exchange",
      role: "French Moderator",
      period: "2023 – 2024",
      brand: "#F04438",
      description:
        "Protected users against scams and phishing, moderated channels, and assisted members with trade questions.",
      order: 6,
    },
    {
      id: "binance",
      company: "CoinEx & Binance",
      role: "Web3 Ambassador",
      period: "2021 – 2023",
      slug: "binance",
      brand: "#F3BA2F",
      description:
        "Educated newcomers on crypto fundamentals and Web3 onboarding, represented the exchange brands across local and online communities.",
      order: 7,
    },
  ],
  education: [
    {
      id: "w3",
      school: "Web3 Community Leadership",
      degree: "Community Management & Ecosystem Strategy",
      period: "2020 – Present",
      tag: "W3",
      brand: "#7A5AF8",
      order: 1,
    },
    {
      id: "crm",
      school: "Customer Operations & CRM",
      degree: "User Feedback Analysis & Technical Escalation",
      period: "2022 – Present",
      tag: "CRM",
      brand: "#00B4D8",
      order: 2,
    },
    {
      id: "kol",
      school: "Growth & KOL Marketing",
      degree: "AMAs, Competitions & Airdrop Campaigns",
      period: "2021 – Present",
      tag: "KOL",
      brand: "#12B76A",
      order: 3,
    },
    {
      id: "lang",
      school: "Language Proficiency",
      degree: "French (Native) • English (Fluent)",
      period: "Bilingual",
      tag: "LANG",
      brand: "#F04438",
      order: 4,
    },
  ],
  skills: [
    "Community Management",
    "Social Media Strategy",
    "Web3 & Crypto Ecosystem",
    "Telegram & Discord Moderation",
    "KOL Partnerships & Outreach",
    "AMA Hosting & Organization",
    "Customer Support & Ticketing",
    "Growth Marketing & Airdrops",
    "Bot Automation & Moderation",
    "Feedback Analysis & Escalation",
    "Anti-Spam & Fraud Prevention",
    "Bilingual: French & English",
  ],
  stack: [
    { id: "1", label: "Telegram", slug: "telegram", bg: "#229ED9", fg: "#ffffff", order: 1 },
    { id: "2", label: "Discord", slug: "discord", bg: "#5865F2", fg: "#ffffff", order: 2 },
    { id: "3", label: "X / Twitter", slug: "x", bg: "#111111", fg: "#ffffff", order: 3 },
    { id: "4", label: "Binance", slug: "binance", bg: "#F3BA2F", fg: "#000000", order: 4 },
    { id: "5", label: "Zendesk", slug: "zendesk", bg: "#03363D", fg: "#ffffff", order: 5 },
    { id: "6", label: "Notion", slug: "notion", bg: "#181717", fg: "#ffffff", order: 6 },
    {
      id: "7",
      label: "CoinGecko",
      slug: "coingecko",
      bg: "#8DC63F",
      fg: "#000000",
      iconUrl: "/icons/coingecko.png",
      order: 7,
    },
    { id: "8", label: "CoinMarketCap", slug: "coinmarketcap", bg: "#171A21", fg: "#ffffff", order: 8 },
    { id: "9", label: "Medium", slug: "medium", bg: "#12100E", fg: "#ffffff", order: 9 },
    { id: "10", label: "Reddit", slug: "reddit", bg: "#FF4500", fg: "#ffffff", order: 10 },
    { id: "11", label: "Google Analytics", slug: "googleanalytics", bg: "#E37400", fg: "#ffffff", order: 11 },
    { id: "12", label: "Canva", slug: "canva", bg: "#00C4CC", fg: "#ffffff", iconUrl: "/icons/canva.png", order: 12 },
  ],
};
