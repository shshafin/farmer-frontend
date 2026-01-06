/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import SendIcon from "@/assets/IconComponents/SendIcon";
import styles from "@/assets/styles/CommentBox.module.css";
import { fetchMe } from "@/api/authApi"; // assume fetchMe returns logged-in user data
import { baseApi } from "@/api";

export default function CommentBox({
  placeholder = "Write a comment...",
  onSubmit,
  comments = [],
}) {
  const [value, setValue] = useState("");
  const [profileSrc, setProfileSrc] = useState(
    "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png"
  ); // default fallback
  const inputRef = useRef(null);

  useEffect(() => {
    // fetch current user profile
    fetchMe()
      .then((res) => {
        const user = res?.data;
        if (user?.profileImage) {
          setProfileSrc(
            user.profileImage.startsWith("http")
              ? user.profileImage
              : `${baseApi}${user.profileImage}`
          );
        }
      })
      .catch((err) => console.error("Failed to fetch user profile:", err));
  }, []);

  const trimmed = value.trim();
  const isDisabled = trimmed.length === 0;

  const handleSubmit = () => {
    if (isDisabled) return;
    if (typeof onSubmit === "function") onSubmit(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={styles["comment-box"]}
      role="form"
      aria-label="Comment form">
      <span className={styles.avatar}>
        <img
          src={profileSrc}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      </span>

      <div className={styles["input-wrap"]}>
        <input
          ref={inputRef}
          className={styles["comment-input"]}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Write a comment"
        />
        <button
          type="button"
          className={styles["send-btn"]}
          onClick={handleSubmit}
          disabled={isDisabled}
          aria-label="Send comment"
          title="Send">
          <SendIcon
            className={styles["send-icon"]}
            aria-hidden="true"
            style={{ color: "#d2d9e2ff" }}
          />
        </button>
      </div>
    </div>
  );
}
