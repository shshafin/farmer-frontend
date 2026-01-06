import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import EditBadgeIcon from "@/assets/IconComponents/EditBadgeIcon";
import DeleteBadgeIcon from "@/assets/IconComponents/DeleteBadgeIcon";
import SearchIcon from "@/assets/IconComponents/SearchIcon";
import AdminDataTable from "@/features/admin/components/AdminDataTable";
import { fetchAllCompanies, editCompany, deleteCompany } from "@/api/authApi";
import "../styles/adminScoped.css";

export default function ManageCompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [formState, setFormState] = useState({
    banglaName: "",
    englishName: "",
  });
  const [removing, setRemoving] = useState({});
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);

  // ✅ Fetch companies from API
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const res = await fetchAllCompanies();
        if (res?.success) {
          setCompanies(res.data);
        } else {
          toast.error("Failed to load companies");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching companies");
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  // ✅ Filtered companies
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter((item) => {
      return (
        item.banglaName.toLowerCase().includes(term) ||
        item.englishName.toLowerCase().includes(term) ||
        String(item._id).includes(term)
      );
    });
  }, [companies, search]);

  // ✅ Delete company
  const handleDelete = async (company) => {
    const confirmDelete = window.confirm(
      `"${company.banglaName}" কোম্পানি মুছে ফেলতে চান?`
    );
    if (!confirmDelete) return;
    setRemoving((prev) => ({ ...prev, [company._id]: true }));
    try {
      const res = await deleteCompany(company._id);
      if (res?.success) {
        setCompanies((prev) => prev.filter((c) => c._id !== company._id));
        toast.success(`"${company.banglaName}" কোম্পানি মুছে ফেলা হয়েছে।`);
      } else {
        toast.error("Company delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting company");
    } finally {
      setRemoving((prev) => {
        const next = { ...prev };
        delete next[company._id];
        return next;
      });
    }
  };

  // ✅ Edit company
  const handleEditStart = (company) => {
    setEditing(company);
    setFormState({
      banglaName: company.banglaName,
      englishName: company.englishName,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalClose = () => setEditing(null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const res = await editCompany(editing._id, formState);
      if (res?.success) {
        setCompanies((prev) =>
          prev.map((c) => (c._id === editing._id ? { ...c, ...formState } : c))
        );
        toast.success(`"${formState.banglaName}" কোম্পানি হালনাগাদ হয়েছে।`);
        handleModalClose();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating company");
    }
  };

  const totalCompanies = companies.length;

  if (loading) {
    return (
      <div className="content-wrapper _scoped_admin">
        <div className="p-5 text-center text-muted">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="content-wrapper _scoped_admin">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0">Manage Company</h1>
              <p className="text-muted mt-1 mb-0">
                Keep company records organised and current.
              </p>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item active">Manage Company</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="card w-100">
              <div className="card-header d-flex flex-column flex-md-row gap-3 justify-content-md-between align-items-md-center">
                <h3 className="card-title mb-0">
                  Total Companies = [{totalCompanies}]
                </h3>
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
                    placeholder="Search companies..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <div className="card-body">
                <AdminDataTable
                  columns={[
                    { key: "no", label: "NO", render: (_, index) => index + 1 },
                    // { key: "_id", label: "ID" },
                    { key: "banglaName", label: "Bangla Name" },
                    { key: "englishName", label: "English Name" },
                    {
                      key: "actions",
                      label: "Actions",
                      cellClassName: "text-right",
                      render: (row) => (
                        <>
                          <button
                            className="admin-icon-btn admin-icon-btn--edit"
                            onClick={() => handleEditStart(row)}>
                            <EditBadgeIcon size={28} />
                          </button>
                          <button
                            className="admin-icon-btn admin-icon-btn--delete"
                            onClick={() => handleDelete(row)}
                            disabled={Boolean(removing[row._id])}>
                            <DeleteBadgeIcon size={28} />
                          </button>
                        </>
                      ),
                    },
                  ]}
                  rows={filtered}
                  emptyMessage="No companies found."
                  getRowKey={(row) => row._id}
                  getRowClassName={(row) =>
                    removing[row._id] ? "is-removing" : ""
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {editing && (
        <div
          className="admin-modal-backdrop"
          onClick={handleModalClose}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h5>Edit Company</h5>
            </div>
            <div className="admin-modal-body">
              <form
                onSubmit={handleFormSubmit}
                autoComplete="off">
                <div className="form-group">
                  <label>Bangla Name</label>
                  <input
                    type="text"
                    name="banglaName"
                    value={formState.banglaName}
                    onChange={handleFormChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>English Name</label>
                  <input
                    type="text"
                    name="englishName"
                    value={formState.englishName}
                    onChange={handleFormChange}
                    className="form-control"
                  />
                </div>
                <div className="admin-modal-footer d-flex justify-content-between">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
