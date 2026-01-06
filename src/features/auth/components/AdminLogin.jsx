import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import adminImage from "@/assets/images/krishok-image.png";
// import { loginAdmin } from "@/api/authApi";

const initialFormState = Object.freeze({
  email: "",
  password: "",
});

export default function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldIsEmpty = useMemo(
    () => !formData.email.trim() || !formData.password.trim(),
    [formData.email, formData.password]
  );

  useEffect(() => {
    const stylesheets = [
      new URL("../../../assets/styles/Admin.Main.css", import.meta.url).href,
      new URL("../../../assets/styles/Admin.css", import.meta.url).href,
    ].map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.adminStylesheet = "true";
      document.head.appendChild(link);
      return link;
    });

    const { classList, style } = document.body;
    const previousMinHeight = style.minHeight;

    classList.add("login-page");
    style.minHeight = "230px";

    return () => {
      stylesheets.forEach((link) => link.parentNode?.removeChild(link));
      classList.remove("login-page");
      style.minHeight = previousMinHeight;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (fieldIsEmpty) {
      toast.error("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginAdmin(formData);

      const token =
        response?.data?.token ??
        response?.data?.accessToken ??
        response?.token ??
        response?.accessToken;

      if (token) {
        localStorage.setItem("adminToken", token);
      } else {
        toast.error("Login succeeded but no admin token was returned.");
        setIsSubmitting(false);
        return;
      }

      const successMessage =
        response?.message ?? "Admin login successful. Redirecting...";
      toast.success(successMessage);

      setTimeout(() => navigate("/admin/", { replace: true }), 600);
    } catch (error) {
      const errorMessage =
        error?.message ??
        error?.error ??
        "Unable to log in. Please check your credentials and try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: 230 }}>
      <div className="krishok-image">
        <img src={adminImage} alt="krishok" />
      </div>

      <div className="login-logo">
        <a href="/">
          <b>krishokarea</b> Admin Panel
        </a>
      </div>

      <div className="login-box">
        <div className="card">
          <div className="card-body login-card-body">
            <h5 className="login-box-msg">Login panel for admin only</h5>

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group mb-3">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-envelope" aria-hidden="true"></span>
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock" aria-hidden="true"></span>
                  </div>
                </div>
              </div>

              <div className="row m-auto">
                <div className="col">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isSubmitting || fieldIsEmpty}
                  >
                    {isSubmitting ? "Signing in..." : "Login"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
