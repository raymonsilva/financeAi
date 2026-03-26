import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ApiError } from "../../../shared/types/api";
import { orcamentoApi } from "../orcamento-api";
import type { Orcamento, OrcamentoStatus } from "../orcamento-api";

export const OrcamentoPage = () => {
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  const queryClient = useQueryClient();
  const [valor, setValor] = useState("");
  const [limite, setLimite] = useState("");
  const [editValor, setEditValor] = useState("");
  const [editLimite, setEditLimite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const orcamentoQuery = useQuery({
    queryKey: ["orcamento", mes, ano],
    queryFn: async (): Promise<Orcamento | null> => {
      try {
        return await orcamentoApi.get(mes, ano);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return null;
        }
        throw err;
      }
    }
  });

  const statusQuery = useQuery({
    queryKey: ["orcamento-status", mes, ano],
    queryFn: async (): Promise<OrcamentoStatus | null> => {
      try {
        return await orcamentoApi.status(mes, ano);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return null;
        }
        throw err;
      }
    }
  });

  const createMutation = useMutation({
    mutationFn: orcamentoApi.create,
    onSuccess: () => {
      setError(null);
      setFeedback("Orçamento criado com sucesso.");
      setValor("");
      setLimite("");
      queryClient.invalidateQueries({ queryKey: ["orcamento"] });
      queryClient.invalidateQueries({ queryKey: ["orcamento-status"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Falha ao criar orcamento.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { valor?: number; limiteGastos?: number | null } }) =>
      orcamentoApi.update(id, payload),
    onSuccess: () => {
      setError(null);
      setFeedback("Orçamento atualizado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["orcamento"] });
      queryClient.invalidateQueries({ queryKey: ["orcamento-status"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Falha ao atualizar orcamento.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orcamentoApi.remove(id),
    onSuccess: () => {
      setError(null);
      setFeedback("Orçamento removido com sucesso.");
      setValor("");
      setLimite("");
      setEditValor("");
      setEditLimite("");
      queryClient.removeQueries({ queryKey: ["orcamento", mes, ano], exact: true });
      queryClient.removeQueries({ queryKey: ["orcamento-status", mes, ano], exact: true });
      queryClient.invalidateQueries({ queryKey: ["orcamento"] });
      queryClient.invalidateQueries({ queryKey: ["orcamento-status"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Falha ao remover orçamento.");
    }
  });

  useEffect(() => {
    if (orcamentoQuery.data) {
      setEditValor(orcamentoQuery.data.valor.toString());
      setEditLimite((orcamentoQuery.data.limiteGastos ?? 0).toString());
    } else {
      setEditValor("");
      setEditLimite("");
    }
  }, [orcamentoQuery.data]);

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    createMutation.mutate({
      mes,
      ano,
      valor: Number(valor),
      limiteGastos: limite ? Number(limite) : undefined
    });
  };

  const handleUpdateOrcamento = (event: React.FormEvent) => {
    event.preventDefault();
    if (!orcamentoQuery.data) return;

    setFeedback(null);

    updateMutation.mutate({
      id: orcamentoQuery.data._id,
      payload: {
        valor: Number(editValor),
        limiteGastos: Number(editLimite)
      }
    });
  };

  const handleDeleteOrcamento = () => {
    if (!orcamentoQuery.data?._id) return;
    setFeedback(null);
    deleteMutation.mutate(orcamentoQuery.data._id);
  };

  return (
    <section className="page-grid">
      <h1>Orcamento Mensal</h1>

      {!orcamentoQuery.data ? (
        <form className="card form-grid" onSubmit={handleCreate}>
          <h3>Criar Orcamento</h3>
          <label>
            Valor total do mes
            <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} required />
          </label>
          <label>
            Limite de gastos
            <input type="number" value={limite} onChange={(e) => setLimite(e.target.value)} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Salvando..." : "Criar"}
          </button>
        </form>
      ) : (
        <article className="card">
          <h3>Orcamento atual</h3>
          <p>Mes/Ano: {orcamentoQuery.data.mes}/{orcamentoQuery.data.ano}</p>
          <p>Valor: R$ {orcamentoQuery.data.valor.toFixed(2)}</p>
          <p>Limite: R$ {(orcamentoQuery.data.limiteGastos ?? 0).toFixed(2)}</p>
          <form className="form-grid" onSubmit={handleUpdateOrcamento}>
            <label>
              Atualizar valor
              <input
                type="number"
                value={editValor}
                onChange={(e) => setEditValor(e.target.value)}
                min={0.01}
                step="0.01"
                required
              />
            </label>
            <label>
              Atualizar limite
              <input
                type="number"
                value={editLimite}
                onChange={(e) => setEditLimite(e.target.value)}
                min={0.01}
                step="0.01"
                required
              />
            </label>
            <button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar alteracoes"}
            </button>
            <button
              type="button"
              className="danger"
              onClick={handleDeleteOrcamento}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover orçamento"}
            </button>
          </form>
        </article>
      )}

      <article className="card">
        <h3>Status</h3>
        {statusQuery.isLoading && <p>Carregando status...</p>}
        {statusQuery.isError && <p className="error">Falha ao obter status.</p>}
        {statusQuery.data && (
          <>
            <p>Total gastos: R$ {statusQuery.data.totalGastos.toFixed(2)}</p>
            <p>Limite: R$ {statusQuery.data.limite.toFixed(2)}</p>
            <p>Percentual: {statusQuery.data.percentual.toFixed(1)}%</p>
            <p>Situacao: {statusQuery.data.status}</p>
          </>
        )}
        {!statusQuery.isLoading && !statusQuery.isError && !statusQuery.data && (
          <p>Sem status de orçamento para este mês.</p>
        )}
      </article>

      {feedback && <p className="success">{feedback}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
};
