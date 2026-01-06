import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import EditBadgeIcon from "@/assets/IconComponents/EditBadgeIcon";
import DeleteBadgeIcon from "@/assets/IconComponents/DeleteBadgeIcon";
import SearchIcon from "@/assets/IconComponents/SearchIcon";
import AdminDataTable from "@/features/admin/components/AdminDataTable";
import "../styles/adminScoped.css";

// 🔹 import API functions
import { fetchAllCrops, editCrop, deleteCrop } from "@/api/authApi";

const CATEGORY_OPTIONS = ["ক্ষতিকর পোকামাকড়", "রোগবালাই"];

const highlightClass = (categoryName) =>
  categoryName === "ক্ষতিকর পোকামাকড়" ? "cropctgred" : "";

export default function ManageCropCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [formState, setFormState] = useState({
    banglaName: "",
    englishName: "",
    categoryName: CATEGORY_OPTIONS[0],
  });
  const [removing, setRemoving] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef(null);

  // 🔹 Fetch all crops on mount
  useEffect(() => {
    const loadCrops = async () => {
      try {
        const res = await fetchAllCrops();
        if (res?.data && Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch crops:", error);
        toast.error("Failed to load crops");
      } finally {
        setIsLoading(false);
      }
    };
    loadCrops();
  }, []);

  // 🔹 Search filter
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((item) => {
      return (
        item.banglaName.toLowerCase().includes(term) ||
        item.englishName.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    });
  }, [categories, search]);

  // 🔹 Delete crop
  const handleDelete = async (crop) => {
    if (!window.confirm(`Delete ${crop.banglaName}?`)) return;

    setRemoving((prev) => ({ ...prev, [crop._id]: true }));
    try {
      await deleteCrop(crop._id);
      setCategories((prev) => prev.filter((item) => item._id !== crop._id));
      toast.success(`"${crop.banglaName}" deleted successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete crop");
    } finally {
      setRemoving((prev) => {
        const next = { ...prev };
        delete next[crop._id];
        return next;
      });
    }
  };

  // 🔹 Edit start
  const handleEditStart = (crop) => {
    setEditing(crop);
    setFormState({
      banglaName: crop.banglaName,
      englishName: crop.englishName,
      categoryName: crop.category,
    });
  };

  const handleModalClose = () => setEditing(null);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Edit submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!editing) return;

    const trimmedBangla = formState.banglaName.trim();
    const trimmedEnglish = formState.englishName.trim();

    if (!trimmedBangla || !trimmedEnglish) {
      toast.error("Bangla and English names are required.");
      return;
    }

    const toastId = toast.loading("Saving changes...");
    try {
      await editCrop(editing._id, {
        banglaName: trimmedBangla,
        englishName: trimmedEnglish,
        category: formState.categoryName,
      });

      // UI update
      setCategories((prev) =>
        prev.map((item) =>
          item._id === editing._id
            ? {
                ...item,
                banglaName: trimmedBangla,
                englishName: trimmedEnglish,
                category: formState.categoryName,
              }
            : item
        )
      );

      toast.success("Crop updated successfully", { id: toastId });
      setEditing(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update crop", { id: toastId });
    }
  };

  const totalCount = categories.length;
  const visibleCount = filtered.length;

  return (
    <div
      className="content-wrapper _scoped_admin"
      style={{ minHeight: "839px" }}>
      <Toaster position="top-right" />

      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Manage Crops</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item active">Crops</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="card w-100">
              <div className="card-header d-flex flex-column flex-md-row gap-3 justify-content-md-between align-items-md-center">
                <h3 className="card-title mb-0">
                  Total Crops = [{totalCount}]
                </h3>
                <span className="text-muted small">
                  Showing {visibleCount} item{visibleCount === 1 ? "" : "s"}
                </span>
                <div
                  className="input-group"
                  style={{ maxWidth: 340 }}>
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <SearchIcon
                        size={18}
                        color="#64748b"
                      />
                    </span>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="search"
                    className="form-control"
                    placeholder="Search by name or category"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <div className="card-body">
                {isLoading ? (
                  <div className="text-center text-muted py-5">
                    Loading crops...
                  </div>
                ) : (
                  <AdminDataTable
                    columns={[
                      { key: "no", label: "NO", render: (_, i) => i + 1 },
                      { key: "englishName", label: "English Name" },
                      { key: "banglaName", label: "Bangla Name" },
                      {
                        key: "category",
                        label: "Category",
                        render: (row) => (
                          <h5 className={highlightClass(row.category)}>
                            {row.category}
                          </h5>
                        ),
                      },
                      {
                        key: "actions",
                        label: "Actions",
                        cellClassName: "text-right",
                        render: (row) => (
                          <>
                            <button
                              type="button"
                              className="admin-icon-btn admin-icon-btn--edit"
                              onClick={() => handleEditStart(row)}>
                              <EditBadgeIcon size={30} />
                            </button>
                            <button
                              type="button"
                              className="admin-icon-btn admin-icon-btn--delete"
                              onClick={() => handleDelete(row)}>
                              <DeleteBadgeIcon size={30} />
                            </button>
                          </>
                        ),
                      },
                    ]}
                    rows={filtered}
                    emptyMessage="No crops found."
                    getRowKey={(row) => row._id}
                    getRowClassName={(row) =>
                      removing[row._id] ? "is-removing" : ""
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 Edit Modal */}
      {editing && (
        <div
          id="photo-modal"
          style={{ display: "flex" }}
          onClick={handleModalClose}>
          <div
            id="photo-modal-form"
            onClick={(event) => event.stopPropagation()}>
            <h2 className="edit-header">Edit Crop</h2>

            <form onSubmit={handleFormSubmit}>
              <div className="card-bodyy">
                <div className="display-flex flex-column flex-md-row gap-3">
                  <div className="form-group amf grow-grow-1">
                    <label>Bangla Name</label>
                    <input
                      type="text"
                      name="banglaName"
                      value={formState.banglaName}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group amf grow-grow-1">
                    <label>English Name</label>
                    <input
                      type="text"
                      name="englishName"
                      value={formState.englishName}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="display-flex flex-column flex-md-row gap-3">
                  <div className="form-group amf grow-grow-1">
                    <label>Category</label>
                    <select
                      name="categoryName"
                      value={formState.categoryName}
                      onChange={handleFormChange}
                      className="form-control">
                      {CATEGORY_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card-footer d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleModalClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>

            <div
              id="photo-closebtn"
              role="button"
              onClick={handleModalClose}>
              X
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
