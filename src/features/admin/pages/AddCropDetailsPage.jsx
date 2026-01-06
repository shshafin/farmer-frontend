/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { addCropDetails, fetchAllCrops } from "../../../api/authApi";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB

export default function AddCropDetailsPage() {
  const [category, setCategory] = useState("");
  const [cropTitle, setCropTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [sections, setSections] = useState({ symptoms: "", actions: "" });
  const [submitting, setSubmitting] = useState(false);
  const [cropOptions, setCropOptions] = useState([]);

  // Fetch categories dynamically
  useEffect(() => {
    const getCrops = async () => {
      try {
        const res = await fetchAllCrops();
        // assuming res is an array of { banglaName, englishName, categoryType }
        const options = res.data.map((crop) => ({
          value: crop._id, // <-- ObjectId
          label: `${crop.banglaName} - ${crop.category}`,
        }));

        setCropOptions(options);
      } catch (err) {
        toast.error("Failed to load crop categories");
      }
    };
    getCrops();
  }, []);

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile]
  );

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const validate = () => {
    if (!category) return "Please select a crop category";
    if (!cropTitle.trim()) return "Crop title is required";
    if (!imageFile) return "Please select an image";
    if (imageFile.size > 8 * 1024 * 1024) return `Image exceeds 8MB`;
    return null;
  };

  const resetForm = () => {
    setCategory("");
    setCropTitle("");
    setImageFile(null);
    setSections({ symptoms: "", actions: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const error = validate();
    if (error) return toast.error(error);

    setSubmitting(true);
    const toastId = toast.loading("Saving crop details...");

    try {
      const formData = new FormData();
      formData.append("cropTitle", cropTitle.trim());
      formData.append("cropImage", imageFile);
      formData.append("rogLokkho", sections.symptoms.trim());
      formData.append("koroniyo", sections.actions.trim());
      formData.append("category", category);

      await addCropDetails(formData);
      toast.success("Crop details saved!", { id: toastId });
      resetForm();
    } catch (err) {
      toast.error(err?.message || "Something went wrong", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const updateSection = (key, value) =>
    setSections((prev) => ({ ...prev, [key]: value }));

  return (
    <div
      className="content-wrapper _scoped_admin"
      style={{ minHeight: "839px" }}>
      <Toaster position="top-right" />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Add Crop Details</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item">
                  <NavLink to="/admin/crops/manage-details">
                    Manage Crop Details
                  </NavLink>
                </li>
                <li className="breadcrumb-item active">Add Crop Details</li>
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
                    <h3 className="card-title mb-0">Primary Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="category">
                        Crop Category <span className="text-danger">*</span>
                      </label>
                      <select
                        id="category"
                        className="form-control"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required>
                        <option
                          value=""
                          hidden>
                          Select crop category
                        </option>
                        {cropOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="cropTitle">
                          Crop Title <span className="text-danger">*</span>
                        </label>
                        <input
                          id="cropTitle"
                          type="text"
                          className="form-control"
                          placeholder="Headline for this entry"
                          value={cropTitle}
                          onChange={(e) => setCropTitle(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-outline card-info mb-3">
                  <div className="card-header">
                    <h3 className="card-title mb-0">Crop Media</h3>
                  </div>
                  <div className="card-body">
                    <div className="custom-file">
                      <input
                        id="cropImage"
                        type="file"
                        accept="image/*"
                        className="custom-file-input"
                        onChange={(event) =>
                          setImageFile(event.target.files?.[0] || null)
                        }
                      />
                      <label
                        className="custom-file-label"
                        htmlFor="cropImage">
                        {imageFile ? imageFile.name : "Choose crop image"}
                      </label>
                    </div>
                    <small className="form-text text-muted">
                      PNG or JPG up to{" "}
                      {Math.round(MAX_IMAGE_SIZE / (1024 * 1024))} MB.
                    </small>
                    {imagePreview && (
                      <div className="mt-3">
                        <img
                          src={imagePreview}
                          alt="Crop preview"
                          className="img-fluid rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="card card-outline card-success">
                  <div className="card-header">
                    <h3 className="card-title mb-0">Detailed Guidance</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="symptoms">রোগের লক্ষণ</label>
                      <textarea
                        id="symptoms"
                        className="form-control"
                        rows={4}
                        placeholder="লক্ষণগুলো বিস্তারিত লিখুন"
                        value={sections.symptoms}
                        onChange={(e) =>
                          updateSection("symptoms", e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label htmlFor="actions">করনীয়</label>
                      <textarea
                        id="actions"
                        className="form-control"
                        rows={4}
                        placeholder="প্রস্তাবিত পদক্ষেপ ও কৃষি পরামর্শ"
                        value={sections.actions}
                        onChange={(e) =>
                          updateSection("actions", e.target.value)
                        }
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
                      {submitting ? "Saving..." : "Save Details"}
                    </button>
                    <NavLink
                      to="/admin/crops/manage-details"
                      className="btn btn-outline-secondary w-100">
                      Manage Crop Details
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
