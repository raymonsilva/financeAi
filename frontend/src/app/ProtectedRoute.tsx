import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
