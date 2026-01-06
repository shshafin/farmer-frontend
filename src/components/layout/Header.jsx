import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchMe } from "@/api/authApi";

import Brand from "@/components/ui/Brand";
// import Search from "@/components/ui/Search";
import Navigation from "@/components/ui/Navigation";
import Menu from "@/components/ui/Menu";
import SideMenu from "@/components/layout/SideMenu";

import "@/assets/styles/Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const location = useLocation();

  // Toggle / close handlers
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Fetch current user once
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetchMe();
        console.log(res);
        const me = res?.data ?? res;
        console.log(me._id, "me");

        if (!alive || !me) return;

        // Normalize what SideMenu needs
        setProfile({
          _id: me._id,
          name: me?.name || me?.username || "User",
          avatar: me?.profileImage,
          role: me?.role,
        });
      } catch (e) {
        console.error("Failed to fetch profile:", e);
        // Fallback guest profile (non-blocking)
        setProfile({
          name: "Guest",
          avatar: "https://api.dicebear.com/9.x/initials/svg?seed=K",
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Close the drawer when navigating
  useEffect(() => {
    if (menuOpen) closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Memoize just what SideMenu needs
  const userForMenu = useMemo(() => {
    if (!profile) return undefined;
    return {
      _id: profile._id,
      name: profile.name,
      avatar: profile.avatar,
      role: profile.role,
    };
  }, [profile]);

  return (
    <>
      <div
        className="header"
        aria-busy={loading ? "true" : "false"}>
        <Link to="/">
          <div className="group">
            <Brand />
          </div>
        </Link>

        <Navigation />
        <Menu
          menuHandler={toggleMenu}
          isOpen={menuOpen}
        />
      </div>

      {/* SideMenu renders into document.body (portal inside component) */}
      <SideMenu
        open={menuOpen}
        onClose={closeMenu}
        user={userForMenu}
      />
    </>
  );
}
