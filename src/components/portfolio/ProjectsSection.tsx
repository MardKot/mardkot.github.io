import React, { useState } from "react";
import { 
  FolderGit2, 
  Github, 
  ExternalLink, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  Smartphone, 
  Palette, 
  Code2, 
  Eye
} from "lucide-react";
import { PROJECTS, PERSONAL_INFO } from "../../data/portfolioData";
import { Project } from "../../types/portfolio";
import ProjectModal from "./ProjectModal";

export default function ProjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  const categories = [
    { id: "all", label: "Tous les projets" },
    { id: "web_mobile", label: "Web & Mobile (Flutter/React)" },
    { id: "design_ui", label: "Design Graphique & UI/UX" },
    { id: "backend_systems", label: "Backend & Architectures" },
  ];

  const filteredProjects = PROJECTS.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  const featuredProject = PROJECTS.find((p) => p.featured) || PROJECTS[0];

  return (
    <section id="projects" className="py-24 bg-[#0B0F17] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold uppercase">
              <FolderGit2 size={13} />
              <span>Showcase & Réalisations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Des produits digitaux conçus pour performer
            </h2>
          </div>

          <a
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all"
          >
            <Github size={15} />
            <span>Voir tous les dépôts sur GitHub (@{PERSONAL_INFO.githubUsername})</span>
            <ExternalLink size={12} className="text-slate-500" />
          </a>
        </div>

        {/* Filter Categories Pills */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FEATURED PROJECT HERO BANNER */}
        {selectedCategory === "all" || selectedCategory === "web_mobile" ? (
          <div className="mb-14 relative rounded-3xl bg-gradient-to-br from-[#151F32] via-[#111827] to-[#0B0F17] border border-white/15 p-6 sm:p-10 overflow-hidden shadow-2xl shadow-black/80">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 text-xs font-extrabold uppercase font-mono">
                    ★ Projet Phare
                  </span>
                  <span className="text-xs font-mono text-indigo-300">
                    {featuredProject.categoryLabel}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {featuredProject.title}
                  </h3>
                  <p className="text-sm text-slate-300 font-light mt-2 leading-relaxed">
                    {featuredProject.description}
                  </p>
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                  {featuredProject.highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {featuredProject.technologies.slice(0, 6).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveModalProject(featuredProject)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
                  >
                    <Eye size={15} />
                    <span>Étude de cas détaillée</span>
                  </button>

                  <a
                    href={featuredProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded-xl transition-all"
                  >
                    <Github size={15} />
                    <span>Voir sur GitHub</span>
                  </a>
                </div>
              </div>

              {/* Right Image Mockup Preview */}
              <div 
                className="lg:col-span-6 cursor-pointer group"
                onClick={() => setActiveModalProject(featuredProject)}
              >
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.02]">
                  <img
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-indigo-950/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-white/10 flex items-center gap-1.5">
                    <Eye size={13} className="text-cyan-400" />
                    <span>Cliquer pour explorer</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : null}

        {/* PROJECTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProjects
            .filter((p) => p.id !== featuredProject.id || selectedCategory !== "all")
            .map((project) => (
              <div
                key={project.id}
                className="bg-[#111827]/80 hover:bg-[#151F32] border border-white/10 hover:border-indigo-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl shadow-black/50 group"
              >
                {/* Thumbnail image with overlay */}
                <div
                  className="relative aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer"
                  onClick={() => setActiveModalProject(project)}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono font-medium">
                      {project.categoryLabel}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg flex items-center justify-center">
                      <Eye size={15} />
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 
                      onClick={() => setActiveModalProject(project)}
                      className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {project.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-3">
                      {project.subtitle}
                    </p>
                  </div>

                  {/* Tech stack */}
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => setActiveModalProject(project)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <span>Étude de cas</span>
                        <ArrowUpRight size={13} />
                      </button>

                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Voir code source"
                      >
                        <Github size={16} />
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            ))}
        </div>

      </div>

      {/* Case Study Modal */}
      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
}
