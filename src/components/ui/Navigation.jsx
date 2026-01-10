import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { formatTimeAgo } from "@/utils/timeAgo";
import {
  fetchNotifications,
  deleteNotification, // Matches authApi export
  clearAllNotifications, // Matches authApi export
} from "@/api/authApi";
import { baseApi } from "../../api"; // Base URL for images

import bookIcon from "@/assets/icons/Book.svg";
import homeIcon from "@/assets/icons/Home.svg";
import imageIcon from "@/assets/icons/Image.svg";
import followersIcon from "@/assets/icons/Followers.svg";
import notificationIcon from "@/assets/icons/Notification.svg";
import CloseIcon from "@/assets/IconComponents/Close";
import { translateNotificationMessage } from "@/utils/notificationText";

const iconStyle = { width: 20, height: 20 };
const AVATAR_PLACEHOLDER = "https://i.pravatar.cc/150?u=fake";

// Helper: Fix Image URLs
const ensureAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  return `${baseApi}/${cleanPath}`;
};

function Navigation() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const popoverRef = useRef(null);

  // Load Notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetchNotifications();
        const list = Array.isArray(res) ? res : res.notifications || [];
        setNotifications(list);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    loadNotifications();
  }, []);

  // Close on Outside Click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // --- ACTION: Delete Single (Persist) ---
  const handleDismiss = async (id) => {
    // 1. Optimistic Update (Remove from UI immediately)
    setNotifications((prev) =>
      prev.filter((notif) => notif._id !== id && notif.id !== id)
    );

    // 2. API Call (Delete from DB)
    try {
      // Use either _id or id depending on what backend sends
      await deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  // --- ACTION: Clear All (Persist) ---
  const handleClearAll = async () => {
    // 1. Optimistic Update
    setNotifications([]);

    // 2. API Call
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error("Failed to clear all notifications", error);
    }
  };

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    const postId =
      notification.post?._id || notification.post?.id || notification.post;
    if (postId) {
      navigate(`/?postId=${postId}`);
    }
  };

  const unreadCount = notifications.length; // Simply showing count of all notifications

  return (
    <nav
      className="NavigationLinks"
      style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <NavLink to="/">
        <img
          src={homeIcon}
          alt="Home"
          style={iconStyle}
        />
      </NavLink>

      <NavLink to="/gallery">
        <img
          src={imageIcon}
          alt="Gallery"
          style={iconStyle}
        />
      </NavLink>

      <NavLink to="/guidelines">
        <img
          src={bookIcon}
          alt="Library"
          style={iconStyle}
        />
      </NavLink>

      {/* --- NOTIFICATION SECTION --- */}
      <section
        className="nav-notification"
        ref={popoverRef}>
        <button
          type="button"
          className={`nav-icon-button ${isOpen ? "is-open" : ""}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="বিজ্ঞপ্তি খুলুন">
          <img
            src={notificationIcon}
            alt="বিজ্ঞপ্তি"
            style={iconStyle}
          />
          {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
        </button>

        {isOpen && (
          <aside className="notification-popover mobile-full-screen">
            <header className="notification-popover__header">
              <div className="notification-header-content">
                <span className="notification-popover__title">বিজ্ঞপ্তি</span>
                <p className="notification-popover__subtitle">
                  আপনার সাম্প্রতিক আপডেট
                </p>
              </div>

              <div className="notification-header-actions">
                <button
                  type="button"
                  className="notification-clear"
                  onClick={handleClearAll}
                  disabled={notifications.length === 0}>
                  সব মুছুন
                </button>
                {/* Mobile Close Button */}
                <button
                  type="button"
                  className="mobile-close-btn"
                  onClick={() => setIsOpen(false)}>
                  <CloseIcon
                    width={20}
                    height={20}
                  />
                </button>
              </div>
            </header>

            <div
              className="notification-popover__list"
              role="list">
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  // Resolve User Data
                  const sender = notification.sender || notification.user || {};
                  // Priority: Name > Username > Fallback
                  const name =
                    sender.name || sender.username || "অজানা ব্যবহারকারী";
                  const avatar = sender.profileImage
                    ? ensureAbsoluteUrl(sender.profileImage)
                    : AVATAR_PLACEHOLDER;

                  return (
                    <article
                      className="notification-item"
                      key={notification._id || notification.id}
                      role="button"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleNotificationClick(notification)}>
                      <div className="notification-avatar-wrapper">
                        <img
                          src={avatar}
                          alt={name}
                          className="notification-avatar"
                        />
                      </div>
                      <div className="notification-body">
                        <span className="notification-author">{name}</span>
                        <p className="notification-message">
                          {translateNotificationMessage(notification.message)}
                        </p>
                        <time className="notification-time">
                          {formatTimeAgo(notification.createdAt)}
                        </time>
                      </div>
                      <button
                        type="button"
                        className="notification-dismiss"
                        aria-label="মুছুন"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(notification._id || notification.id);
                        }}>
                        <CloseIcon
                          width={14}
                          height={14}
                        />
                      </button>
                    </article>
                  );
                })
              ) : (
                <div className="notification-empty">
                  <p>সব কিছু আপডেটেড! নতুন কোনো নোটিফিকেশন নেই।</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </section>

      <NavLink to="/me">
        <img
          src={followersIcon}
          alt="My profile"
          style={iconStyle}
        />
      </NavLink>

      {/* --- MOBILE STYLES --- */}
      <style>{`
        @media (max-width: 768px) {
          .notification-popover.mobile-full-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            transform: none !important;
          }

          .notification-popover__list {
            flex: 1;
            overflow-y: auto;
          }

          .notification-header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .mobile-close-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
          }
        }

        @media (min-width: 769px) {
          .mobile-close-btn {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navigation;
