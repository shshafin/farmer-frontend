import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";

const DUMMY_USER = (i) => ({
  id: `user-${i}`,
  name: `ব্যবহারকারী ${i}`,
  username: `user${i}`,
  location: i % 3 === 0 ? "রাজশাহী" : i % 3 === 1 ? "ঢাকা" : "চট্টগ্রাম",
  avatar:
    "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png",
  online: i % 2 === 0,
  followed: false,
});

function UserCard({ user, onToggleFollow }) {
  return (
    <article
      className="user-card"
      role="listitem">
      <div className="user-card__left">
        <div className="avatar-wrap">
          <NavLink
            to={`/user/${user._id}`}
            className="username-link">
            <img
              className="avatar"
              alt={user.name}
              src={user.avatar}
            />
            {user.online && (
              <span
                className="status-dot"
                aria-label="Online"
              />
            )}
          </NavLink>
        </div>
      </div>

      <div className="user-card__body">
        <div className="name-row">
          <NavLink
            to={`/user/${user._id}`}
            className="username-link">
            <h3
              className="username"
              title={user.name}>
              {user.name}
            </h3>
          </NavLink>
          <span className="inline-dot" />
        </div>
        <p
          className="Location"
          title="Place">
          {user.location}
        </p>
      </div>

      <div className="user-card__right">
        <button
          className={`btn btn--follow ${user.followed ? "following" : ""}`}
          onClick={() => onToggleFollow(user.id)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle
              cx="9"
              cy="7"
              r="4"></circle>
            <line
              x1="19"
              y1="8"
              x2="19"
              y2="14"></line>
            <line
              x1="22"
              y1="11"
              x2="16"
              y2="11"></line>
          </svg>
          {user.followed ? "আনফলো" : "ফলো"}
        </button>
      </div>
    </article>
  );
}

export default function Follow() {
  const [items, setItems] = useState(
    Array.from({ length: 10 }, (_, i) => DUMMY_USER(i + 1))
  );
  const [activeTab, setActiveTab] = useState("all");

  const counts = useMemo(() => {
    const all = items.length;
    const online = items.filter((u) => u.online).length;
    const friends = items.filter((u) => u.followed).length;
    return { all, online, friends };
  }, [items]);

  const visible = useMemo(() => {
    if (activeTab === "online") return items.filter((u) => u.online);
    if (activeTab === "friends") return items.filter((u) => u.followed);
    return items;
  }, [items, activeTab]);

  const loadMore = () => {
    const nextIndex = items.length + 1;
    const more = Array.from({ length: 10 }, (_, i) =>
      DUMMY_USER(nextIndex + i)
    );
    setItems((prev) => [...prev, ...more]);
  };

  const toggleFollow = (id) => {
    setItems((prev) =>
      prev.map((u) => (u.id === id ? { ...u, followed: !u.followed } : u))
    );
  };

  return (
    <div className="follow-page profile-page">
      <header style={{ textAlign: "center" }}>
        <h2>ব্যবহারকারীর অনুসরণ করুন</h2>
        <p>নতুন ব্যবহারকারীদের খুঁজে নিন এবং অনুসরণ করুন</p>
      </header>

      <main>
        <div
          className="tab-row"
          role="tablist"
          aria-label="Filter users">
          <button
            role="tab"
            aria-selected={activeTab === "all"}
            className={`tab-btn ${activeTab === "all" ? "is-active" : ""}`}
            onClick={() => setActiveTab("all")}>
            All ({counts.all})
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "online"}
            className={`tab-btn ${activeTab === "online" ? "is-active" : ""}`}
            onClick={() => setActiveTab("online")}>
            Online ({counts.online})
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "friends"}
            className={`tab-btn ${activeTab === "friends" ? "is-active" : ""}`}
            onClick={() => setActiveTab("friends")}>
            Friends ({counts.friends})
          </button>
        </div>

        <section
          aria-label="Suggestions"
          role="list">
          {visible.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onToggleFollow={toggleFollow}
            />
          ))}
        </section>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            className="profile-primary-button"
            onClick={loadMore}>
            আরও দেখুন (10)
          </button>
        </div>
      </main>
    </div>
  );
}
