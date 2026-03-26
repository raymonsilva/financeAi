import { http } from "../../shared/api/http";

export interface AdminUser {
  _id: string;
  nome: string;
  email: string;
  salario: number;
  role: "user" | "admin";
}

export interface AdminGasto {
  _id: string;
  descricao: string;
  valor: number;
  categoria?: string;
  userId: string;
  data: string;
}

export interface AdminOrcamento {
  _id: string;
  userId: string;
  mes: number;
  ano: number;
  valor: number;
  limiteGastos: number | null;
}

export interface AdminFullResponse {
  totals: {
    users: number;
    gastos: number;
    orcamentos: number;
  };
  users: AdminUser[];
  gastos: AdminGasto[];
  orcamentos: AdminOrcamento[];
}

export const adminApi = {
  async full(): Promise<AdminFullResponse> {
    const { data } = await http.get<AdminFullResponse>("/admin/full");
    return data;
  },

  async cleanup(payload: { clearUsers: boolean; clearGastos: boolean; clearOrcamentos: boolean }) {
    const { data } = await http.delete<{ message: string }>("/admin/cleanup", { data: payload });
    return data;
  },

  async removeOrcamento(id: string) {
    const { data } = await http.delete<{ message: string }>(`/admin/orcamentos/${id}`);
    return data;
  }
};
