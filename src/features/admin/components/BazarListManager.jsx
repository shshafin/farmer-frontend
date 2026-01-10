import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import SearchIcon from "@/assets/IconComponents/SearchIcon";
import DeleteBadgeIcon from "@/assets/IconComponents/DeleteBadgeIcon";
import LocationPinIcon from "@/assets/IconComponents/LocationPinIcon";
import { baseApi } from "../../../api";

const timeFormatter = new Intl.DateTimeFormat("bn-BD", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const dateFormatter = new Intl.DateTimeFormat("bn-BD", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "সময় জানা যায়নি";
  const time = timeFormatter.format(date);
  const formattedDate = dateFormatter.format(date);
  return `${time} · ${formattedDate}`;
};

const normalizeEntry = (entry, index) => {
  if (!entry || typeof entry !== "object") return null;
  return {
    id: entry.id ?? index + 1,
    userId: entry.userId ?? 0,
    title: entry.title ?? "",
    description: entry.description ?? "",
    imageUrl: `${baseApi}${entry.imageUrl}`,
    recordedAt: entry.recordedAt ?? new Date().toISOString(),
    metadata: Array.isArray(entry.metadata)
      ? entry.metadata.filter(
          (item) => item && typeof item === "object" && item.label && item.value
        )
      : [],
  };
};

const defaultDeleteToast = (entry) => `Entry #${entry.id} deleted.`;
const defaultConfirmTitle = "Delete entry?";
const defaultConfirmBody = (entry) =>
  `Are you sure you want to delete entry #${entry.id}?`;
const defaultSearchPlaceholder = "Search entries";
const defaultEmptyMessage = "No entries available.";

export default function BazarListManager({
  title,
  description,
  breadcrumb = [],
  totalLabel = "Total Entries",
  entries = [],
  searchPlaceholder = defaultSearchPlaceholder,
  emptyMessage = defaultEmptyMessage,
  confirmTitle = defaultConfirmTitle,
  confirmBody = defaultConfirmBody,
  deleteToastMessage = defaultDeleteToast,
}) {
  const [items, setItems] = useState(() =>
    entries.map(normalizeEntry).filter(Boolean)
  );
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState({});
  const [confirmEntry, setConfirmEntry] = useState(null);

  useEffect(() => {
    setItems(entries.map(normalizeEntry).filter(Boolean));
  }, [entries]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      const baseFields = [item.title, item.description, String(item.userId)];
      const metadataFields = item.metadata.map(
        (meta) => `${meta.label} ${meta.value}`
      );
      return [...baseFields, ...metadataFields]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [items, search]);

  const handleDelete = (entry) => setConfirmEntry(entry);

  const deleteEntry = (entry) => {
    setRemoving((prev) => ({ ...prev, [entry.id]: true }));
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== entry.id));
      setRemoving((prev) => {
        const next = { ...prev };
        delete next[entry.id];
        return next;
      });
      toast.success(deleteToastMessage(entry));
    }, 280);
  };

  const handleConfirmDelete = () => {
    if (!confirmEntry) return;
    deleteEntry(confirmEntry);
    setConfirmEntry(null);
  };

  const handleCancelDelete = () => setConfirmEntry(null);

  return (
    <div
      className="content-wrapper _scoped_admin manage-gallery-page"
      style={{ minHeight: "839px" }}>
      <Toaster position="top-right" />

      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0">{title}</h1>
              {description ? (
                <p className="text-muted mt-1 mb-0">{description}</p>
              ) : null}
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                {breadcrumb.map(({ to, label }, index) => {
                  const isLast = index === breadcrumb.length - 1;
                  if (!isLast && to) {
                    return (
                      <li
                        className="breadcrumb-item"
                        key={label}>
                        <NavLink to={to}>{label}</NavLink>
                      </li>
                    );
                  }
                  return (
                    <li
                      className={`breadcrumb-item${isLast ? " active" : ""}`}
                      aria-current={isLast ? "page" : undefined}
                      key={label}>
                      {label}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card w-100">
            <div className="card-header d-flex flex-column flex-md-row gap-3 justify-content-md-between align-items-md-center">
              <h3 className="card-title mb-0">
                {totalLabel} [{items.length}]
              </h3>
              <div
                className="input-group"
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
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="card-body">
              {filtered.length ? (
                <div className="manage-gallery-grid">
                  {filtered.map((entry) => (
                    <article
                      key={entry.id}
                      className={`manage-gallery-card ${
                        removing[entry.id] ? "is-removing" : ""
                      }`}>
                      <div className="manage-gallery-thumb">
                        <img
                          src={entry.imageUrl}
                          alt={`${entry.title || "Bazar entry"} ${entry.id}`}
                        />
                      </div>
                      <div className="manage-gallery-body">
                        <p className="manage-gallery-description">
                          {entry.description || "No description provided."}
                        </p>
                      </div>
                      <footer className="manage-gallery-footer">
                        <div className="manage-gallery-info">
                          <span className="manage-gallery-time">
                            {formatTimestamp(entry.recordedAt)}
                          </span>
                          {entry.metadata.map(({ label, value }) => {
                            const isLocation =
                              label.toLowerCase() === "location";
                            return (
                              <div
                                key={`${entry.id}-${label}`}
                                className={`manage-gallery-metadata${
                                  isLocation
                                    ? " manage-gallery-metadata--location"
                                    : ""
                                }`}>
                                {isLocation ? (
                                  <>
                                    <LocationPinIcon
                                      width={16}
                                      height={16}
                                      color="#3c95ff"
                                      className="manage-gallery-location-icon"
                                      aria-label="Location"
                                    />
                                    <span className="manage-gallery-location-text">
                                      {value}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="manage-gallery-label">
                                      {label}
                                    </span>
                                    <span className="manage-gallery-uploader">
                                      {value}
                                    </span>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="manage-gallery-actions">
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--delete manage-gallery-delete"
                            onClick={() => handleDelete(entry)}
                            aria-label={`Delete bazar entry ${entry.id}`}
                            disabled={Boolean(removing[entry.id])}>
                            <DeleteBadgeIcon size={28} />
                          </button>
                        </div>
                      </footer>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  {emptyMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {confirmEntry && (
        <div
          className="admin-modal-backdrop"
          role="presentation">
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bazar-delete-title"
            aria-describedby="bazar-delete-description">
            <div className="admin-modal-header">
              <h5
                id="bazar-delete-title"
                className="mb-0">
                {confirmTitle}
              </h5>
            </div>
            <div
              id="bazar-delete-description"
              className="admin-modal-body">
              <p className="mb-2">
                {typeof confirmBody === "function"
                  ? confirmBody(confirmEntry)
                  : confirmBody}
              </p>
              <p className="text-muted mb-0">This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleCancelDelete}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
