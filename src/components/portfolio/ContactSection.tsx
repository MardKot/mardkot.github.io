import React, { useState } from "react";
import { 
  Mail, 
  Send, 
  Github, 
  Linkedin, 
  Phone, 
  Copy, 
  Check, 
  MessageSquare, 
  Sparkles, 
  MapPin, 
  ArrowUpRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { PERSONAL_INFO } from "../../data/portfolioData";

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "Mobile App (Flutter)",
    budget: "< 500k CFA / Sur devis",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  const projectTypes = [
    "Mobile App (Flutter)",
    "Web App / Platform (React/Node)",
    "UI/UX & Design Graphique",
    "Paiements & Backend API",
    "Support & Audit Technique"
  ];

  return (
    <section id="contact" className="py-24 bg-[#0B0F17] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold uppercase">
            <MessageSquare size={13} />
            <span>Contact & Collaboration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Prêt à donner vie à votre prochain produit digital ?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Que vous ayez un cahier des charges précis ou juste une idée au stade conceptuel, discutons de votre projet et construisons ensemble une solution sur-mesure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Info & Socials */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Copy Email Card */}
            <div className="bg-[#151F32]/80 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                Adresse Email directe
              </div>
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-200 text-sm font-mono truncate">
                  <Mail size={16} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{PERSONAL_INFO.email}</span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 shrink-0 transition-all"
                  title="Copier l'adresse email"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Location & Availability Status */}
            <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono">Localisation</div>
                  <div className="text-sm font-bold text-white">{PERSONAL_INFO.location}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono">Temps de réponse</div>
                  <div className="text-sm font-bold text-white">Généralement sous 24h</div>
                </div>
              </div>
            </div>

            {/* Professional Profiles */}
            <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Profils & Réseaux
              </div>

              <div className="space-y-2">
                <a
                  href={PERSONAL_INFO.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Github size={18} className="text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white">GitHub</div>
                      <div className="text-[11px] text-slate-400 font-mono">github.com/MardKot</div>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </a>

                <a
                  href={`mailto:${PERSONAL_INFO.email}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Email professionnel</div>
                      <div className="text-[11px] text-slate-400 font-mono">{PERSONAL_INFO.email}</div>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#151F32]/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
              
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Message transmis avec succès !
                  </h3>
                  <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                    Merci {formData.name || "pour votre prise de contact"}. Mardoché Kotin vous répondra directement à <span className="text-cyan-400">{formData.email || PERSONAL_INFO.email}</span> dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 font-mono">
                        Votre nom ou entreprise *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Jean Dupont / Startup X"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-sm placeholder-slate-500 outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 font-mono">
                        Votre email professionnel *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nom@entreprise.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-sm placeholder-slate-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Project Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 font-mono">
                      Type de projet
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 text-white text-sm outline-none transition-all"
                    >
                      {projectTypes.map((type, idx) => (
                        <option key={idx} value={type} className="bg-slate-900 text-white">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 font-mono">
                      Détails de votre projet / Objectifs *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Décrivez brièvement votre besoin, vos délais envisagés et les fonctionnalités souhaitées..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-sm placeholder-slate-500 outline-none transition-all custom-scrollbar"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Transmission en cours...</span>
                    ) : (
                      <>
                        <span>Envoyer ma demande de projet</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
