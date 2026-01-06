import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@/assets/IconComponents/MenuIcon";
import FullScreen from "@/assets/IconComponents/FullScreen";
import { logoutUser } from "@/api/authApi"; // 👈 import

export default function AdminTopNavbar() {
  const navigate = useNavigate();

  const toggleSidebar = useCallback((e) => {
    e.preventDefault();
    const wrapper = document.querySelector(".wrapper");
    if (!wrapper) return;
    wrapper.classList.toggle("sidebar-collapsed");
  }, []);

  const handleLogout = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await logoutUser(); // 🔹 call logout API
        localStorage.removeItem("accessToken");
        navigate("/"); // redirect to home/login
      } catch (err) {
        console.error("Logout failed:", err);
        alert("Logout failed. Please try again."); // optional
      }
    },
    [navigate]
  );

  const handleFullscreen = useCallback((e) => {
    e.preventDefault();
    const doc = document.documentElement;
    if (!document.fullscreenElement) {
      doc
        .requestFullscreen()
        .catch((err) => console.warn("Fullscreen error:", err));
    } else {
      document.exitFullscreen();
    }
  }, []);

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light admin-top-navbar">
      <section className="flex-FY-center">
        <button
          type="button"
          className="admin-icon-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar">
          <MenuIcon />
        </button>
      </section>
      <section className="admin-actions">
        <button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={handleLogout}>
          Logout
        </button>
        <button
          type="button"
          className="admin-icon-btn"
          onClick={handleFullscreen}
          aria-label="Toggle fullscreen">
          <FullScreen />
        </button>
      </section>
    </nav>
  );
}
