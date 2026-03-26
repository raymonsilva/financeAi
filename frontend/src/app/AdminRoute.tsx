import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";

export const AdminRoute = () => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
