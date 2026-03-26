import type { AuthSession } from "../../features/auth/types";

const AUTH_KEY = "financeai_auth";

export const authStorage = {
  get(): AuthSession | null {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
  },

  set(session: AuthSession) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  },

  clear() {
    localStorage.removeItem(AUTH_KEY);
  }
};
