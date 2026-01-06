import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DeleteOutlineIcon from "@/assets/IconComponents/DeleteOutlineIcon";
import EditBadgeIcon from "@/assets/IconComponents/EditBadgeIcon";
import { fetchAllVideos, deleteVideo, editVideo } from "@/api/authApi";
import "../styles/adminScoped.css";
import { baseApi } from "../../../api";

// Time & Date Formatter
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});
const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const time = timeFormatter.format(date).toLowerCase();
  const formattedDate = dateFormatter.format(date);
  return `${time} (${formattedDate})`;
};

// Generate YouTube Thumbnail
const getYoutubeThumbnail = (url) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

export default function ManageVideosPage() {
  const [videos, setVideos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });

  // Edit handlers
  const handleEdit = (video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title || "",
      description: video.description || "",
      videoUrl: video.videoUrl || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingVideo(null);
    setEditForm({ title: "", description: "", videoUrl: "" });
  };

  const handleSubmitEdit = async () => {
    if (!editingVideo) return;
    try {
      const res = await editVideo(editingVideo._id, editForm);
      if (res?.success) {
        setVideos((prev) =>
          prev.map((v) =>
            v._id === editingVideo._id ? { ...v, ...editForm } : v
          )
        );
        setFiltered((prev) =>
          prev.map((v) =>
            v._id === editingVideo._id ? { ...v, ...editForm } : v
          )
        );
        toast.success("Video updated successfully");
        handleCancelEdit();
      } else {
        toast.error("Failed to update video");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating video");
    }
  };

  // Fetch all videos
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await fetchAllVideos();
        const videoList = Array.isArray(res?.data) ? res.data : [];
        setVideos(videoList);
        setFiltered(videoList);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load videos");
      } finally {
        setIsLoading(false);
      }
    };
    loadVideos();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(videos);
    } else {
      const term = search.toLowerCase();
      setFiltered(
        videos.filter(
          (item) =>
            item.title?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
        )
      );
    }
  }, [search, videos]);

  // Delete video
  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      setRemoving((prev) => ({ ...prev, [videoId]: true }));
      await deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setFiltered((prev) => prev.filter((v) => v._id !== videoId));
      toast.success("Video deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete video");
      setRemoving((prev) => {
        const copy = { ...prev };
        delete copy[videoId];
        return copy;
      });
    }
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
              <h1 className="m-0">Manage Videos</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item active">Videos</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="card w-100">
              <div className="card-header d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-lg-between">
                <div className="gallery-status d-flex flex-column gap-2">
                  <h3 className="card-title mb-0">Videos</h3>
                  <div className="manage-gallery-summary">
                    <span className="manage-gallery-chip manage-gallery-chip--visible">
                      Total {filtered.length}
                    </span>
                  </div>
                </div>
                <div
                  className="manage-gallery-search input-group"
                  style={{ maxWidth: 360 }}>
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2">
                        <circle
                          cx="11"
                          cy="11"
                          r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    </span>
                  </div>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search videos"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="card-body">
                {isLoading ? (
                  <div className="text-center text-muted py-5">
                    Loading videos...
                  </div>
                ) : filtered.length > 0 ? (
                  <div className="manage-videos-grid">
                    {filtered.map((video) => (
                      <article
                        key={video._id}
                        className={`manage-video-card ${removing[video._id] ? "is-removing" : ""
                          }`}>
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="manage-video-thumb-link">
                          <div className="manage-video-thumb">
                            {video.thumbnail ? (
                              <img
                                src={
                                  video.thumbnail.startsWith("http")
                                    ? video.thumbnail
                                    : `${baseApi}${video.thumbnail}`
                                }
                                alt={video.title || "Video thumbnail"}
                              />
                            ) : video.videoUrl ? (
                              <img
                                src={getYoutubeThumbnail(video.videoUrl)}
                                alt={video.title || "Video thumbnail"}
                              />
                            ) : (
                              <div className="video-placeholder">
                                <svg
                                  width="48"
                                  height="48"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#64748b"
                                  strokeWidth="1">
                                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                  <rect
                                    x="1"
                                    y="5"
                                    width="15"
                                    height="14"
                                    rx="2"
                                    ry="2"></rect>
                                </svg>
                              </div>
                            )}
                          </div>
                        </a>

                        <div className="manage-video-body">
                          <h4 className="manage-video-title">
                            {video.title || "No Title"}
                          </h4>
                          <p
                            className="manage-video-description"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}>
                            {video.description || "No description available"}
                          </p>
                        </div>

                        <footer className="manage-video-footer">
                          <span className="manage-video-time">
                            {formatTimestamp(video.createdAt)}
                          </span>

                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="admin-icon-btn admin-edit-btn"
                              onClick={() => handleEdit(video)}
                              title="Edit Video">
                              <EditBadgeIcon width={20} height={20} />
                            </button>
                            <button
                              type="button"
                              className="admin-icon-btn admin-trash-btn"
                              onClick={() => handleDelete(video._id)}
                              title="Delete Video">
                              <DeleteOutlineIcon />
                            </button>
                          </div>
                        </footer>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    No videos found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {editingVideo && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h5>Edit Video</h5>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label>Video Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Video URL (YouTube)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.videoUrl}
                  onChange={(e) =>
                    setEditForm({ ...editForm, videoUrl: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleCancelEdit}>
                Cancel
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={handleSubmitEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
