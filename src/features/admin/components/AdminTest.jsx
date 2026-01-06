/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useRef, useState } from "react";
import TableView from "./TableView";
import SearchBar from "./SearchBar";
import "../styles/adminScoped.css";
import { fetchAllUsers, fetchPosts } from "@/api/authApi"; // API import
import toast, { Toaster } from "react-hot-toast";

const PAGE_SIZE_FIRST = 30;
const PAGE_SIZE_NEXT = 20;
const SEARCH_PLACEHOLDER =
  "ব্যবহারকারীর নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন...";

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [visible, setVisible] = useState(PAGE_SIZE_FIRST);
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef(null);

  const [stats, setStats] = useState([
    {
      label: "Total Users",
      value: 0,
      color: "bg-info",
      icon: "ion ion-person-add",
    },
    {
      label: "Total Posts",
      value: 0,
      color: "bg-success",
      icon: "ion ion-stats-bars",
    },
    {
      label: "Total Comments",
      value: 0,
      color: "bg-warning",
      icon: "ion ion-bag",
    },
    {
      label: "Total Likes",
      value: 0,
      color: "bg-danger",
      icon: "ion ion-pie-graph",
    },
  ]);

  // ✅ Fetch users & posts from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [userRes, postRes] = await Promise.all([
          fetchAllUsers(),
          fetchPosts(),
        ]);

        if (userRes?.success && userRes.data) {
          const users = userRes.data.map((u, i) => ({
            no: i + 1,
            id: u._id,
            name: u.name || "N/A",
            handle: u.username || `user${i}`,
            username: u.username || `user${i}`,
            email: u.email || "N/A",
            state: u.state || "N/A",
            address: u.address || "N/A",
            phone: u.phone || "N/A",
            profileImage: u.profileImage || "https://via.placeholder.com/120",
          }));
          setAllUsers(users);

          // update total users
          setStats((prev) =>
            prev.map((s) =>
              s.label === "Total Users" ? { ...s, value: users.length } : s
            )
          );
        }

        if (postRes?.success && postRes.posts) {
          setPosts(postRes.posts);

          // total posts
          const totalPosts = postRes.posts.length;

          // total likes & comments
          let totalLikes = 0;
          let totalComments = 0;

          postRes.posts.forEach((p) => {
            totalLikes += p.likes?.length || 0;
            totalComments += p.comments?.length || 0;
          });

          setStats((prev) =>
            prev.map((s) => {
              if (s.label === "Total Posts") return { ...s, value: totalPosts };
              if (s.label === "Total Likes") return { ...s, value: totalLikes };
              if (s.label === "Total Comments")
                return { ...s, value: totalComments };
              return s;
            })
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) =>
      [u.name, u.handle, u.email, u.state, u.address, u.phone].some((field) =>
        field?.toLowerCase().includes(q)
      )
    );
  }, [allUsers, query]);

  const slice = useMemo(() => filtered.slice(0, visible), [filtered, visible]);

  useEffect(() => {
    setVisible(PAGE_SIZE_FIRST);
  }, [query]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE_NEXT, filtered.length));
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  const handleDelete = (id) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleLogin = (username) => {
    const url = `${window.location.origin}/user/${encodeURIComponent(
      username
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="content-wrapper _scoped_admin"
      style={{ minHeight: "839px" }}>
      <Toaster position="top-right" />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">All Users</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right" />
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {stats.map((stat) => (
              <div
                className="col-lg-3 col-6"
                key={stat.label}>
                <div className={`small-box ${stat.color}`}>
                  <div className="inner">
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                  </div>
                  <div className="icon">
                    <i className={stat.icon}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            <div className="card w-100">
              <div className="companyprosearchbox">
                <SearchBar
                  placeholder={SEARCH_PLACEHOLDER}
                  onChange={setQuery}
                  debounceMs={300}
                />
              </div>

              <div className="card-header">
                <h3 className="card-title">User Lists</h3>
              </div>

              <div className="card-body">
                {loading ? (
                  <div className="py-4 text-center text-muted">
                    Loading users...
                  </div>
                ) : (
                  <>
                    <TableView
                      items={slice}
                      onDelete={handleDelete}
                      onLogin={handleLogin}
                    />

                    {visible < filtered.length && (
                      <div
                        ref={sentinelRef}
                        className="py-3 text-center text-muted">
                        Loading more...
                      </div>
                    )}
                    {filtered.length === 0 && (
                      <div className="py-4 text-center text-muted">
                        No results found
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
