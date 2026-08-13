import React from "react";
import Navbar from "./components/portfolio/Navbar";
import HeroSection from "./components/portfolio/HeroSection";
import AboutSection from "./components/portfolio/AboutSection";
import SkillsSection from "./components/portfolio/SkillsSection";
import ProjectsSection from "./components/portfolio/ProjectsSection";
import DesignShowcase from "./components/portfolio/DesignShowcase";
import ContactSection from "./components/portfolio/ContactSection";
import Footer from "./components/portfolio/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Portfolio Sections */}
      <main>
        {/* Hero Section with Photo and 3 Headline variants */}
        <HeroSection />

        {/* Section 2: Profil & Vision (À propos) */}
        <AboutSection />

        {/* Section 3: Domaines d'Action (Expertises & Stack) */}
        <SkillsSection />

        {/* Section 4: Showcase & Projets Phares (GitHub & Case Studies) */}
        <ProjectsSection />

        {/* Studio Graphique, Identité & UI/UX */}
        <DesignShowcase />

        {/* Section 5: Contact & Réseaux */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
