import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth-context";
import { ApiError } from "../../../shared/types/api";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit} className="card form-grid">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p>
        Não tem conta? <Link to="/register">Criar conta</Link>
      </p>
    </div>
  );
};
