import { http } from "../../shared/api/http";
import type { AuthResponse, LoginPayload, RegisterPayload } from "./types";

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>("/user/login", payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>("/user/register", payload);
    return data;
  },

  async updateSalary(userId: string, salario: number) {
    const { data } = await http.patch<{ message: string; user: { salario: number } }>(
      `/user/${userId}/salario`,
      { salario }
    );
    return data;
  }
};
