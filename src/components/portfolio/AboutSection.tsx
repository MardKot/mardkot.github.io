import React from "react";
import { 
  Compass, 
  Zap, 
  ShieldCheck, 
  Users2, 
  GraduationCap, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  Briefcase
} from "lucide-react";
import { PERSONAL_INFO, TIMELINE } from "../../data/portfolioData";

export default function AboutSection() {
  const customPhoto = typeof window !== "undefined" ? localStorage.getItem("mk_custom_photo") : null;
  const activePhoto = customPhoto || PERSONAL_INFO.avatarUrl;

  const corePillars = [
    {
      icon: Zap,
      title: "Vision Produit & Utilisateur",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      description: "Je ne code pas seulement des fonctionnalités : je conçois des solutions fluides qui répondent à un besoin réel, avec un sens aigu de la conversion et de la rétention."
    },
    {
      icon: Compass,
      title: "Adaptabilité & Rigueur",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      description: "Capacité d'assimilation immédiate des nouvelles stacks (Flutter, React, Firebase, architectures backend) et respect strict des standards de qualité logicielle."
    },
    {
      icon: Sparkles,
      title: "Finition Esthétique & UI/UX",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      description: "Grâce à mon expertise en design graphique et Figma, chaque composant est pensé au pixel près : typographie, micro-interactions, hiérarchie visuelle et design system."
    },
    {
      icon: Users2,
      title: "Efficacité & Esprit d'Équipe",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      description: "Communication claire, transmission de documentation soignée et synergie naturelle entre équipes techniques et créatives."
    }
  ];

  return (
    <section id="about" className="py-24 bg-[#0E1420] border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold uppercase mb-3">
              <Sparkles size={13} />
              <span>Profil & Vision</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              L'alliance de l'esprit d'ingénieur et de la sensibilité créative
            </h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Basé au Bénin, j'accompagne startups et porteurs de projet dans la concrétisation technique et visuelle de leurs ambitions digitales.
          </p>
        </div>

        {/* 2-Columns layout: Narrative on Left, Pillars & Timeline on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Narrative Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#151F32]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/40">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px]">
                  <img
                    src={activePhoto}
                    alt="Mardoché Kotin"
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Mardoché KOTIN</h3>
                  <p className="text-xs text-indigo-400 font-mono">Bénin • Développeur & Designer</p>
                </div>
              </div>

              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>
                  Passionné par la création de produits numériques complets, j'interviens là où la technique rencontre l'expérience utilisateur. Mon parcours m'a permis de maîtriser l'ensemble de la chaîne de valeur : du croquis d'identité graphique sur Figma jusqu'au code Flutter & React connecté à des architectures cloud Firebase.
                </p>
                <p>
                  Je privilégie des applications véloces, robustes, parfaitement adaptées aux réalités du terrain (optimisations réseau, gestion du cache, intégration des paiements Mobile Money locaux comme FedaPay et Kkiapay).
                </p>
              </div>

              {/* Discrete Education Timeline Note */}
              <div className="pt-5 border-t border-slate-800 flex items-start gap-3 text-xs text-slate-400 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
                <GraduationCap size={18} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-300">Formation académique :</span> Diplôme d'Ingénierie en Génie Logiciel (Conception logicielle, algorithmique & architectures distribuées).
                </div>
              </div>
            </div>

            {/* Quick stats mini card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/70 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-indigo-400 font-mono">100%</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Autonome & Polyvalent</div>
                <div className="text-[11px] text-slate-500">De l'idée au déploiement</div>
              </div>
              <div className="bg-slate-900/70 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-cyan-400 font-mono">2 en 1</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Code + Design</div>
                <div className="text-[11px] text-slate-500">Zéro perte de cohérence</div>
              </div>
            </div>
          </div>

          {/* Right Column: Pillars of Expertise */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <Layers size={18} className="text-indigo-400" />
              <span>Principes & Méthode de travail</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {corePillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#111827]/70 hover:bg-[#151F32] border border-white/5 hover:border-indigo-500/30 rounded-xl p-5 space-y-3 transition-all duration-300 shadow-md group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${pillar.color}`}>
                      <IconComponent size={20} />
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {pillar.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Timeline preview list */}
            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Briefcase size={15} className="text-indigo-400" />
                  <span>Jalons & Expérience</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">Continu</span>
              </div>

              <div className="space-y-4">
                {TIMELINE.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                      {item.year}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">{item.title} — <span className="text-slate-400 font-normal">{item.role}</span></div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
