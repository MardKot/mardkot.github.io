export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: "all" | "web_mobile" | "design_ui" | "backend_systems";
  categoryLabel: string;
  description: string;
  problem: string;
  solution: string;
  highlights: string[];
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  image: string;
  featured: boolean;
  metrics?: { label: string; value: string }[];
  date: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  tagline: string;
  description: string;
  skills: { name: string; level: number; highlight?: boolean }[];
  tools: string[];
}

export interface HeadlineOption {
  id: number;
  badge: string;
  headline: string;
  subtext: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  role: string;
  type: "experience" | "education" | "project";
  description: string;
  subtle?: boolean;
}
