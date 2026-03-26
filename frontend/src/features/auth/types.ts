export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  role: "user" | "admin";
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nome: string;
  salario: number;
}
