import { Navigate } from "react-router-dom";
import { getToken } from "@/utils/Auth";

const PublicRoute = ({ children }) => {
  const token = getToken();

  if (token) {
    return <Navigate to="/" replace />; // যদি already logged in থাকে → home এ পাঠাবে
  }

  return children; // না থাকলে normally login/signup দেখাবে
};

export default PublicRoute;