import "../styles/common.css";
import "../styles/Forms.css";
import LockIcon from "@/assets/IconComponents/LockIcon";
import EyeIcon from "@/assets/IconComponents/Eye";
import EyeOffIcon from "@/assets/IconComponents/EyeOff";
import { useState } from "react";

export default function PasswordForm({ onSubmit = (e) => e.preventDefault() }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <section className="card">
      <div className="section-title">
        <LockIcon
          className="icon"
          style={{ color: "var(--danger)" }}
        />
        Change Password
      </div>

      <form
        className="form-section"
        onSubmit={onSubmit}>
        <div className="form-stack">
          <div className="form-row input-icon">
            <label className="label">
              <LockIcon /> Current Password
            </label>
            <input
              type={showCurrent ? "text" : "password"}
              className="input"
              name="oldPassword" // <-- changed
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              className="suffix"
              onClick={() => setShowCurrent((s) => !s)}
              aria-label="Toggle current password visibility">
              {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="form-row input-icon">
            <label className="label">
              <LockIcon /> New Password
            </label>
            <input
              type={showNew ? "text" : "password"}
              className="input"
              name="newPassword" // <-- correct
              placeholder="Enter new password (min 6 characters)"
              minLength={6}
              required
            />
            <button
              type="button"
              className="suffix"
              onClick={() => setShowNew((s) => !s)}
              aria-label="Toggle new password visibility">
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="form-row input-icon">
            <label className="label">
              <LockIcon /> Confirm New Password
            </label>
            <input
              type={showConfirm ? "text" : "password"}
              className="input"
              name="confirmPassword"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              className="suffix"
              onClick={() => setShowConfirm((s) => !s)}
              aria-label="Toggle confirm password visibility">
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="form-footer">
            <button
              className="btn change-pass btn-primary"
              type="submit">
              <LockIcon /> Change Password
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
