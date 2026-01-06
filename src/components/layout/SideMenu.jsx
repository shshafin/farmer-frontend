/* eslint-disable no-unused-vars */
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import styles from "@/assets/styles/Menu.module.css";
import CloseIcon from "@/assets/IconComponents/Close";
import CloudIcon from "@/assets/IconComponents/CloudIcon";
import MessageCircleIcon from "@/assets/IconComponents/MessageCircleIcon";
import MarcketIcon from "@/assets/IconComponents/MarcketIcon";
import UserPlusIcon from "@/assets/IconComponents/UserPlusIcon";
import LogOutIcon from "@/assets/IconComponents/LogOutIcon";
import SeedIcon from "@/assets/IconComponents/SeedIcon";
import { logoutUser } from "../../api/authApi";
import { deleteUser } from "../../api/authApi"; // <-- add deleteUser API
import { baseApi } from "../../api";

export default function SideMenu({
  open = false,
  onClose = () => {},
  user,
  items: itemsProp,
}) {
  const handleSignOut = async () => {
    try {
      const res = await logoutUser();
      if (res.success) {
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/login";
      }
    } catch (err) {
      console.error("Logout failed", err);
      alert("Logout failed!");
    }
  };
  console.log(user);

  const handleDelete = async () => {
    if (!user?._id) return alert("User ID missing!");
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;

    try {
      const res = await deleteUser(user._id);
      if (res.success) {
        alert("User deleted successfully!");
        // Remove token and redirect
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/login";
      } else {
        alert(res.message || "Delete failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const items = useMemo(() => {
    const baseItems = [
      { to: "/weather", label: "প্রতিদিনের আবহাওয়া", Icon: CloudIcon },
      {
        to: "/companyes",
        label: "কীটনাশক ও কোম্পানি",
        Icon: MessageCircleIcon,
      },
      { to: "/market", label: "বাজার দর", Icon: MarcketIcon },
      { to: "/seed-market", label: "বিজ বাজার", Icon: SeedIcon },
      { to: "/follow", label: "নতুন ব্যবহারকারী", Icon: UserPlusIcon },
      { to: "/logout", label: "লগ আউট", Icon: LogOutIcon },
      {
        to: "#delete",
        label: "অ্যাকাউন্ট মুছে দিন",
        Icon: LogOutIcon,
        isDelete: true,
      }, // <-- new
    ];

    if (user?.role === "admin") {
      baseItems.unshift({
        to: "/admin",
        label: "অ্যাডমিন ড্যাশবোর্ড",
        Icon: UserPlusIcon,
      });
    }

    return itemsProp ?? baseItems;
  }, [itemsProp, user?.role]);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className={styles.overlay}
        onClick={onClose}
      />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title">
        <div className={styles.drawerHeader}>
          <NavLink
            to="/profile"
            className={styles.profileBtn}
            onClick={onClose}
            aria-label="Edit profile"
            title="Edit profile">
            <img
              src={
                user.avatar?.startsWith("http")
                  ? user.avatar
                  : `${baseApi}${user.avatar}`
              }
              alt={user.name || "User"}
              className={styles.profileAvatar}
            />
            <div className={styles.profileText}>
              <h3
                id="menu-title"
                className={styles.profileName}>
                {user.name}
              </h3>
              <p className={styles.profileHint}>edit profile</p>
            </div>
          </NavLink>
          <button
            className={styles.iconBtn}
            onClick={onClose}
            aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <nav
          className={styles.menuList}
          aria-label="Menu">
          {items.map(({ to, label, Icon, isDelete }) => {
            if (isDelete) {
              return (
                <button
                  key={to}
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    onClose();
                    handleDelete();
                  }}>
                  <Icon className={styles.menuIcon} />
                  {label}
                </button>
              );
            }

            if (to === "/logout") {
              return (
                <button
                  key={to}
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    onClose();
                    handleSignOut();
                  }}>
                  <Icon className={styles.menuIcon} />
                  {label}
                </button>
              );
            }

            return (
              <NavLink
                key={to}
                to={to}
                className={styles.menuItem}
                onClick={onClose}>
                <Icon className={styles.menuIcon} />
                {label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>,
    document.body
  );
}
