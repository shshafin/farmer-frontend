import { baseApi } from "../../../api";
import "../styles/common.css";
import "../styles/ProfileDetails.css";
import CameraIcon from "@/assets/IconComponents/CameraIcon";

export default function ProfileCard({
  data,
  onChangePhoto,
  onChangeCover,
  showCover = true,
}) {
  const {
    profileImage,
    coverImage,
    name,
    email,
    username,
    followers = 0,
    following = 0,
    isOnline = true,
  } = data || {};

  return (
    <section className="card card-padding">
      {showCover && (
        <div className="cover-photo-wrap">
          <img
            src={
              coverImage
                ? coverImage.startsWith("http") ||
                  coverImage.startsWith("blob:")
                  ? coverImage
                  : `${baseApi}${coverImage}`
                : "/default-cover.png"
            }
            alt="কভার"
            className="cover-photo"
          />

          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            id="coverUpload"
            onChange={(e) => {
              if (!onChangeCover) return;
              if (e.target.files && e.target.files[0]) {
                onChangeCover(e.target.files[0]);
              }
            }}
          />
          {onChangeCover && (
            <button
              className="changeCover"
              aria-label="Change Cover Picture"
              onClick={() => document.getElementById("coverUpload").click()}
              type="button">
              <CameraIcon />
            </button>
          )}
        </div>
      )}

      <div className="header-block">
        <div className="profile-photo-wrap">
          <div className="largeProfile">
            <img
              src={
                profileImage
                  ? profileImage.startsWith("http") ||
                    profileImage.startsWith("blob:")
                    ? profileImage
                    : `${baseApi}${profileImage}`
                  : "/default-profile.png"
              }
              alt={`${username || "user"}'s profile`}
            />
          </div>

          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            id="profileUpload"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onChangePhoto(e.target.files[0]);
              }
            }}
          />

          <button
            className="changeProfile"
            aria-label="Change Profile Picture"
            onClick={() => document.getElementById("profileUpload").click()}
            type="button">
            <CameraIcon />
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "white" }}>
            {name || "—"}
          </h2>
          <p className="gray">{email || "—"}</p>
          <div className="username">@{username || "user"}</div>

          <div className="user-details mt-24">
            <div className="status-container">
              <div className="followers">
                <div
                  className="count"
                  style={{ color: "#3b82f6", fontWeight: 800 }}>
                  {followers}
                </div>
                <div className="text">অনুসারী</div>
              </div>
              <div className="followers">
                <div
                  className="count"
                  style={{ color: "#10b981", fontWeight: 800 }}>
                  {following}
                </div>
                <div className="text">অনুসরণ করছেন</div>
              </div>
              <div className="followers">
                <div className={`status ${isOnline ? "green" : "gray"}`}>●</div>
                <div className="text">{isOnline ? "অনলাইন" : "অফলাইন"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
