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

import portfolioJson from "@/data/portfolio.json";

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = portfolioJson as unknown as PortfolioData;

