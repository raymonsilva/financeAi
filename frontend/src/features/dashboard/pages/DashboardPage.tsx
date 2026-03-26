import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { gastosApi } from "../../gastos/gastos-api";
import { orcamentoApi } from "../../orcamento/orcamento-api";
import { ApiError } from "../../../shared/types/api";
import { authApi } from "../../auth/auth-api";
import { useAuth } from "../../auth/auth-context";

interface DashboardStatus {
  totalGastos: number;
  limite: number;
  percentual: number;
  status: "ok" | "atencao" | "estourado";
}

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();
  const [novoSalario, setNovoSalario] = useState("");
  const [salarioFeedback, setSalarioFeedback] = useState<string | null>(null);

  const resumoQuery = useQuery({
    queryKey: ["resumo", mes, ano],
    queryFn: () => gastosApi.resumo(mes, ano)
  });

  const statusQuery = useQuery({
    queryKey: ["orcamento-status", mes, ano],
    queryFn: async (): Promise<DashboardStatus | null> => {
      try {
        return await orcamentoApi.status(mes, ano);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    }
  });

  const resumo = resumoQuery.data;
  const status = statusQuery.data;

  const salarioMutation = useMutation({
    mutationFn: (salario: number) => {
      if (!session?.user.id) {
        throw new ApiError("Usuário não autenticado.");
      }
      return authApi.updateSalary(session.user.id, salario);
    },
    onSuccess: () => {
      setSalarioFeedback("Salário atualizado com sucesso.");
      setNovoSalario("");
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
    },
    onError: (error) => {
      setSalarioFeedback(error instanceof ApiError ? error.message : "Falha ao atualizar salário.");
    }
  });

  const handleSalaryUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    setSalarioFeedback(null);
    const salarioNumber = Number(novoSalario);
    if (!Number.isFinite(salarioNumber) || salarioNumber <= 0) {
      setSalarioFeedback("Informe um salário válido maior que zero.");
      return;
    }
    salarioMutation.mutate(salarioNumber);
  };

  if (resumoQuery.isLoading || statusQuery.isLoading) {
    return <p>Carregando dashboard...</p>;
  }

  if (resumoQuery.isError || statusQuery.isError) {
    return <p className="error">Não foi possível carregar o dashboard.</p>;
  }

  return (
    <section className="page-grid">
      <h1>Dashboard</h1>
      <div className="grid-3">
        <article className="card">
          <h3>Salário</h3>
          <p>R$ {resumo?.salario.toFixed(2)}</p>
        </article>
        <article className="card">
          <h3>Total de Gastos</h3>
          <p>R$ {resumo?.gastos.toFixed(2)}</p>
        </article>
        <article className="card">
          <h3>Saldo</h3>
          <p className={resumo && resumo.saldo < 0 ? "error" : "success"}>R$ {resumo?.saldo.toFixed(2)}</p>
        </article>
      </div>

      <article className="card">
        <h3>Status do Orcamento</h3>
        {status ? (
          <>
            <p>Consumo: {status.percentual.toFixed(1)}%</p>
            <p>Limite: R$ {status.limite.toFixed(2)}</p>
            <p>Situação: {status.status}</p>
          </>
        ) : (
          <p>Ainda nao existe orcamento para este mes. Crie em Orcamento.</p>
        )}
      </article>

      <form className="card form-grid" onSubmit={handleSalaryUpdate}>
        <h3>Atualizar salario</h3>
        <label>
          Novo salario
          <input
            type="number"
            min={0}
            step="0.01"
            value={novoSalario}
            onChange={(e) => setNovoSalario(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={salarioMutation.isPending}>
          {salarioMutation.isPending ? "Atualizando..." : "Salvar salario"}
        </button>
        {salarioFeedback && <p>{salarioFeedback}</p>}
      </form>
    </section>
  );
};
