import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // 필요하면 스켈레톤/스피너로 교체
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return <Outlet />;
}
