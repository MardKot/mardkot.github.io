import { Project, SkillCategory, HeadlineOption, TimelineItem } from "../types/portfolio";

import portraitImg from "../assets/images/mardoche_photo_exact_1786645855861.JPG";
import webPlatformImg from "../assets/images/platform_mockup_1786645292843.jpg";
import mobileAppsImg from "../assets/images/mobile_apps_mockup_1786645305899.jpg";
import graphicDesignImg from "../assets/images/graphic_design_mockup_1786645317623.jpg";

export const PERSONAL_INFO = {
  name: "Mardoché KOTIN",
  title: "Software & Mobile Engineer | UI/UX & Graphic Designer",
  location: "Bénin (Disponible en Remote & sur site)",
  availability: "Disponible pour nouveaux projets & collaborations",
  email: "mardochekotin@gmail.com",
  github: "https://github.com/MardKot",
  githubUsername: "MardKot",
  linkedin: "https://www.linkedin.com/in/mardoche-kotin",
  phone: "+229 97 00 00 00",
  whatsapp: "+229 97 00 00 00",
  avatarUrl: portraitImg,
  stats: [
    { value: "+15", label: "Projets livrés", detail: "Web, Mobile & Design" },
    { value: "100%", label: "Code & Design", detail: "Conception de bout en bout" },
    { value: "5+", label: "Stacks maîtrisées", detail: "Flutter, React, Node, Firebase, UI" },
    { value: "⚡", label: "Temps réel & Perf", detail: "Architecture scalable" },
  ]
};

export const HEADLINES: HeadlineOption[] = [
  {
    id: 1,
    badge: "Option 1 • Impact & Double Compétence",
    headline: "Du concept visuel au code performant : Je conçois et développe des expériences web & mobiles sur-mesure.",
    subtext: "Développeur Full-Stack & Mobile (Flutter, React, Firebase) doublé d'un Designer Graphique & UI/UX. J'allie sens esthétique pointu et rigueur d'ingénierie pour bâtir des produits digitaux complets, fiables et engageants."
  },
  {
    id: 2,
    badge: "Option 2 • Innovation & Architecture Produit",
    headline: "Architecte de solutions digitales : L'alliance parfaite de l'esthétique graphique et de l'ingénierie logicielle.",
    subtext: "Je transforme des problématiques réelles en interfaces élégantes et systèmes résilients. Du premier wireframe sur Figma à l'application mobile déployée sur les stores."
  },
  {
    id: 3,
    badge: "Option 3 • Résultat & Vision Business",
    headline: "Je donne vie à vos idées avec des applications mobiles robustes, intuitives et visuellement remarquables.",
    subtext: "Conception centrée utilisateur, temps réel, intégrations de paiements locaux et architecture logicielle propre pour propulser vos projets à la vitesse supérieure."
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "dev",
    title: "Développement Web & Mobile",
    icon: "Smartphone",
    tagline: "Architecture propre, réactivité native & gestion temps réel",
    description: "Conception d'applications mobiles multiplateformes et de plateformes web complètes, stables et rapides.",
    skills: [
      { name: "Flutter & Dart", level: 95, highlight: true },
      { name: "React & TypeScript", level: 90, highlight: true },
      { name: "Firebase (Firestore, Auth, Rules)", level: 92, highlight: true },
      { name: "Node.js & Express API", level: 88 },
      { name: "FlutterFlow & No-Code avancé", level: 90 },
      { name: "Tailwind CSS & Animations", level: 95 },
      { name: "REST APIs & Intégrations Payment", level: 90 },
      { name: "State Management (Bloc/Riverpod/Context)", level: 88 }
    ],
    tools: ["Flutter SDK", "React 19", "TypeScript", "Node.js", "Firebase", "Express", "Tailwind CSS", "Git / GitHub"]
  },
  {
    id: "design",
    title: "Design Graphique & Identité Visuelle",
    icon: "Palette",
    tagline: "Marques mémorables, typographies élégantes & UI/UX premium",
    description: "Création d'identités de marque complètes, affiches, maquettes ergonomiques et design systems cohérents.",
    skills: [
      { name: "Maquettage UI/UX (Figma)", level: 95, highlight: true },
      { name: "Identité Visuelle & Logo Branding", level: 92, highlight: true },
      { name: "Design Systems & Composants", level: 90, highlight: true },
      { name: "Affiches, Flyers & Communication", level: 88 },
      { name: "Adobe Photoshop & Illustrator", level: 85 },
      { name: "Prototypes Interactifs", level: 92 },
      { name: "Typographie & Théorie des couleurs", level: 90 }
    ],
    tools: ["Figma", "Adobe Illustrator", "Photoshop", "Canva Pro", "Design Tokens", "Wireframing", "Color Science"]
  },
  {
    id: "tech_support",
    title: "Expertise & Support Technique",
    icon: "Wrench",
    tagline: "Performance, sécurité, maintenance & intégrations critiques",
    description: "Audit technique, optimisation des temps de réponse, résolution de bugs complexes et intégrations tierces.",
    skills: [
      { name: "Passerelles de paiement (FedaPay, Kkiapay)", level: 95, highlight: true },
      { name: "Optimisation des performances & Cache", level: 88 },
      { name: "Sécurité applicative & Gestion des rôles", level: 90, highlight: true },
      { name: "Débogage avancé (Hardware & Software)", level: 92 },
      { name: "Déploiement Cloud & Hosting (Vercel, GCP)", level: 85 },
      { name: "Architecture modulaire & Clean Code", level: 92 }
    ],
    tools: ["FedaPay SDK", "Kkiapay SDK", "GCP / Cloud Run", "Vercel", "Postman", "Chrome DevTools", "Docker basics"]
  }
];

export const PROJECTS: Project[] = [
  {
    id: "logiflow-platform",
    title: "LogiFlow — Hub Logistique & E-commerce Temps Réel",
    subtitle: "Plateforme de commerce et d'orchestration logistique multi-rôles en temps réel",
    category: "web_mobile",
    categoryLabel: "Full-Stack Web & Mobile",
    description: "Écosystème logistique complet connectant les clients, les acheteurs de terrain et les livreurs. Il intègre un suivi GPS des coursiers, une gestion fine des stocks et l'intégration des passerelles de paiement locales.",
    problem: "Complexité de la coordination multi-acteurs dans la chaîne logistique de distribution avec manque de visibilité en direct et absence de système unifié.",
    solution: "Développement d'une application multi-interfaces (5 profils métiers synchronisés) avec calcul intelligent d'itinéraires, gestion de paniers dynamiques et synchronisation temps réel.",
    highlights: [
      "5 espaces rôles dédiés : Client, Acheteur, Chef acheteur, Livreur, Manager",
      "Tracking GPS en direct des livreurs en tournée",
      "Paiements Mobile Money intégrés via FedaPay & Kkiapay",
      "Moteur d'orchestration temps réel avec Cloud Firestore"
    ],
    technologies: ["React", "TypeScript", "Node.js", "Express", "Firebase Firestore", "Tailwind CSS", "FedaPay", "Kkiapay", "Gemini API"],
    githubUrl: "https://github.com/MardKot",
    liveUrl: "#",
    image: webPlatformImg,
    featured: true,
    metrics: [
      { label: "Rôles gérés", value: "5 profils" },
      { label: "Temps de réponse", value: "< 120ms" },
      { label: "Paiement", value: "100% Mobile Money" }
    ],
    date: "2026"
  },
  {
    id: "monavis-mobile",
    title: "MonAvis — Évaluation & Confiance Mobile",
    subtitle: "Application mobile native de collecte d'avis certifiés et notations de services",
    category: "web_mobile",
    categoryLabel: "Mobile (Flutter)",
    description: "Application mobile moderne conçue sous Flutter et alimentée par Firebase, permettant aux utilisateurs d'évaluer et de consulter les retaux d'expérience vérifiés sur les commerces et prestataires locaux.",
    problem: "Manque de repères fiables pour choisir des prestataires de confiance dans l'écosystème local sans avis vérifiés.",
    solution: "Application fluide 60fps avec système de badges vérifiés, recherche géolocalisée et notation multidimensionnelle.",
    highlights: [
      "Interface mobile soignée sous Flutter avec animations fluides",
      "Synchronisation temps réel via Cloud Firestore",
      "Authentification sécurisée & gestion des profils",
      "Mode offline-first avec synchronisation automatique"
    ],
    technologies: ["Flutter", "Dart", "Firebase Auth", "Firestore", "Figma", "UI/UX Design"],
    githubUrl: "https://github.com/MardKot",
    image: mobileAppsImg,
    featured: true,
    metrics: [
      { label: "Plateforme", value: "iOS & Android" },
      { label: "Performance", value: "60 FPS" },
      { label: "Offline Mode", value: "Actif" }
    ],
    date: "2025 - 2026"
  },
  {
    id: "brand-identity-studio",
    title: "Studio Visual Identity & Design Systems",
    subtitle: "Direction artistique, branding complet et systèmes de design pour startups",
    category: "design_ui",
    categoryLabel: "Design Graphique & UI/UX",
    description: "Création d'identités de marque fortes et de systèmes graphiques réutilisables. Conception de logos vectoriels, guides de style typographiques, chartes de couleurs et kits d'interface utilisateur Figma prêts pour l'intégration.",
    problem: "Beaucoup de projets tech échouent à convertir par manque d'une image de marque professionnelle et d'une ergonomie visuelle claire.",
    solution: "Création d'un système visuel holistique reliant l'identité de marque imprimée/digitale aux composants UI interactifs dans le code.",
    highlights: [
      "Logotypes vectoriels scalables et distinctifs",
      "Kits UI Figma avec composants auto-layout et design tokens",
      "Supports publicitaires et affiches événementielles percutantes",
      "Cohérence visuelle du prototype jusqu'au produit final"
    ],
    technologies: ["Figma", "Adobe Illustrator", "Photoshop", "Brand Identity", "Design Tokens", "Typography"],
    githubUrl: "https://github.com/MardKot",
    image: graphicDesignImg,
    featured: true,
    metrics: [
      { label: "Livrables", value: "Full Brand Pack" },
      { label: "Figma Tokens", value: "+200 composants" },
      { label: "Format", value: "Vector & Code ready" }
    ],
    date: "2025 - 2026"
  },
  {
    id: "agroconnect-hub",
    title: "AgroConnect — Marketplace & Circuits Courts",
    subtitle: "Mise en relation directe producteurs et distributeurs urbains",
    category: "web_mobile",
    categoryLabel: "Web App & Mobile",
    description: "Plateforme favorisant la commercialisation directe avec calcul dynamique des prix selon les saisons et gestion des volumes en gros et demi-gros.",
    problem: "Intermédiaires multiples qui réduisent les marges des producteurs et augmentent les coûts pour les distributeurs.",
    solution: "Place de marché digitale directe avec notifications SMS/Push et tarification transparente.",
    highlights: [
      "Système d'offres et de prix indicatifs du marché",
      "Catalogue dynamique avec gestion des stocks saisonniers",
      "Interface simple et accessible même sur réseau à faible débit"
    ],
    technologies: ["FlutterFlow", "Firebase", "Cloud Functions", "Tailwind CSS", "Mobile Money"],
    githubUrl: "https://github.com/MardKot",
    image: webPlatformImg,
    featured: false,
    date: "2025"
  },
  {
    id: "taskflow-suite",
    title: "TaskFlow — Suite Mobile de Collaboration",
    subtitle: "Application mobile de gestion agile et coordination d'équipes de terrain",
    category: "web_mobile",
    categoryLabel: "Mobile (Flutter & Firebase)",
    description: "Outil ergonomique de suivi de tâches et de checklists opérationnelles conçu pour les équipes mobiles et managers de projets.",
    problem: "Perte de traçabilité des opérations terrain et communication fragmentée sur messageries non professionnelles.",
    solution: "Application mobile intuitive avec tableaux Kanban simplifiés, assignation rapide et rapports instantanés.",
    highlights: [
      "Mises à jour instantanées des tâches assignées",
      "Fil de discussion contextuel par tâche",
      "Export PDF des comptes-rendus d'activité"
    ],
    technologies: ["Flutter", "Dart", "Firebase", "Material You", "Figma"],
    githubUrl: "https://github.com/MardKot",
    image: mobileAppsImg,
    featured: false,
    date: "2025"
  },
  {
    id: "api-payment-gateway",
    title: "Secure Payment Hub & Microservices Core",
    subtitle: "Passerelle d'orchestration API sécurisée pour paiements et webhooks",
    category: "backend_systems",
    categoryLabel: "Backend & Architectures",
    description: "Module backend robuste gérant la sécurité, le routage de transactions, la signature cryptographique des webhooks FedaPay/Kkiapay et la mise en cache Redis.",
    problem: "Risque de double débit et échecs de synchronisation lors des paiements mobiles avec connectivité instable.",
    solution: "Architecture idempotente avec vérification asynchrone des transactions et journal d'audit infalsifiable.",
    highlights: [
      "Gestion robuste de l'idempotence des transactions",
      "Documentation interactive Swagger / OpenAPI",
      "Monitoring en temps réel des flux monétaires"
    ],
    technologies: ["Node.js", "Express", "TypeScript", "Redis", "JWT", "OpenAPI / Swagger"],
    githubUrl: "https://github.com/MardKot",
    image: webPlatformImg,
    featured: false,
    date: "2026"
  }
];

export const TIMELINE: TimelineItem[] = [
  {
    year: "Aujourd'hui",
    title: "Ingénieur Logiciel & Designer Indépendant",
    role: "Full-Stack, Mobile & UI/UX",
    type: "experience",
    description: "Conception et développement de produits complets (web, mobile, backend) et direction artistique pour startups et clients locaux/internationaux."
  },
  {
    year: "2024 - 2026",
    title: "Projets d'envergure : Plateformes SaaS & Applications Mobiles",
    role: "Lead Developer & Product Designer",
    type: "project",
    description: "Architecture de systèmes temps réel, intégration de paiements locaux, design systems Figma et déploiement d'applications mobiles performantes."
  },
  {
    year: "2022 - 2024",
    title: "Développeur Mobile & Web / Graphiste Freelance",
    role: "Flutter, React, Identité Visuelle",
    type: "experience",
    description: "Réalisation d'applications mobiles Flutter, sites web responsifs et création d'identités visuelles complètes pour diverses entreprises."
  },
  {
    year: "Parcours",
    title: "Formation d'Ingénierie en Génie Logiciel",
    role: "Spécialisation Systèmes & Applications Mobiles",
    type: "education",
    description: "Solide socle académique en algorithmique avancée, architecture logicielle, bases de données et génie logiciel.",
    subtle: true
  }
];

export const DESIGN_WORKS = [
  {
    id: "d1",
    title: "LogiFlow Hub — Identité & Système Visuel",
    category: "Branding & App UI",
    image: webPlatformImg,
    tags: ["Logo", "Charte Graphique", "UI Kit"]
  },
  {
    id: "d2",
    title: "MonAvis — Mobile Experience Design",
    category: "UI/UX Design",
    image: mobileAppsImg,
    tags: ["Mobile UI", "Figma", "User Flow"]
  },
  {
    id: "d3",
    title: "Startup Visual Identity Suite",
    category: "Brand Design",
    image: graphicDesignImg,
    tags: ["Illustrator", "Typographie", "Packaging"]
  }
];
