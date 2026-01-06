import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { addCompany } from "../../../api/authApi";

const normalizeSlug = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .toLowerCase();

export default function AddCompanyCategoryPage() {
  const [banglaName, setBanglaName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const slug = useMemo(() => {
    const base = englishName.trim() || banglaName.trim();
    return base ? normalizeSlug(base) : "";
  }, [englishName, banglaName]);

  const payload = useMemo(
    () => ({
      banglaName: banglaName.trim(),
      englishName: englishName.trim(),
      slug,
      location: location.trim(),
      meta: {
        createdBy: "admin",
        createdAt: new Date().toISOString(),
      },
    }),
    [banglaName, englishName, slug, location]
  );

  const validate = () => {
    if (!payload.banglaName) return "Company name in Bangla is required";
    if (!payload.englishName) return "Company name in English is required";
    return null;
  };

  const resetFields = () => {
    setBanglaName("");
    setEnglishName("");
    setLocation("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Saving company...");
    try {
      await addCompany(payload); // ✅ এখানে fakeSubmit এর জায়গায় real API call
      toast.success("Company saved!", { id: toastId });
      resetFields();
    } catch (err) {
      toast.error(err.message || "Something went wrong", { id: toastId });
    } finally {
      setSubmitting(false);
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
              <h1 className="m-0">Add Company</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item">
                  <NavLink to="/admin/companies/manage">Manage Company</NavLink>
                </li>
                <li className="breadcrumb-item active">Add Company</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="row justify-content-center">
              <div className="col-lg-8 col-12">
                <div className="card card-outline card-primary mb-3">
                  <div className="card-header">
                    <h3 className="card-title mb-0">Company Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="banglaName">
                          Company Name (Bangla){" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          id="banglaName"
                          type="text"
                          className="form-control"
                          placeholder="বাংলা নাম লিখুন"
                          value={banglaName}
                          onChange={(event) =>
                            setBanglaName(event.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label htmlFor="englishName">
                          Company Name (English){" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          id="englishName"
                          type="text"
                          className="form-control"
                          placeholder="Enter company name in English"
                          value={englishName}
                          onChange={(event) =>
                            setEnglishName(event.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <input
                        id="location"
                        type="text"
                        className="form-control"
                        placeholder="Enter company location (e.g., Dhaka, Bangladesh)"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="card card-outline card-success mt-3">
                  <div className="card-body">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 mb-2"
                      disabled={submitting}>
                      {submitting ? "Saving..." : "Save Company"}
                    </button>
                    <NavLink
                      to="/admin/companies/manage"
                      className="btn btn-outline-secondary w-100">
                      Manage Company
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
