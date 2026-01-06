import { Navigate } from "react-router-dom";
import { getToken } from "@/utils/Auth";

export default function PrivateRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/auth/login" replace />;
  return children;
}