import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth-context";
import { ApiError } from "../../../shared/types/api";

const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [salario, setSalario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!strongPasswordRegex.test(password)) {
      setError("A senha deve ter 8-20 caracteres, com maiuscula, numero e simbolo.");
      return;
    }

    setLoading(true);
    try {
      await register({
        nome,
        email,
        password,
        salario: Number(salario)
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Criar conta</h1>
      <form onSubmit={handleSubmit} className="card form-grid">
        <label>
          Nome
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Salario
          <input
            type="number"
            min={0}
            step="0.01"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={20}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <p>
        Ja tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
};
