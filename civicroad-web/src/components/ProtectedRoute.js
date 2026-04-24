import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
