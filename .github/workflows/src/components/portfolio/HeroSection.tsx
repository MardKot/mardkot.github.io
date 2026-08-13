import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Sparkles, 
  Github, 
  Mail, 
  Layers, 
  Smartphone, 
  Palette, 
  CheckCircle2, 
  Code2, 
  Download, 
  Terminal, 
  ExternalLink, 
  ChevronRight,
  Camera,
  Upload
} from "lucide-react";
import { PERSONAL_INFO, HEADLINES } from "../../data/portfolioData";

export default function HeroSection() {
  const [activeHeadlineId, setActiveHeadlineId] = useState<number>(1);
  const [customPhoto, setCustomPhoto] = useState<string | null>(() => {
    return localStorage.getItem("mk_custom_photo") || null;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomPhoto(result);
          localStorage.setItem("mk_custom_photo", result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activePhoto = customPhoto || PERSONAL_INFO.avatarUrl;
  const currentHeadline = HEADLINES.find((h) => h.id === activeHeadlineId) || HEADLINES[0];

  return (
    <section id="hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background ambient lighting and grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Availability status badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{PERSONAL_INFO.availability}</span>
          </div>

          {/* Interactive headline variant selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-white/10 p-1 rounded-xl text-xs backdrop-blur-md">
            <span className="text-slate-400 text-[11px] px-2 font-mono flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-400" />
              Variante d'accroche :
            </span>
            {HEADLINES.map((h) => (
              <button
                key={h.id}
                onClick={() => setActiveHeadlineId(h.id)}
                className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
                  activeHeadlineId === h.id
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                #{h.id}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid Layout: Text on Left + Photo on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Presentation */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tagline / Role */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono tracking-wide uppercase">
                <Code2 size={16} />
                <span>Mardoché Kotin • Développeur & Designer</span>
              </div>

              {/* Dynamic Headline with Smooth Transition */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentHeadline.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-extrabold text-white leading-[1.18] tracking-tight"
                >
                  {currentHeadline.headline.includes("Du concept visuel au code performant") ? (
                    <>
                      Du <span className="text-gradient-indigo">concept visuel</span> au{" "}
                      <span className="text-gradient-cyan">code performant</span> : Je conçois et développe des expériences web & mobiles sur-mesure.
                    </>
                  ) : currentHeadline.headline.includes("Architecte de solutions") ? (
                    <>
                      Architecte de solutions digitales : L'alliance parfaite de{" "}
                      <span className="text-gradient-indigo">l'esthétique graphique</span> et de{" "}
                      <span className="text-gradient-cyan">l'ingénierie logicielle</span>.
                    </>
                  ) : (
                    <>
                      Je transforme vos idées en{" "}
                      <span className="text-gradient-indigo">applications mobiles robustes</span>,{" "}
                      <span className="text-gradient-cyan">intuitives & remarquables</span>.
                    </>
                  )}
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* Subtitle / Paragraph */}
            <AnimatePresence mode="wait">
              <motion.p
                key={currentHeadline.id + "-sub"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light"
              >
                {currentHeadline.subtext}
              </motion.p>
            </AnimatePresence>

            {/* Key Skill Highlights Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono">
                <Smartphone size={13} className="text-indigo-400" />
                <span>Flutter / Mobile Native</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono">
                <Code2 size={13} className="text-cyan-400" />
                <span>React / TypeScript & Node</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono">
                <Palette size={13} className="text-purple-400" />
                <span>UI/UX Design & Branding</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono">
                <Layers size={13} className="text-amber-400" />
                <span>Firebase & Cloud APIs</span>
              </div>
            </div>

            {/* Primary Calls to Action */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <a
                href="#projects"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 rounded-xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Voir mes réalisations</span>
                <ArrowRight size={16} />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl transition-all duration-200"
              >
                <span>Démarrer un projet</span>
              </a>

              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-900 border border-white/10 rounded-xl transition-all"
                title="Accéder au GitHub de Mardoché Kotin"
              >
                <Github size={16} />
                <span className="font-mono text-xs">@MardKot</span>
                <ExternalLink size={13} className="text-slate-500" />
              </a>
            </div>

            {/* Micro Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
              {PERSONAL_INFO.stats.map((stat, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-300">{stat.label}</div>
                  <div className="text-[11px] text-slate-400">{stat.detail}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Photo Integration & Profile Card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
            
            {/* Visual Frame Wrapper with Glow */}
            <div className="relative w-full max-w-md">
              
              {/* Decorative background glows */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500" />
              
              {/* Card Container */}
              <div className="relative bg-[#111827]/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 space-y-4">
                
                {/* Image Frame */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-slate-900 border border-white/10 shadow-inner group">
                  <img
                    src={activePhoto}
                    alt="Portrait professionnel de Mardoché Kotin"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Floating floating tech badges inside image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-white text-xs font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Mardoché KOTIN</span>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-indigo-950/90 backdrop-blur-md border border-indigo-500/40 text-indigo-300 text-[11px] font-mono font-medium">
                      Bénin • Remote
                    </div>
                  </div>

                  {/* Optional Change / Upload Original Photo Action Overlay */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-black/80 hover:bg-black/95 text-white border border-white/20 text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md"
                      title="Remplacer par le fichier original DSC_0884.JPG"
                    >
                      <Camera size={13} className="text-cyan-400" />
                      <span>Remplacer photo</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input for instant local image replacement */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Card Footer Info */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-tight">Ingénierie & Design</h2>
                      <p className="text-xs text-slate-400 font-mono">Full-Stack Mobile • UI/UX Specialist</p>
                    </div>

                    <a
                      href="#contact"
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      Me contacter
                    </a>
                  </div>

                  {/* GitHub Profile preview mini-bar */}
                  <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Github size={14} className="text-slate-400" />
                      <span className="font-mono text-[11px]">github.com/MardKot</span>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-mono">● Projets publics</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
