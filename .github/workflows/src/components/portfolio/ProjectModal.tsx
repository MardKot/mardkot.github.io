import React from "react";
import { 
  X, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  AlertCircle, 
  Lightbulb, 
  Sparkles, 
  Calendar,
  Code2
} from "lucide-react";
import { Project } from "../../types/portfolio";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl animate-fade-in">
      
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-white/15 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden z-10 max-h-[90vh] flex flex-col">
        
        {/* Header with image banner */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={project.image}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>

          {/* Title & Badge on Image */}
          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold mb-2 font-mono">
              {project.categoryLabel}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-light mt-0.5">
              {project.subtitle}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Action Links Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Calendar size={14} className="text-indigo-400" />
              <span>Année : {project.date}</span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
              >
                <Github size={15} />
                <span>Code Source GitHub</span>
              </a>

              {project.liveUrl && project.liveUrl !== "#" && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition-all"
                >
                  <span>Tester l'application</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Metrics if available */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {project.metrics.map((m, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-center">
                  <div className="text-base sm:text-lg font-bold text-cyan-400 font-mono">{m.value}</div>
                  <div className="text-[11px] text-slate-400">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Problem vs Solution 2-Column Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Problem */}
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 font-mono uppercase">
                <AlertCircle size={15} />
                <span>Problème identifié</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {project.problem}
              </p>
            </div>

            {/* Solution */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono uppercase">
                <Lightbulb size={15} />
                <span>Solution apportée</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>

          {/* Highlights / Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Points forts & fonctionnalités clés</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300"
                >
                  <CheckCircle2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies Stack */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Code2 size={14} className="text-indigo-400" />
              <span>Technologies & Outils déployés</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
