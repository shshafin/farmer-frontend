import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import UploadCloudIcon from "../../../assets/IconComponents/UploadCloudIcon";
import { addGalleries } from "../../../api/authApi"; // ✅ API Import

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export default function AddPhotosPage() {
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const onPickFiles = () => fileInputRef.current?.click();

  const handleIncomingFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG or JPG).");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`"${file.name}" is larger than 10MB.`);
      return;
    }
    setPhoto(file);
  }, []);

  const onFilesSelected = useCallback(
    (event) => {
      const list = Array.from(event.target.files || []);
      if (list.length) {
        const firstImage =
          list.find((file) => file.type.startsWith("image/")) || list[0];
        handleIncomingFile(firstImage);
      }
      event.target.value = "";
    },
    [handleIncomingFile]
  );

  useEffect(() => {
    if (!photo) {
      setPreviewUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const removePhoto = useCallback(() => {
    setPhoto(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const validate = () => {
    if (!photo) return "Please add an image";
    if (photo.size > MAX_FILE_SIZE)
      return `File "${photo.name}" is larger than 10MB`;
    if (!photo.type.startsWith("image/"))
      return "Only image files are supported";
    return null;
  };

  const formattedSize = useMemo(
    () => (photo ? formatFileSize(photo.size) : ""),
    [photo]
  );

  // ✅ Submit Handler - REAL API Connected
  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);

    const toastId = toast.loading("Uploading photo...");

    // 🔥 Create FormData
    const formData = new FormData();
    formData.append("description", description);
    formData.append("visibility", isPublic ? "public" : "private");
    formData.append("image", photo); // backend এ যে ফিল্ড দরকার সেটাই দিবে

    try {
      await addGalleries(formData);
      toast.success("Photo uploaded successfully!", { id: toastId });
      setDescription("");
      setIsPublic(true);
      removePhoto();
    } catch (error) {
      toast.error(error?.message || "Upload failed!", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="content-wrapper _scoped_admin add-photo-page"
      style={{ minHeight: "839px" }}>
      <Toaster position="top-right" />
      <div className="content-header add-photo-header">
        <div className="container-fluid">
          <div className="add-photo-header-inner">
            <div className="add-photo-header-copy">
              <h1 className="add-photo-heading">Upload Gallery Photo</h1>
              <p className="add-photo-subheading">
                Center stage your best work with a single, high-quality image.
              </p>
            </div>
            <ol className="breadcrumb add-photo-breadcrumbs">
              <li className="breadcrumb-item">
                <NavLink to="/admin/dashboard">Dashboard</NavLink>
              </li>
              <li className="breadcrumb-item">
                <NavLink to="/admin/media/manage-gallery-photo">
                  Galleries
                </NavLink>
              </li>
              <li className="breadcrumb-item active">Add photo</li>
            </ol>
          </div>
        </div>
      </div>

      <section className="content add-photo-content">
        <div className="add-photo-shell">
          <form
            className="add-photo-form"
            onSubmit={onSubmit}>
            <div className="add-photo-card">
              <div className="add-photo-card-body">
                {/* Description Field */}
                <div className="add-photo-field">
                  <label htmlFor="description">Photo description</label>
                  <p className="add-photo-field-helper">
                    Tell visitors what makes this image special.
                  </p>
                  <textarea
                    id="description"
                    className="add-photo-input"
                    rows={4}
                    placeholder="Write a short description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Drag & Drop Zone */}
                <div
                  className={`add-photo-dropzone ${photo ? "has-photo" : ""}`}
                  onDragEnter={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    handleIncomingFile(file);
                  }}>
                  <UploadCloudIcon
                    size={64}
                    className="add-photo-icon"
                  />
                  <p className="add-photo-drop-title">Drag & drop your photo</p>
                  <p className="add-photo-drop-subtitle">
                    PNG or JPG, up to 10MB
                  </p>
                  <button
                    type="button"
                    className="add-photo-secondary"
                    onClick={onPickFiles}>
                    Browse files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={onFilesSelected}
                  />
                </div>

                {/* Preview */}
                {photo && (
                  <div className="add-photo-preview-wrapper">
                    <div className="add-photo-preview">
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt={photo.name}
                        />
                      )}
                    </div>
                    <div className="add-photo-preview-meta">
                      <div className="add-photo-preview-info">
                        <span
                          className="add-photo-preview-name"
                          title={photo.name}>
                          {photo.name}
                        </span>
                        <span className="add-photo-preview-size">
                          {formattedSize}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="add-photo-remove"
                        onClick={removePhoto}>
                        Remove photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="add-photo-actions">
                <button
                  type="submit"
                  className="add-photo-submit"
                  disabled={submitting}>
                  {submitting ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
