import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";

export const AppShell = () => {
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <header className="topbar">
        <h2>Finance Control</h2>
        <nav className="row-inline">
          <Link to="/">Dashboard</Link>
          <Link to="/gastos">Gastos</Link>
          <Link to="/orcamento">Orçamento</Link>
          {session?.user.role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>
        <div className="row-inline">
          <span>{session?.user.nome}</span>
          <button type="button" onClick={handleLogout}>Sair</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};
