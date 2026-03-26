import { http } from "../../shared/api/http";

export interface Gasto {
  _id: string;
  descricao: string;
  valor: number;
  categoria?: string;
  data: string;
}

export interface ResumoResponse {
  nome: string;
  salario: number;
  gastos: number;
  saldo: number;
  status: string;
}

export interface CreateGastoPayload {
  descricao: string;
  valor: number;
  categoria?: string;
  data?: string;
}

export const gastosApi = {
  async list(): Promise<Gasto[]> {
    const { data } = await http.get<Gasto[]>("/gastos");
    return data;
  },

  async resumo(mes: number, ano: number): Promise<ResumoResponse> {
    const { data } = await http.get<ResumoResponse>("/gastos/resumo", {
      params: { mes, ano }
    });
    return data;
  },

  async create(payload: CreateGastoPayload) {
    const { data } = await http.post<{ message: string; gasto: Gasto }>("/gastos", payload);
    return data;
  },

  async remove(id: string) {
    const { data } = await http.delete<{ message: string }>(`/gastos/${id}`);
    return data;
  }
};
