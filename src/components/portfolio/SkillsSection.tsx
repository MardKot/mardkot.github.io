import React, { useState } from "react";
import { 
  Smartphone, 
  Palette, 
  Wrench, 
  Code2, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Database,
  Shield,
  Zap
} from "lucide-react";
import { SKILL_CATEGORIES } from "../../data/portfolioData";

export default function SkillsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("dev");

  const iconMap: Record<string, any> = {
    Smartphone: Smartphone,
    Palette: Palette,
    Wrench: Wrench,
  };

  return (
    <section id="skills" className="py-24 relative overflow-hidden bg-[#0B0F17]">
      {/* Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold uppercase">
            <Cpu size={13} />
            <span>Domaines d'Action & Stack</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Une expertise complète du design à l'ingénierie
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Trois piliers fondamentaux pour concevoir, prototyper, coder et maintenir des produits digitaux de haut niveau.
          </p>
        </div>

        {/* Category Selector Tabs for quick switching */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl">
            {SKILL_CATEGORIES.map((cat) => {
              const Icon = iconMap[cat.icon] || Code2;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon size={16} />
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Interactive Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {SKILL_CATEGORIES.map((category) => {
            const Icon = iconMap[category.icon] || Code2;
            const isHighlighted = activeCategory === category.id;

            return (
              <div
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative cursor-pointer rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 border ${
                  isHighlighted
                    ? "bg-[#151F32] border-indigo-500/50 shadow-2xl shadow-indigo-950/60 -translate-y-1.5"
                    : "bg-[#111827]/80 hover:bg-[#151F32]/80 border-white/10 hover:border-white/20"
                }`}
              >
                {/* Active Indicator Top Tag */}
                {isHighlighted && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider font-mono shadow-md">
                    Actif
                  </div>
                )}

                <div className="space-y-5">
                  {/* Icon Header */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                        isHighlighted
                          ? "bg-indigo-600/20 border-indigo-500 text-cyan-300 shadow-md shadow-indigo-500/20"
                          : "bg-slate-800 border-slate-700 text-indigo-400"
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      #{category.id}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {category.title}
                    </h3>
                    <p className="text-xs text-indigo-300 font-mono">
                      {category.tagline}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {category.description}
                  </p>

                  {/* Skills Gauges / List */}
                  <div className="space-y-3 pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Compétences clés :
                    </div>
                    <div className="space-y-2.5">
                      {category.skills.slice(0, 5).map((skill, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className={`font-medium ${skill.highlight ? "text-white" : "text-slate-300"}`}>
                              {skill.name}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {skill.level}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                skill.highlight
                                  ? "bg-gradient-to-r from-indigo-500 to-cyan-400"
                                  : "bg-indigo-600/70"
                              }`}
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Tools Pills */}
                <div className="pt-6 mt-6 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">
                    Outils & Frameworks :
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.tools.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Technical Guarantee Banner */}
        <div className="mt-12 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/40 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Besoin d'un profil capable de concevoir et coder votre MVP ?
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Aucun temps perdu entre le designer et le développeur : je livre des interfaces fidèles et un code de production prêt pour l'échelle.
              </p>
            </div>
          </div>

          <a
            href="#contact"
            className="shrink-0 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
          >
            Discuter de votre projet
          </a>
        </div>

      </div>
    </section>
  );
}
