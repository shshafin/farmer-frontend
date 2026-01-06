import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video"; // default export
// import { Video } from "yet-another-react-lightbox/plugins/video";
import DeleteOutlineIcon from "@/assets/IconComponents/DeleteOutlineIcon";
import HeartOutlineIcon from "@/assets/IconComponents/HeartOutlineIcon";
import CommentBubbleIcon from "@/assets/IconComponents/CommentBubbleIcon";
import { fetchPosts, deletePost } from "@/api/authApi";
import "../styles/adminScoped.css";
import config from "../../../../config";
import { baseApi } from "../../../api";
import ExpandableText from "@/components/ui/ExpandableText";

const PAGE_SIZE = 5;
const isVideoFile = (url) => /\.(mp4|webm|ogg)$/i.test(url);

const timeFormatter = new Intl.DateTimeFormat("bn-BD", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function ManagePostsPage() {
  const [allPosts, setAllPosts] = useState([]);
  const [items, setItems] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [removing, setRemoving] = useState({});
  const [lightbox, setLightbox] = useState(null);
  const loadTimerRef = useRef(null);
  const sentinelRef = useRef(null);

  // ✅ Fetch posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const res = await fetchPosts();
        if (res.success && Array.isArray(res.posts)) {
          const formatted = res.posts.map((post) => ({
            id: post._id,
            user: {
              name: post.user?.username || "Unknown User",
              username: post.user?.username || "unknown",
              profileImage: post.user?.profileImage,
            },
            text: post.text,
            createdAt: post.createdAt,
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
            images: post.images || [],
            videos: post.videos || [],
          }));
          setAllPosts(formatted);
          setLoadedCount(0);
        } else {
          toast.error("Failed to load posts");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading posts");
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  const totalPosts = allPosts.length;
  const hasMore = loadedCount < totalPosts;

  const scheduleLoad = useCallback(
    (nextCount) => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
      setIsLoading(true);
      loadTimerRef.current = setTimeout(() => {
        setItems(allPosts.slice(0, nextCount));
        setLoadedCount(nextCount);
        setIsLoading(false);
      }, 300);
    },
    [allPosts]
  );

  const loadNextChunk = useCallback(() => {
    if (isLoading || !hasMore) return;
    const nextCount = Math.min(totalPosts, loadedCount + PAGE_SIZE);
    if (nextCount === loadedCount) return;
    scheduleLoad(nextCount);
  }, [isLoading, hasMore, loadedCount, totalPosts, scheduleLoad]);

  useEffect(() => {
    if (loadedCount === 0 && totalPosts > 0 && !isLoading) {
      scheduleLoad(Math.min(totalPosts, PAGE_SIZE));
    }
  }, [loadedCount, totalPosts, isLoading, scheduleLoad]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) loadNextChunk();
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadNextChunk]);

  // ✅ Delete post
  // ✅ Delete post function in ManagePostsPage.jsx
  const handleDelete = async (postId) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই পোস্টটি ডিলিট করতে চান?"))
      return;

    try {
      // UI animation active koro
      setRemoving((prev) => ({ ...prev, [postId]: true }));

      // API call
      const response = await deletePost(postId);

      if (response.success || response.status === 200) {
        // Local state theke remove koro
        setAllPosts((prev) => prev.filter((p) => p.id !== postId));
        setItems((prev) => prev.filter((p) => p.id !== postId));
        toast.success("পোস্টটি সফলভাবে ডিলিট করা হয়েছে!");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("পোস্ট ডিলিট করতে সমস্যা হয়েছে");
      setRemoving((prev) => {
        const copy = { ...prev };
        delete copy[postId];
        return copy;
      });
    }
  };

  const openLightbox = (url) => {
    const fullUrl = url.startsWith("http") ? url : `${config.url}${url}`;
    setLightbox({
      type: isVideoFile(fullUrl) ? "video" : "image",
      url: fullUrl,
    });
  };
  const closeLightbox = () => setLightbox(null);

  return (
    <div
      className="content-wrapper _scoped_admin"
      style={{ minHeight: "839px" }}>
      <Toaster position="top-right" />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Manage All Posts</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item active">Manage Posts</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {isLoading && !items.length && (
            <div className="text-center py-5 text-muted">Loading posts...</div>
          )}

          <div className="manage-posts-grid">
            {items.map((post) => (
              <article
                className={`manage-post-card ${
                  removing[post.id] ? "is-removing" : ""
                }`}
                key={post.id}>
                <header className="manage-post-header">
                  <img
                    src={
                      post.user.profileImage
                        ? post.user.profileImage.startsWith("http")
                          ? post.user.profileImage
                          : `${baseApi}${post.user.profileImage}`
                        : "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png"
                    }
                    alt={post.user.name}
                    className="manage-post-avatar"
                  />
                  <div className="manage-post-meta">
                    <span className="manage-post-author">{post.user.name}</span>
                    <span className="manage-post-username">
                      @{post.user.username}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="admin-icon-btn admin-trash-btn"
                    onClick={() => handleDelete(post.id)}>
                    <DeleteOutlineIcon />
                  </button>
                </header>

                <div className="manage-post-body">
                  <div className="manage-post-text">
                    <ExpandableText text={post.text} />
                  </div>

                  {/* Media */}
                  <div className="manage-post-media">
                    {post.videos && post.videos.length > 0 ? (
                      <video
                        autoPlay
                        src={
                          post.videos[0].startsWith("http")
                            ? post.videos[0]
                            : `${config.url}${post.videos[0]}`
                        }
                        className="manage-post-video"
                        onClick={() => openLightbox(post.videos[0])}
                      />
                    ) : post.images && post.images.length > 0 ? (
                      <img
                        src={
                          post.images[0].startsWith("http")
                            ? post.images[0]
                            : `${config.url}${post.images[0]}`
                        }
                        alt={`Media from ${post.user.name}`}
                        className="manage-post-image"
                        onClick={() => openLightbox(post.images[0])}
                      />
                    ) : (
                      <img
                        src="https://via.placeholder.com/400x250?text=No+Media"
                        alt="No media"
                        className="manage-post-image"
                      />
                    )}
                  </div>
                </div>

                <footer className="manage-post-footer">
                  <div>
                    <span className="manage-post-time">
                      {timeFormatter.format(new Date(post.createdAt))}
                    </span>
                  </div>
                  <div className="manage-post-stats">
                    <span className="manage-post-stat">
                      <HeartOutlineIcon /> {post.likes}
                    </span>
                    <span className="manage-post-stat">
                      <CommentBubbleIcon /> {post.comments}
                    </span>
                  </div>
                </footer>
              </article>
            ))}
          </div>

          {!items.length && !isLoading && (
            <div className="card mt-3">
              <div className="card-body text-center text-muted py-5">
                No posts available.
              </div>
            </div>
          )}

          <div
            ref={sentinelRef}
            aria-hidden="true"
          />
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        open={Boolean(lightbox)}
        close={closeLightbox}
        slides={
          lightbox
            ? lightbox.type === "video"
              ? [
                  {
                    type: "video",
                    sources: [{ src: lightbox.url, type: "video/mp4" }],
                  },
                ]
              : [{ src: lightbox.url }]
            : []
        }
        plugins={lightbox?.type === "video" ? [Video] : []}
        video={{ controls: true }}
      />
    </div>
  );
}
