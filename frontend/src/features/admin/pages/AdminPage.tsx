import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "../../../shared/types/api";
import { adminApi } from "../admin-api";

export const AdminPage = () => {
  const queryClient = useQueryClient();
  const [clearUsers, setClearUsers] = useState(false);
  const [clearGastos, setClearGastos] = useState(true);
  const [clearOrcamentos, setClearOrcamentos] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const adminQuery = useQuery({
    queryKey: ["admin-full"],
    queryFn: adminApi.full
  });

  const cleanupMutation = useMutation({
    mutationFn: adminApi.cleanup,
    onSuccess: () => {
      setFeedback("Limpeza concluída com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["admin-full"] });
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      queryClient.invalidateQueries({ queryKey: ["orcamento"] });
      queryClient.invalidateQueries({ queryKey: ["orcamento-status"] });
    },
    onError: (err) => {
      setFeedback(err instanceof ApiError ? err.message : "Falha ao limpar dados.");
    }
  });

  const removeOrcamentoMutation = useMutation({
    mutationFn: (id: string) => adminApi.removeOrcamento(id),
    onSuccess: () => {
      setFeedback("Orçamento removido com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["admin-full"] });
      queryClient.invalidateQueries({ queryKey: ["orcamento"] });
      queryClient.invalidateQueries({ queryKey: ["orcamento-status"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
    },
    onError: (err) => {
      setFeedback(err instanceof ApiError ? err.message : "Falha ao remover orçamento.");
    }
  });

  const handleCleanup = () => {
    setFeedback(null);
    cleanupMutation.mutate({ clearUsers, clearGastos, clearOrcamentos });
  };

  if (adminQuery.isLoading) {
    return <p>Carregando painel administrativo...</p>;
  }

  if (adminQuery.isError || !adminQuery.data) {
    return <p className="error">Não foi possível carregar os dados administrativos.</p>;
  }

  const { totals, users, gastos, orcamentos } = adminQuery.data;

  return (
    <section className="page-grid">
      <h1>Painel Admin</h1>

      <div className="grid-3">
        <article className="card">
          <h3>Usuários</h3>
          <p>{totals.users}</p>
        </article>
        <article className="card">
          <h3>Gastos</h3>
          <p>{totals.gastos}</p>
        </article>
        <article className="card">
          <h3>Orçamentos</h3>
          <p>{totals.orcamentos}</p>
        </article>
      </div>

      <article className="card form-grid">
        <h3>Limpeza de dados</h3>
        <label className="row-inline">
          <input type="checkbox" checked={clearGastos} onChange={(e) => setClearGastos(e.target.checked)} />
          Limpar gastos
        </label>
        <label className="row-inline">
          <input
            type="checkbox"
            checked={clearOrcamentos}
            onChange={(e) => setClearOrcamentos(e.target.checked)}
          />
          Limpar orçamentos
        </label>
        <label className="row-inline">
          <input type="checkbox" checked={clearUsers} onChange={(e) => setClearUsers(e.target.checked)} />
          Limpar usuários não-admin
        </label>
        <button type="button" onClick={handleCleanup} disabled={cleanupMutation.isPending}>
          {cleanupMutation.isPending ? "Executando..." : "Executar limpeza"}
        </button>
        {feedback && <p>{feedback}</p>}
      </article>

      <article className="card">
        <h3>Usuários cadastrados</h3>
        <ul className="list">
          {users.map((user) => (
            <li key={user._id} className="row-between">
              <span>{user.nome} ({user.email})</span>
              <strong>{user.role}</strong>
            </li>
          ))}
        </ul>
      </article>

      <article className="card">
        <h3>Últimos gastos</h3>
        <ul className="list">
          {gastos.slice(0, 10).map((gasto) => (
            <li key={gasto._id} className="row-between">
              <span>{gasto.descricao} ({gasto.userId})</span>
              <strong>R$ {gasto.valor.toFixed(2)}</strong>
            </li>
          ))}
        </ul>
      </article>

      <article className="card">
        <h3>Orçamentos</h3>
        <ul className="list">
          {orcamentos.slice(0, 10).map((orcamento) => (
            <li key={orcamento._id} className="row-between">
              <span>{orcamento.userId} - {orcamento.mes}/{orcamento.ano}</span>
              <div className="row-inline">
                <strong>R$ {orcamento.valor.toFixed(2)}</strong>
                <button
                  type="button"
                  className="danger"
                  onClick={() => removeOrcamentoMutation.mutate(orcamento._id)}
                  disabled={removeOrcamentoMutation.isPending}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};
