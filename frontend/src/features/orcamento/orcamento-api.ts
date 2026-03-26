import { http } from "../../shared/api/http";

export interface Orcamento {
  _id: string;
  mes: number;
  ano: number;
  valor: number;
  limiteGastos: number | null;
}

export interface OrcamentoStatus {
  totalGastos: number;
  limite: number;
  percentual: number;
  status: "ok" | "atencao" | "estourado";
}

export const orcamentoApi = {
  async get(mes: number, ano: number) {
    const { data } = await http.get<{ message: string; data: Orcamento }>("/orcamentos", {
      params: { mes, ano }
    });
    return data.data;
  },

  async status(mes: number, ano: number) {
    const { data } = await http.get<{ message: string; data: OrcamentoStatus }>("/orcamentos/status", {
      params: { mes, ano }
    });
    return data.data;
  },

  async create(payload: { mes: number; ano: number; valor: number; limiteGastos?: number }) {
    const { data } = await http.post<{ message: string; data: Orcamento }>("/orcamentos", payload);
    return data.data;
  },

  async updateLimite(id: string, limite: number) {
    const { data } = await http.put<{ message: string; data: Orcamento }>(`/orcamentos/${id}/limite`, { limite });
    return data.data;
  },

  async update(id: string, payload: { valor?: number; limiteGastos?: number | null }) {
    const { data } = await http.put<{ message: string; data: Orcamento }>(`/orcamentos/${id}`, payload);
    return data.data;
  },

  async remove(id: string) {
    const { data } = await http.delete<{ message: string }>(`/orcamentos/${id}`);
    return data;
  }
};
