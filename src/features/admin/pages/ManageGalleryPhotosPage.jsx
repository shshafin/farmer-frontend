import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "../styles/adminScoped.css";
import SearchIcon from "@/assets/IconComponents/SearchIcon";
import TrashIcon from "@/assets/IconComponents/Trash";
import EditBadgeIcon from "@/assets/IconComponents/EditBadgeIcon";
import { fetchAllGalleries, editGallery, deleteGallery } from "@/api/authApi";
import { baseApi } from "../../../api";

const timeFormatter = new Intl.DateTimeFormat("bn-BD", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const dateFormatter = new Intl.DateTimeFormat("bn-BD", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "সময় জানা যায়নি";

  const time = timeFormatter.format(date).toLowerCase();
  const formattedDate = dateFormatter.format(date);

  return `${time} (${formattedDate})`;
};

export default function ManageGalleryPhotosPage() {
  const [galleries, setGalleries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingGallery, setEditingGallery] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadGalleries = async () => {
      try {
        const res = await fetchAllGalleries();
        const galleryList = Array.isArray(res?.data) ? res.data : [];
        setGalleries(galleryList);
        setFiltered(galleryList);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load galleries");
      } finally {
        setIsLoading(false);
      }
    };
    loadGalleries();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(galleries);
    } else {
      const term = search.toLowerCase();
      setFiltered(
        galleries.filter((item) =>
          item.description?.toLowerCase().includes(term)
        )
      );
    }
  }, [search, galleries]);

  const handleEditClick = (gallery) => {
    setEditingGallery(gallery);
    setEditDescription(gallery.description || "");
    setEditImageFile(null);
    const imageUrl = gallery.image
      ? gallery.image.startsWith("http")
        ? gallery.image
        : `${baseApi}${gallery.image}`
      : "";
    setEditImagePreview(imageUrl);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setEditImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setEditImagePreview(objectUrl);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingGallery || isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Updating gallery...");

    try {
      const formData = new FormData();
      formData.append("description", editDescription);
      if (editImageFile) {
        formData.append("image", editImageFile);
      }

      const res = await editGallery(editingGallery._id, formData);
      if (res?.success) {
        setGalleries((prev) =>
          prev.map((g) =>
            g._id === editingGallery._id
              ? { ...g, description: editDescription, image: res.data?.image || g.image }
              : g
          )
        );
        toast.success("Gallery updated successfully", { id: toastId });
        setEditingGallery(null);
        setEditImageFile(null);
      } else {
        toast.error("Failed to update gallery", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Error updating gallery", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (gallery) => {
    setConfirmDelete(gallery);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete || isDeleting) return;

    setIsDeleting(true);
    const toastId = toast.loading("Deleting gallery...");

    try {
      const res = await deleteGallery(confirmDelete._id);
      if (res?.success) {
        setGalleries((prev) => prev.filter((g) => g._id !== confirmDelete._id));
        toast.success("Gallery deleted successfully", { id: toastId });
        setConfirmDelete(null);
      } else {
        toast.error("Failed to delete gallery", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Error deleting gallery", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (editImagePreview && editImageFile) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [editImagePreview, editImageFile]);

  return (
    <div
      className="content-wrapper _scoped_admin"
      style={{ minHeight: "839px" }}>
      <Toaster position="top-right" />

      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Manage Gallery Photos</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item active">Gallery</li>
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
                  <h3 className="card-title mb-0">Gallery Photos</h3>
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
                      <SearchIcon
                        size={18}
                        color="#64748b"
                      />
                    </span>
                  </div>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search description"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="card-body">
                {isLoading ? (
                  <div className="text-center text-muted py-5">
                    Loading galleries...
                  </div>
                ) : filtered.length > 0 ? (
                  <div className="manage-gallery-grid">
                    {filtered.map((item) => (
                      <article
                        key={item._id}
                        className="manage-gallery-card">
                        <div className="manage-gallery-thumb">
                          <img
                            src={
                              item.image
                                ? item.image.startsWith("http")
                                  ? item.image
                                  : `${baseApi}${item.image}`
                                : "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png"
                            }
                            alt={item.description || "Gallery image"}
                          />
                          <div className="manage-gallery-actions">
                            <button
                              className="btn-action edit"
                              onClick={() => handleEditClick(item)}
                              title="Edit">
                              <EditBadgeIcon width={18} height={18} />
                            </button>
                            <button
                              className="btn-action delete"
                              onClick={() => handleDeleteClick(item)}
                              title="Delete">
                              <TrashIcon width={18} height={18} />
                            </button>
                          </div>
                        </div>
                        <div className="manage-gallery-body">
                          <p className="manage-gallery-description">
                            {item.description || "No description available"}
                          </p>
                        </div>
                        <footer className="manage-gallery-footer">
                          <div className="manage-gallery-info">
                            <span className="manage-gallery-time">
                              {formatTimestamp(item.createdAt)}
                            </span>
                          </div>
                        </footer>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    No photos found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {editingGallery && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal" style={{ maxWidth: 600 }}>
            <div className="admin-modal-header">
              <h5>Edit Gallery Photo</h5>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    className="form-control"
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter photo description"
                  />
                </div>
                <div className="form-group">
                  <label>Current Image</label>
                  {editImagePreview && (
                    <div className="mb-2">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "300px",
                          objectFit: "contain",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="form-group mb-0">
                  <label>Change Image (Optional)</label>
                  <div className="custom-file">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="custom-file-input"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label className="custom-file-label">
                      {editImageFile ? editImageFile.name : "Choose new image"}
                    </label>
                  </div>
                  <small className="form-text text-muted">
                    PNG or JPG, up to 10MB
                  </small>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setEditingGallery(null);
                    setEditImageFile(null);
                  }}
                  disabled={isSubmitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h5>Confirm Delete</h5>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this photo?</p>
              {confirmDelete.description && (
                <p className="text-muted small mb-0">
                  "{confirmDelete.description}"
                </p>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}>
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
