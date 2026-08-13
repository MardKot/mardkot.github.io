# 🚀 Portfolio Professionnel — Mardoché KOTIN

> **Software & Mobile Engineer (Flutter, React, Node.js) | UI/UX & Graphic Designer**
> 
> *Du concept visuel au code performant : Conception et développement d'expériences web & mobiles sur-mesure.*

---

## 📌 Présentation

Ce dépôt contient le code source du portfolio interactif de **Mardoché KOTIN**. Conçu avec une approche moderne et réactive, il met en valeur une double expertise rare : **la rigueur de l'ingénierie logicielle full-stack & mobile** combinée à **la sensibilité artistique du design graphique et UI/UX**.

### ✨ Points Forts du Portfolio :
- 🎯 **Hero Interactif Multi-Accroches** : Sélecteur dynamique de propositions de valeur adaptées aux recruteurs, clients et collaborateurs techniques.
- 👤 **Portrait Professionnel & Remplacement Dynamique** : Intégration haute résolution avec prévisualisation locale instantanée.
- 💡 **Piliers d'Ingénierie & Vision** : Architecture logicielle propre, conception mobile-first fluide (60 FPS), intégration de passerelles de paiement (Mobile Money) et design systems complets.
- 🛠️ **Vitrine de Compétences par Domaines** :
  - **Développement Mobile & Cross-Platform** (Flutter, Dart, React Native, Firebase)
  - **Full-Stack Web & APIs** (React, TypeScript, Node.js, Express, Tailwind CSS, PostgreSQL, REST/GraphQL)
  - **Design Graphique, Branding & UI/UX** (Figma, Adobe Illustrator, Photoshop, Design Tokens, Prototypage)
  - **Architecture, Cloud & Résilience** (Sécurité, Cache Redis, Cloud Run / GCP, Débogage avancé)
- 📂 **Showcase & Études de Cas de Projets** : Filtrage par catégories (Web & Mobile, Mobile Flutter, Backend, UI/UX), métriques d'impact, modale d'exploration détaillée et liens GitHub directs.
- 🎨 **Studio Graphique & Design** : Galerie de réalisations visuelles (identités de marque, interfaces d'applications, chartes).
- 📬 **Module de Contact & Réseaux** : Formulaire interactif, copie de l'adresse email en 1 clic et accès direct aux profils GitHub et LinkedIn.

---

## 🛠️ Stack Technologique

| Domaine | Technologies |
| :--- | :--- |
| **Frontend** | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styles & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Motion (Framer)](https://motion.dev/), [Lucide React](https://lucide.dev/) |
| **Serveur Backend** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/) |
| **Design & Prototypage** | Figma, Adobe Illustrator, Adobe Photoshop |
| **Déploiement** | GitHub Pages, Vercel, Google Cloud Run |

---

## 📂 Structure du Projet

```text
├── public/                 # Fichiers statiques publics
├── src/
│   ├── assets/             # Images, mockups et portrait professionnel
│   │   └── images/
│   ├── components/         # Composants React modulaires
│   │   └── portfolio/
│   │       ├── Navbar.tsx         # Barre de navigation responsive avec indicateurs
│   │       ├── HeroSection.tsx    # Section d'accueil interactive avec photo & switch d'accroches
│   │       ├── AboutSection.tsx   # Profil, parcours chronologique et vision
│   │       ├── SkillsSection.tsx  # Matrice des compétences et jauges de maîtrise
│   │       ├── ProjectsSection.tsx # Catalogue de projets et modales d'étude de cas
│   │       ├── DesignShowcase.tsx # Galerie du studio graphique et branding
│   │       ├── ContactSection.tsx # Formulaire de prise de contact & coordonnées
│   │       └── Footer.tsx         # Pied de page et liens rapides
│   ├── data/
│   │   └── portfolioData.ts # Données centralisées (projets, parcours, compétences)
│   ├── types/
│   │   └── portfolio.ts     # Définitions TypeScript strictes
│   ├── App.tsx             # Composant racine
│   ├── main.tsx            # Point d'entrée de l'application React
│   └── index.css           # Thème et styles Tailwind CSS
├── index.html              # Fichier HTML principal avec typographies
├── server.ts               # Serveur Express (API routes & middleware Vite)
├── vite.config.ts          # Configuration Vite (support GitHub Pages base './')
├── package.json            # Dépendances et scripts de build
└── metadata.json           # Métadonnées de l'application
```

---

## 🚀 Démarrage en Local

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/) ou [yarn](https://yarnpkg.com/)

### 2. Installation des dépendances
```bash
git clone https://github.com/MardKot/portfolio.git
cd portfolio
npm install
```

### 3. Lancer le serveur de développement
```bash
npm run dev
```
L'application sera accessible sur **`http://localhost:3000`**.

### 4. Compiler pour la production
```bash
npm run build
```
Les fichiers statiques optimisés seront générés dans le dossier `dist/`.

---

## 🌐 Déploiement sur GitHub Pages

Le projet est préconfiguré pour un déploiement fluide sur **GitHub Pages** grâce au chemin relatif `base: './'` dans `vite.config.ts`.

### Méthode Automatique (GitHub Actions — Recommandée)

1. Poussez votre dépôt sur GitHub :
   ```bash
   git add .
   git commit -m "Deploy: Portfolio Mardoché Kotin"
   git push origin main
   ```

2. Créez un fichier `.github/workflows/deploy.yml` avec le contenu suivant :
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: ["main"]

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: true

   jobs:
     build-and-deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'npm'

         - name: Install Dependencies
           run: npm ci

         - name: Build
           run: npm run build

         - name: Setup Pages
           uses: actions/configure-pages@v4

         - name: Upload Artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

3. Sur GitHub, rendez-vous dans **Settings** ➔ **Pages** ➔ sous **Source**, choisissez **GitHub Actions**.
4. Votre portfolio sera automatiquement déployé à l'adresse :
   👉 `https://mardkot.github.io/portfolio/` *(ou `https://mardkot.github.io/` si le dépôt s'appelle `MardKot.github.io`)*.

---

## 📬 Contact & Réseaux

- **Nom** : Mardoché KOTIN
- **Email** : [mardochekotin@gmail.com](mailto:mardochekotin@gmail.com)
- **GitHub** : [@MardKot](https://github.com/MardKot)
- **LinkedIn** : [Mardoché Kotin](https://www.linkedin.com/in/mardoche-kotin)

---

*Développé avec passion par Mardoché Kotin — © 2026 Tous droits réservés.*
