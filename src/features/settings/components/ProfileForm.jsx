import "../styles/common.css";
import "../styles/Forms.css";
import UserIcon from "@/assets/IconComponents/UserIcon";
import GlobeIcon from "@/assets/IconComponents/GlobeIcon";
import PhoneIcon from "@/assets/IconComponents/PhoneIcon";
import MapPinIcon from "@/assets/IconComponents/MapPinIcon";
import LockIcon from "@/assets/IconComponents/LockIcon";
import SaveIcon from "@/assets/IconComponents/SaveIcon";
import EyeIcon from "@/assets/IconComponents/Eye.jsx";
import EyeOffIcon from "@/assets/IconComponents/EyeOff.jsx";

export default function ProfileForm({
  values = {},
  onChange = () => {},
  onSubmit = (e) => e.preventDefault(),
  passwordValue = "",
  onPasswordChange = () => {},
  isPasswordVisible = false,
  onTogglePasswordVisibility = () => {},
  isSubmitting = false,
}) {
  const safeValues = values || {};

  const {
    name = "",
    username = "",
    bio = "",
    phone = "",
    address = "",
  } = safeValues;

  const passwordToggleLabel = isPasswordVisible ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন";

  return (
    <section className="card">
      <div className="section-title">
        <UserIcon /> প্রোফাইল তথ্য
      </div>

      <form className="form-section" onSubmit={onSubmit}>
        <div className="form-stack">
          <div className="form-row">
            <label className="label">
              <UserIcon /> পুরো নাম
            </label>
            <input
              className="input"
              name="name"
              placeholder="আপনার পুরো নাম লিখুন"
              value={name}
              onChange={onChange}
            />
          </div>

          <div className="form-row">
            <label className="label">
              <UserIcon /> ইউজারনেম
            </label>
            <input
              className="input"
              name="username"
              required
              placeholder="একটি ইউজারনেম লিখুন"
              value={username}
              onChange={onChange}
            />
          </div>

          <div className="form-row">
            <label className="label">
              <GlobeIcon /> পরিচিতি
            </label>
            <textarea
              className="textarea"
              name="bio"
              rows={4}
              placeholder="নিজের সম্পর্কে কিছু লিখুন..."
              value={bio}
              onChange={onChange}
            />
          </div>

          <div className="form-row">
            <label className="label">
              <PhoneIcon /> ফোন নম্বর
            </label>
            <input
              className="input"
              name="phone"
              type="tel"
              placeholder="আপনার ফোন নম্বর লিখুন"
              value={phone}
              onChange={onChange}
            />
          </div>

          <div className="form-row">
            <label className="label">
              <MapPinIcon /> ঠিকানা
            </label>
            <input
              className="input"
              name="address"
              placeholder="আপনার ঠিকানা লিখুন"
              value={address}
              onChange={onChange}
            />
          </div>

          <div className="form-row">
            <label className="label">
              <LockIcon /> পাসওয়ার্ড
            </label>
            <div className="password-input-wrapper">
              <input
                className="input"
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                placeholder="পরিবর্তন সংরক্ষণের জন্য পাসওয়ার্ড লিখুন"
                value={passwordValue}
                onChange={onPasswordChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={onTogglePasswordVisibility}
                aria-label={passwordToggleLabel}>
                {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}>
            <SaveIcon />
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </div>
      </form>
    </section>
  );
}

