/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "../styles/adminScoped.css";
import TrashIcon from "@/assets/IconComponents/Trash";
import EditBadgeIcon from "@/assets/IconComponents/EditBadgeIcon";
import {
  fetchAllCropDetails,
  editCropDetails,
  deleteCropDetails,
} from "@/api/authApi";
import { baseApi } from "../../../api";

const SUMMARY_ORDER = [
  { key: "rogLokkho", label: "রোগের লক্ষণ" },
  { key: "koroniyo", label: "করণীয়" },
];

export default function ManageCropDetailsPage() {
  const [cropDetails, setCropDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [confirmDetail, setConfirmDetail] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [editDetail, setEditDetail] = useState(null);
  const [editForm, setEditForm] = useState({
    cropTitle: "",
    rogLokkho: "",
    koroniyo: "",
  });

  // Fetch all crop details
  useEffect(() => {
    const loadCropDetails = async () => {
      try {
        setLoading(true);
        const res = await fetchAllCropDetails();
        if (res?.success) {
          setCropDetails(res.data);
        } else {
          toast.error("Failed to load crop details");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading crop details");
      } finally {
        setLoading(false);
      }
    };
    loadCropDetails();
  }, []);

  // Filter categories
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        cropDetails.map((detail) => detail.category?.banglaName).filter(Boolean)
      )
    );
  }, [cropDetails]);

  // Filter crop details by search & category
  const filteredDetails = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return cropDetails.filter((detail) => {
      const matchesCategory =
        categoryFilter === "all" ||
        detail.category?.banglaName?.toLowerCase() ===
          categoryFilter.toLowerCase();

      if (!matchesCategory) return false;
      if (!term) return true;

      return (
        detail.cropTitle?.toLowerCase().includes(term) ||
        detail.rogLokkho?.toLowerCase().includes(term) ||
        detail.koroniyo?.toLowerCase().includes(term) ||
        detail.category?.banglaName?.toLowerCase().includes(term)
      );
    });
  }, [cropDetails, searchTerm, categoryFilter]);

  // Delete crop detail
  const handleConfirmDelete = async () => {
    if (!confirmDetail) return;
    const id = confirmDetail._id;
    setConfirmDetail(null);
    try {
      const res = await deleteCropDetails(id);
      if (res?.success) {
        setCropDetails((prev) => prev.filter((item) => item._id !== id));
        toast.success("ফসলের তথ্য মুছে ফেলা হয়েছে");
      } else {
        toast.error("মুছে ফেলা ব্যর্থ হয়েছে");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    }
  };

  // Edit crop detail
  const handleEdit = (detail) => {
    setEditDetail(detail);
    setEditForm({
      cropTitle: detail.cropTitle || "",
      rogLokkho: detail.rogLokkho || "",
      koroniyo: detail.koroniyo || "",
    });
  };

  const handleCancelEdit = () => setEditDetail(null);

  const handleSubmitEdit = async () => {
    if (!editDetail) return;
    try {
      const res = await editCropDetails(editDetail._id, editForm);
      if (res?.success) {
        setCropDetails((prev) =>
          prev.map((item) =>
            item._id === editDetail._id ? { ...item, ...editForm } : item
          )
        );
        toast.success("ফসলের তথ্য আপডেট হয়েছে");
        setEditDetail(null);
      } else {
        toast.error("আপডেট ব্যর্থ হয়েছে");
      }
    } catch (err) {
      console.error(err);
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    }
  };

  // Toggle expand summary
  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="content-wrapper _scoped_admin">
        <div className="p-5 text-center text-muted">
          Loading crop details...
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper _scoped_admin manage-crop-details-page">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">ফসলের তথ্য ব্যবস্থাপনা</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">ড্যাশবোর্ড</NavLink>
                </li>
                <li className="breadcrumb-item active">ব্যবস্থাপনা</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="crop-details-shell">
            <div className="crop-details-toolbar">
              <div className="crop-details-stats">
                <span>মোট এন্ট্রি: {cropDetails.length}</span>
                <span>দেখানো হচ্ছে: {filteredDetails.length}</span>
              </div>
              <div className="crop-details-controls">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ফসল, ক্যাটাগরি বা শিরোনাম দিয়ে খুঁজুন..."
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">সব ক্যাটাগরি</option>
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Crop Details Grid */}
            <div className="crop-details-grid">
              {filteredDetails.map((detail) => {
                // const isExpanded = expandedIds.has(detail._id);
                return (
                  <article
                    key={detail._id}
                    className={`crop-detail-card ${
                      removing[detail._id] ? "is-removing" : ""
                    }`}>
                    {/* Action buttons */}
                    <div className="crop-detail-actions">
                      <button
                        className="crop-detail-edit-icon"
                        onClick={() => handleEdit(detail)}
                        title="Edit">
                        <EditBadgeIcon
                          width={20}
                          height={20}
                          strokeWidth={1.8}
                        />
                      </button>
                      <button
                        className="crop-detail-delete-icon"
                        onClick={() => setConfirmDetail(detail)}
                        disabled={Boolean(removing[detail._id])}
                        title="Delete">
                        <TrashIcon
                          width={20}
                          height={20}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>

                    {/* Crop media */}
                    <div className="crop-detail-media">
                      <img
                        src={
                          detail.cropImage
                            ? detail.cropImage.startsWith("http")
                              ? detail.cropImage
                              : `${baseApi}${detail.cropImage}`
                            : "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png"
                        }
                        alt={detail.cropTitle || "Crop Detail image"}
                        loading="lazy"
                      />
                      <span className="badge badge-info">
                        {detail.category?.banglaName || "N/A"}
                      </span>
                    </div>

                    {/* Crop body */}
                    <div className="crop-detail-body">
                      <h3>{detail.cropTitle}</h3>
                      <div className="crop-detail-summary">
                        {SUMMARY_ORDER.map(({ key, label }) => (
                          <div key={key}>
                            <strong>{label}:</strong>{" "}
                            <p>{detail[key] || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {!filteredDetails.length && (
              <div className="text-center text-muted p-5">
                কোনো তথ্য পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Delete Modal */}
      {confirmDetail && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h5>ফসলের তথ্য মুছে ফেলতে চাও?</h5>
            </div>
            <div className="admin-modal-body">
              <p>
                <strong>{confirmDetail.cropTitle}</strong> সম্পর্কিত তথ্য
                স্থায়ীভাবে মুছে যাবে।
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setConfirmDetail(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editDetail && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h5>Edit Crop Detail</h5>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label>ফসলের নাম</label>
                <input
                  type="text"
                  value={editForm.cropTitle}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      cropTitle: e.target.value,
                    }))
                  }
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>রোগের লক্ষণ</label>
                <textarea
                  value={editForm.rogLokkho}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      rogLokkho: e.target.value,
                    }))
                  }
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>করণীয়</label>
                <textarea
                  value={editForm.koroniyo}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      koroniyo: e.target.value,
                    }))
                  }
                  className="form-control"
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
