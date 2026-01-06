import { useState } from "react";
import { baseApi } from "../../../api";
// import DeleteOutlineIcon from "@/assets/IconComponents/DeleteOutlineIcon";
// import BlockStrokeIcon from "@/assets/IconComponents/BlockStrokeIcon";
// import LoginArrowIcon from "@/assets/IconComponents/LoginArrowIcon";

export default function TableView({ items = [], onDelete }) {
  const [removing, setRemoving] = useState({});
  const [confirmUser, setConfirmUser] = useState(null);

  const performDelete = (id) => {
    setRemoving((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      onDelete?.(id);
      setRemoving((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 280);
  };

  // const handleDeleteClick = (user) => {
  //   setConfirmUser(user);
  // };

  const handleConfirmDelete = () => {
    if (confirmUser) {
      performDelete(confirmUser.id);
      setConfirmUser(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmUser(null);
  };

  if (!items.length) {
    return (
      <div className="card">
        <div className="card-body text-center text-muted py-4">
          No users found.
        </div>
      </div>
    );
  }
  console.log(items);

  return (
    <>
      <div className="manage-posts-grid admin-user-grid">
        {items.map((user) => (
          <article
            key={user.id}
            className={`manage-post-card admin-user-card ${
              removing[user.id] ? "is-removing" : ""
            }`}
            id={`deleteadminuserdiv_${user.id}`}>
            <header className="manage-post-header">
              <img
                src={
                  user.profileImage
                    ? user.profileImage.startsWith("http")
                      ? user.profileImage
                      : `${baseApi}${user.profileImage}`
                    : "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png"
                }
                alt={user.name || "profile image"}
                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              />
              <div className="manage-post-meta">
                <span className="manage-post-author">{user.name}</span>
                <span className="manage-post-username">@{user.handle}</span>
              </div>
              <span className="badge badge-light border user-index-badge">
                #{user.no}
              </span>
            </header>

            <div className="manage-post-body">
              <div className="admin-user-contact">
                <div className="admin-user-contact-item">
                  <span className="label">Email</span>
                  <span className="value">{user.email}</span>
                </div>
                <div className="admin-user-contact-item">
                  <span className="label">State</span>
                  <span className="value">{user.state}</span>
                </div>
                <div className="admin-user-contact-item">
                  <span className="label">Location</span>
                  <span className="value">{user.address}</span>
                </div>
                <div className="admin-user-contact-item">
                  <span className="label">Phone</span>
                  <span className="value">{user.phone}</span>
                </div>
              </div>
            </div>

            {/* <footer className="manage-post-footer admin-user-footer">
              <div className="admin-user-footer-meta">
                <span className="text-muted">User ID</span>
                <span className="font-weight-semibold">#{user.id}</span>
              </div>
              <div className="admin-user-actions btn-group">
                <button
                  type="button"
                  className="admin-icon-btn admin-login-btn"
                  onClick={() => onLogin?.(user.username)}
                  aria-label={`Login as ${user.name}`}
                  title="Login User">
                  <LoginArrowIcon />
                </button>
                <button
                  type="button"
                  className="admin-icon-btn admin-block-btn block_user_btn ub"
                  aria-label={`Block ${user.name}`}
                  title="Block User">
                  <BlockStrokeIcon />
                </button>
                <button
                  type="button"
                  className="admin-icon-btn admin-trash-btn"
                  onClick={() => handleDeleteClick(user)}
                  aria-label={`Delete ${user.name}`}
                  title="Delete User">
                  <DeleteOutlineIcon />
                </button>
              </div>
            </footer> */}
          </article>
        ))}
      </div>

      {confirmUser && (
        <div
          className="admin-modal-backdrop"
          role="presentation">
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-title"
            aria-describedby="admin-delete-description">
            <div className="admin-modal-header">
              <h5
                id="admin-delete-title"
                className="mb-0">
                Delete user
              </h5>
            </div>
            <div
              id="admin-delete-description"
              className="admin-modal-body">
              <p className="mb-2">
                Are you sure you want to delete{" "}
                <strong>{confirmUser.name}</strong>?
              </p>
              <p className="text-muted mb-0">
                This action cannot be undone. All access for this user will be
                removed immediately.
              </p>
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
