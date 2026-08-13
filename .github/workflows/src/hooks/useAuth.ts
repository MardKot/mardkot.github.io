import { useState, useEffect } from "react";
import { authApi, getToken, setToken, ApiError, AuthUser } from "../services/api";

const PROFILE_CACHE_KEY = "porto_market_profile";

function readCachedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch { return null; }
}

function writeCachedProfile(p: UserProfile | null) {
  try {
    if (p) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {}
}

export interface UserProfile {
  uid: string;
  id: number;
  email: string;
  role: "client" | "manager" | "chief_buyer" | "buyer" | "driver";
  agencyId?: string;
  displayName?: string;
  phoneNumber?: string;
}

function toProfile(u: AuthUser): UserProfile {
  return {
    id: u.id,
    uid: u.uid || String(u.id),
    email: u.email,
    role: u.role,
    agencyId: u.agency_id ? String(u.agency_id) : undefined,
    displayName: u.name,
    phoneNumber: u.phone_number,
  };
}

export function useAuth() {
  // Démarre avec le profil mis en cache pour éviter le flash "déconnecté"
  // quand /api/user met du temps à répondre (ou échoue temporairement).
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    return getToken() ? readCachedProfile() : null;
  });
  const [loading, setLoading] = useState(true);

  const setProfile = (p: UserProfile | null) => {
    setProfileState(p);
    writeCachedProfile(p);
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (!getToken()) {
        if (!cancelled) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) setProfile(toProfile(me));
      } catch (e) {
        // Ne supprimer le token (et déconnecter) QUE si le backend rejette
        // explicitement avec 401/403. Sur erreur réseau, 5xx ou CORS bloqué,
        // on garde l'utilisateur connecté avec son profil mis en cache.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setToken(null);
          if (!cancelled) setProfile(null);
        } else {
          console.warn("auth/me failed (transient — keeping cached profile)", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setProfile(toProfile(res.user));
    return res;
  };

  const registerAccount = async (input: {
    name: string;
    email: string;
    password: string;
    role?: UserProfile["role"];
    phone_number?: string;
  }) => {
    const res = await authApi.register({
      name: input.name,
      email: input.email,
      password: input.password,
      password_confirmation: input.password,
      role: input.role || "client",
      phone_number: input.phone_number,
    });
    setProfile(toProfile(res.user));
    return res;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setToken(null);
    writeCachedProfile(null);
    setProfileState(null);
    window.location.href = "/login";
  };

  // Compatibilité — l'utilisateur connecté pour les composants qui attendent un `user`
  const user = profile ? { uid: profile.uid, email: profile.email, displayName: profile.displayName } as any : null;

  return { user, profile, loading, logout, loginWithCredentials, registerAccount };
}

export { ApiError };
