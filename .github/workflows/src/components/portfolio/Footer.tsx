import React from "react";
import { Github, Mail, ArrowUp, Heart, Sparkles, Terminal } from "lucide-react";
import { PERSONAL_INFO } from "../../data/portfolioData";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#080B10] border-t border-white/10 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#080B10] rounded-[11px] flex items-center justify-center font-bold text-white text-xs">
                MK
              </div>
            </div>
            <div>
              <span className="font-bold text-sm text-white">Mardoché KOTIN</span>
              <p className="text-[11px] text-slate-400 font-mono">Software Engineer & UI/UX Designer</p>
            </div>
          </div>

          {/* Socials & GitHub */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Github size={15} />
              <span>GitHub</span>
            </a>
            <span>•</span>
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Mail size={15} />
              <span>Email</span>
            </a>
            <span>•</span>
            <span className="text-slate-400">Bénin • International</span>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <span>Haut de page</span>
            <ArrowUp size={14} />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-3">
          <div>
            © {new Date().getFullYear()} Mardoché KOTIN. Conçu & Développé avec passion.
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Clean Architecture • Flutter • React • Figma</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
