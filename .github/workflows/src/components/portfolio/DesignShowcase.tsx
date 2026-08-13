import React, { useState } from "react";
import { Palette, Sparkles, Layers, Figma, Compass, Eye, Check, ExternalLink } from "lucide-react";
import { DESIGN_WORKS, PERSONAL_INFO } from "../../data/portfolioData";

export default function DesignShowcase() {
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const designCapabilities = [
    {
      title: "Identité de Marque & Logotypes",
      desc: "Logos vectoriels mémorables, concepts géométriques et typographies sur-mesure pour startups et entreprises.",
      badge: "Branding"
    },
    {
      title: "UI/UX & Design Systems Figma",
      desc: "Architectures de composants réutilisables, variables de couleurs/espacements, prototypes haute fidélité prêts pour le code.",
      badge: "Figma Pro"
    },
    {
      title: "Supports Print & Publicitaires",
      desc: "Affiches, flyers d'événements, bannières pour réseaux sociaux et visuels promotionnels à fort impact visuel.",
      badge: "Marketing Visual"
    }
  ];

  return (
    <section id="design" className="py-24 bg-[#0E1420] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-semibold uppercase">
              <Palette size={13} />
              <span>Studio Graphique & UI/UX</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              La puissance du design au service de la tech
            </h2>
          </div>

          <p className="text-slate-400 text-sm max-w-md">
            Chaque projet bénéficie d'une rigueur graphique intégrale : de la recherche conceptuelle jusqu'aux tokens intégrés dans le code.
          </p>
        </div>

        {/* 3 Design Capabilities Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {designCapabilities.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#151F32]/60 hover:bg-[#151F32] border border-white/10 hover:border-purple-500/30 rounded-2xl p-6 space-y-3 transition-all duration-300 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 text-[11px] font-mono">
                  {item.badge}
                </span>
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Visual Showcase Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DESIGN_WORKS.map((work) => (
            <div
              key={work.id}
              onClick={() => setActivePreview(work.image)}
              className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 aspect-[4/3] cursor-pointer shadow-xl"
            >
              <img
                src={work.image}
                alt={work.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-black/40 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-end">
                  <span className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={16} />
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-cyan-400">{work.category}</div>
                  <h4 className="text-base font-bold text-white">{work.title}</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {work.tags.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-white/10 backdrop-blur-md rounded text-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Image Zoom Modal */}
      {activePreview && (
        <div
          onClick={() => setActivePreview(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img
              src={activePreview}
              alt="Design Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
