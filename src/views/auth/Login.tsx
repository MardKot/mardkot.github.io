import React, { useState } from "react";
import { Button, Card, Input } from "../../components/UI";
import { ArrowLeft, Lock, Mail, Phone, User as UserIcon } from "lucide-react";
import { useAuth, ApiError } from "../../hooks/useAuth";

const DEFAULT_ACCOUNTS: { role: string; email: string; label: string }[] = [
  { role: "client",      email: "client@porto.market",  label: "Client" },
  { role: "manager",     email: "manager@porto.market", label: "Manager" },
  { role: "chief_buyer", email: "chief@porto.market",   label: "Chef Achat" },
  { role: "buyer",       email: "buyer@porto.market",   label: "Acheteur" },
  { role: "driver",      email: "driver@porto.market",  label: "Livreur" },
];

const DEFAULT_PASSWORD = "password";

export default function Login() {
  const { loginWithCredentials, registerAccount } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email.trim() || !form.password) {
      setError("Email et mot de passe requis.");
      return;
    }
    if (mode === "signup") {
      if (!form.name.trim()) {
        setError("Le nom est requis.");
        return;
      }
      if (form.password.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await registerAccount({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone_number: form.phone.trim() || undefined,
          role: "client",
        });
      } else {
        await loginWithCredentials(form.email.trim(), form.password);
      }
      window.location.href = "/";
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = err.body?.errors;
        if (fields && typeof fields === "object") {
          setError(Object.values(fields).flat().join(" ") as string);
        } else {
          setError(err.body?.message || "Identifiants incorrects.");
        }
      } else {
        setError("Erreur de connexion au serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  const useDefaultAccount = (email: string) => {
    setForm({ ...form, email, password: DEFAULT_PASSWORD });
    setError(null);
    setMode("login");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 overflow-y-auto py-12">
      <div className="max-w-md w-full flex flex-col gap-8 my-auto">
        <div className="text-center px-4">
          <button
            onClick={() => (window.location.href = "/")}
            className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand transition-colors"
          >
            <ArrowLeft size={14} /> Retour à l'accueil
          </button>
          <div className="w-16 h-16 bg-[#2563EB] rounded-2xl mx-auto mb-6 shadow-blue-200 shadow-xl flex items-center justify-center text-white text-3xl font-extrabold tracking-tighter italic">
            P.
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] mb-2 uppercase">PORTO.MARKET</h1>
          <p className="text-[#6B7280] font-medium text-sm">
            Connectez-vous avec votre identifiant et votre mot de passe.
          </p>
        </div>

        <Card className="p-8 md:p-10 border-gray-200 shadow-2xl rounded-[2.5rem]">
          <div className="flex flex-col gap-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-[#1A1A1A]">
                {mode === "signup" ? "Créer un compte" : "Se connecter"}
              </h2>
              <p className="text-sm text-[#6B7280] font-medium">
                {mode === "signup"
                  ? "Inscrivez-vous en quelques secondes."
                  : "Accédez à votre espace Porto Market."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {mode === "signup" && (
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Nom complet"
                    className="pl-10 h-12 rounded-xl"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              )}
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="pl-10 h-12 rounded-xl"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {mode === "signup" && (
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="Téléphone (ex: 97000000)"
                    className="pl-10 h-12 rounded-xl"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              )}
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  placeholder={mode === "signup" ? "Mot de passe (8 caractères min.)" : "Mot de passe"}
                  className="pl-10 h-12 rounded-xl"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-bold px-1 leading-snug">{error}</p>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full h-14 rounded-2xl text-base font-black shadow-xl shadow-brand/20 mt-2"
              >
                {mode === "signup" ? "Créer mon compte" : "Se connecter"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  setError(null);
                }}
                className="text-xs text-gray-500 mt-2 hover:text-brand transition-colors"
              >
                {mode === "signup" ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? Inscrivez-vous"}
              </button>
            </form>
          </div>
        </Card>

        <Card className="p-6 border-gray-100 shadow-md rounded-[1.5rem] bg-white">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                Comptes par défaut
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-1 leading-snug">
                Cliquez sur un rôle pour pré-remplir les identifiants.
                Mot de passe : <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">{DEFAULT_PASSWORD}</code>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {DEFAULT_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => useDefaultAccount(acc.email)}
                  className="flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-xs font-bold text-gray-700">{acc.label}</span>
                  <span className="text-[11px] text-gray-400 font-mono group-hover:text-brand">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
