import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "../../../shared/types/api";
import { gastosApi } from "../gastos-api";

export const GastosPage = () => {
  const queryClient = useQueryClient();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState<string | null>(null);

  const gastosQuery = useQuery({
    queryKey: ["gastos"],
    queryFn: gastosApi.list
  });

  const createMutation = useMutation({
    mutationFn: gastosApi.create,
    onSuccess: () => {
      setDescricao("");
      setValor("");
      setCategoria("");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Falha ao criar gasto.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: gastosApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createMutation.mutate({
      descricao,
      valor: Number(valor),
      categoria: categoria || undefined
    });
  };

  return (
    <section className="page-grid">
      <h1>Gastos</h1>
      <form className="card form-grid" onSubmit={handleSubmit}>
        <label>
          Descrição
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </label>
        <label>
          Valor
          <input
            type="number"
            min={0.01}
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />
        </label>
        <label>
          Categoria
          <input value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Salvando..." : "Adicionar gasto"}
        </button>
      </form>

      <article className="card">
        <h3>Lista</h3>
        {gastosQuery.isLoading && <p>Carregando gastos...</p>}
        {gastosQuery.isError && <p className="error">Falha ao carregar gastos.</p>}
        {gastosQuery.data && gastosQuery.data.length === 0 && <p>Nenhum gasto cadastrado.</p>}
        <ul className="list">
          {gastosQuery.data?.map((gasto) => (
            <li key={gasto._id} className="row-between">
              <div>
                <strong>{gasto.descricao}</strong>
                <small>{gasto.categoria ?? "Sem categoria"}</small>
              </div>
              <div className="row-inline">
                <span>R$ {gasto.valor.toFixed(2)}</span>
                <button
                  type="button"
                  className="danger"
                  onClick={() => deleteMutation.mutate(gasto._id)}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};
