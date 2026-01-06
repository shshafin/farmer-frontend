import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/Auth";
import { fetchMe } from "@/api/authApi";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const token = getToken();
      if (!token) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const user = await fetchMe();
        if (allowedRoles.includes(user.data.role)) {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
      setLoading(false);
    };

    checkRole();
  }, [allowedRoles]);

  if (loading) return <div>লোড হচ্ছে...</div>;

  return authorized ? children : <Navigate to="/" replace />;
};

export default RoleBasedRoute;