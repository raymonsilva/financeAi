import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "./auth-api";
import type { AuthSession, LoginPayload, RegisterPayload } from "./types";
import { authStorage } from "../../shared/api/auth-storage";

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => authStorage.get());

  const login = async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    const nextSession: AuthSession = { token: response.token, user: response.user };
    authStorage.set(nextSession);
    setSession(nextSession);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    const nextSession: AuthSession = { token: response.token, user: response.user };
    authStorage.set(nextSession);
    setSession(nextSession);
  };

  const logout = () => {
    authStorage.clear();
    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
};
