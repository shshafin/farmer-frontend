/* eslint-disable no-unused-vars */
import React, { useMemo, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { addCrops } from "../../../api/authApi"; // ✅ Import API

const CATEGORY_OPTIONS = [
  { value: "ক্ষতিকর পোকামাকড়", label: "ক্ষতিকর পোকামাকড়" },
  { value: "রোগবালাই", label: "রোগবালাই" },
];

const normalizeSlug = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .toLowerCase();

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function AddCropCategoryPage() {
  const [banglaName, setBanglaName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const slug = useMemo(() => {
    const base = englishName.trim() || banglaName.trim();
    return base ? normalizeSlug(base) : "";
  }, [banglaName, englishName]);

  const validate = () => {
    if (!banglaName.trim()) return "Bangla crop name is required";
    if (!englishName.trim()) return "English crop name is required";
    if (!category) return "Please select a crop category";
    if (!image) return "Please select an image";
    if (image.size > MAX_FILE_SIZE) return "Image size must be less than 10MB";
    return null;
  };

  const resetFields = () => {
    setBanglaName("");
    setEnglishName("");
    setCategory("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    const toastId = toast.loading("Saving crop category...");

    try {
      const formData = new FormData();
      formData.append("banglaName", banglaName.trim());
      formData.append("englishName", englishName.trim());
      formData.append("category", category);
      formData.append("image", image); // ✅ backend expects `image`

      await addCrops(formData);
      toast.success("Crop category saved!", { id: toastId });
      resetFields();
    } catch (err) {
      toast.error(err?.message || "Something went wrong", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be less than 10MB");
      return;
    }
    setImage(file);
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
              <h1 className="m-0">Add Crop Category</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item">
                  <NavLink to="/admin/crops/manage-category">
                    Manage Crop Category
                  </NavLink>
                </li>
                <li className="breadcrumb-item active">Add Crop Category</li>
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
                    <h3 className="card-title mb-0">Category Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="banglaName">
                          Crop Name (Bangla){" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          id="banglaName"
                          type="text"
                          className="form-control"
                          placeholder="বাংলা ফসলের নাম লিখুন"
                          value={banglaName}
                          onChange={(e) => setBanglaName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label htmlFor="englishName">
                          Crop Name (English){" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          id="englishName"
                          type="text"
                          className="form-control"
                          placeholder="Enter crop name in English"
                          value={englishName}
                          onChange={(e) => setEnglishName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="categoryType">
                          Crop Category <span className="text-danger">*</span>
                        </label>
                        <select
                          id="categoryType"
                          className="form-control"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required>
                          <option
                            value=""
                            hidden>
                            Select crop category
                          </option>
                          {CATEGORY_OPTIONS.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group col-md-6">
                        <label htmlFor="image">
                          Crop Image <span className="text-danger">*</span>
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card card-outline card-success mt-3">
                  <div className="card-body">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 mb-2"
                      disabled={submitting}>
                      {submitting ? "Saving..." : "Save Category"}
                    </button>
                    <NavLink
                      to="/admin/crops/manage-category"
                      className="btn btn-outline-secondary w-100">
                      Manage Crop Categories
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
