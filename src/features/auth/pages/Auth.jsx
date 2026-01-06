import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Signup";
import "@/assets/styles/Auth.css";

const AuthShell = ({ children }) => (
  <div className="auth-page">{children}</div>
);

export default function Auth() {
  return (
    <Routes>
      <Route
        path="login"
        element={(
          <AuthShell>
            <Login />
          </AuthShell>
        )}
      />
      <Route
        path="signup"
        element={(
          <AuthShell>
            <Register />
          </AuthShell>
        )}
      />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
}
