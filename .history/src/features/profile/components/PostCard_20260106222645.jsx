/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import ExpandableText from "@/components/ui/ExpandableText";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { format } from "timeago.js";
import DeleteOutlineIcon from "@/assets/IconComponents/DeleteOutlineIcon";
import { useVideoVisibility } from "@/hooks/useVideoVisibility";
import { baseApi } from "../../../api";

// --- CONFIG ---
const API_URL = baseApi || "http://localhost:5001";

const TEXT_LIKED = "লাইক করা হয়েছে";
const TEXT_LIKE = "লাইক";
const TEXT_COMMENTS = "মন্তব্য";
const TEXT_COMMENT = "মন্তব্য";
const TEXT_COMMENT_PLACEHOLDER = "মন্তব্য করুন...";
const TEXT_DELETE_POST_ARIA = "পোস্ট মুছে ফেলুন";
const TEXT_MEDIA_ALT = "পোস্টের ছবি";
const TEXT_LIKE_COUNT_SUFFIX = "লাইক";
const TEXT_COMMENT_COUNT_SUFFIX = "মন্তব্য";

// --- HELPERS (From Your Logic) ---
const ensureAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  return `${API_URL}/${cleanPath}`;
};

const formatTimeAgoBangla = (dateString) => {
  try {
    const timeStr = format(dateString);
    return timeStr
      .replace("just now", "এইমাত্র")
      .replace("right now", "এইমাত্র")
      .replace(/(\d+)\s+seconds? ago/, "$1 সেকেন্ড আগে")
      .replace(/(\d+)\s+minutes? ago/, "$1 মিনিট আগে")
      .replace(/(\d+)\s+hours? ago/, "$1 ঘণ্টা আগে")
      .replace(/(\d+)\s+days? ago/, "$1 দিন আগে")
      .replace(/(\d+)\s+weeks? ago/, "$1 সপ্তাহ আগে")
      .replace(/(\d+)\s+months? ago/, "$1 মাস আগে")
      .replace(/(\d+)\s+years? ago/, "$1 বছর আগে")
      .replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  } catch (e) {
    return "Time error";
  }
};

export default function PostCard({
  post,
  isOwner,
  onLike,
  onOpenLikes,
  onOpenComments,
  onDelete,
  onAddComment,
  onOpenPost,
}) {
  const [commentText, setCommentText] = useState("");
  const location = useLocation();
  const videoRef = useVideoVisibility({ threshold: 0.3, priority: "normal" });

  // --- DATA ADAPTATION (Your Logic Priority) ---
  const { normalizedGallery, displayAuthor } = useMemo(() => {
    let gallery = post.mediaGallery || [];
    if (!Array.isArray(gallery) || gallery.length === 0) {
      gallery = [];
      const rawVideos = Array.isArray(post.videos)
        ? post.videos
        : post.video
        ? [post.video]
        : [];
      const rawImages = Array.isArray(post.images)
        ? post.images
        : post.image
        ? [post.image]
        : [];

      rawVideos.forEach((v) => {
        const src = typeof v === "object" ? v.src || v.url : v;
        if (src) gallery.push({ type: "video", src: ensureAbsoluteUrl(src) });
      });
      rawImages.forEach((i) => {
        const src = typeof i === "object" ? i.src || i.url : i;
        if (src) gallery.push({ type: "image", src: ensureAbsoluteUrl(src) });
      });
    }

    const userObj = post.user || {};
    const authObj = post.author || {};
    const realName =
      authObj.name ||
      userObj.name ||
      authObj.fullName ||
      authObj.username ||
      userObj.username ||
      "Unknown";
    const userId = authObj.id || authObj._id || userObj._id || userObj.id;
    const avatarRaw =
      authObj.avatar ||
      authObj.profileImage ||
      userObj.profileImage ||
      userObj.avatar;
    const avatar = avatarRaw
      ? ensureAbsoluteUrl(avatarRaw)
      : `https://i.pravatar.cc/120?u=${userId}`;

    return {
      normalizedGallery: gallery,
      displayAuthor: { id: userId, name: realName, avatar },
    };
  }, [post]);

  const showDeleteButton = Boolean(
    isOwner && location?.pathname?.startsWith("/me")
  );

  const submitComment = () => {
    const value = commentText.trim();
    if (!value) return;
    onAddComment?.(post.id, value);
    setCommentText("");
  };

  // Gallery Helpers (Or's Design Logic)
  const totalGalleryItems = normalizedGallery.length;
  const extraImageCount = totalGalleryItems > 4 ? totalGalleryItems - 4 : 0;
  const visibleGallery = normalizedGallery.slice(0, 4);

  return (
    <article
      className="post-card"
      style={{ position: "relative", pointerEvents: "auto", zIndex: 1 }}>
      {/* HEADER */}
      <header className="post-card-header">
        <NavLink
          to={`/user/${displayAuthor.id}`}
          className="post-card-meta">
          <img
            src={displayAuthor.avatar}
            alt={displayAuthor.name}
            style={{ objectFit: "cover" }}
          />
          <div className="post-card-author">
            <h5>{displayAuthor.name}</h5>
            <span>{formatTimeAgoBangla(post.createdAt)}</span>
          </div>
        </NavLink>
        {showDeleteButton && (
          <button
            type="button"
            className="post-delete-btn"
            aria-label={TEXT_DELETE_POST_ARIA}
            onClick={() => onDelete?.(post.id)}>
            <DeleteOutlineIcon width={16} />
          </button>
        )}
      </header>

      {/* CONTENT */}
      {post.content && (
        <div className="post-content">
          <ExpandableText text={post.content} />
        </div>
      )}

      {/* MEDIA GALLERY (Or's Grid Design for Gap Fix) */}
      {totalGalleryItems > 0 && (
        <div
          className={`post-media ${
            totalGalleryItems > 1 ? "post-media--has-gallery" : ""
          }`}
          onClick={() => onOpenPost?.(post.id, 0)}
          style={{ cursor: "pointer" }}>
          <div
            className={`post-media-grid count-${Math.min(
              totalGalleryItems,
              4
            )}`}>
            {visibleGallery.map((item, index) => {
              const isOverflowItem = extraImageCount > 0 && index === 3;
              return (
                <div
                  key={index}
                  className={`post-media-grid-item ${
                    isOverflowItem ? "post-media-grid-item--more" : ""
                  }`}
                  style={{ backgroundColor: "#000", position: "relative" }}>
                  {item.type === "video" ? (
                    <video
                      ref={index === 0 ? videoRef : null}
                      src={item.src}
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={TEXT_MEDIA_ALT}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPost?.(post.id, index);
                      }}
                    />
                  )}

                  {isOverflowItem && (
                    <span className="post-media-grid-more-label">
                      +{extraImageCount}
                    </span>
                  )}
                  {item.type === "video" && !isOverflowItem && (
                    <div
                      className="video-play-icon"
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        fontSize: "24px",
                      }}>
                      ▶
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ENGAGEMENT */}
      <div className="post-engagement">
        <button
          type="button"
          onClick={() =>
            onOpenLikes?.(post.id)
          }>{`${post.likes} ${TEXT_LIKE_COUNT_SUFFIX}`}</button>
        <button
          type="button"
          onClick={() =>
            onOpenComments?.(post.id)
          }>{`${post.comments.length} ${TEXT_COMMENT_COUNT_SUFFIX}`}</button>
      </div>

      {/* ACTIONS */}
      <div
        className="post-actions"
        style={{ position: "relative", zIndex: 10 }}>
        <button
          type="button"
          className={post.liked ? "liked" : ""}
          onClick={() => onLike?.(post.id)}>
          {post.liked ? TEXT_LIKED : TEXT_LIKE}
        </button>
        <button
          type="button"
          onClick={() => onOpenComments?.(post.id)}>
          {TEXT_COMMENTS}
        </button>
      </div>

      {/* COMMENT FORM (Restored from your logic but visible) */}
      <div className="comment-form">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={TEXT_COMMENT_PLACEHOLDER}
        />
        <button
          type="button"
          onClick={submitComment}>
          {TEXT_COMMENT}
        </button>
      </div> //
    </article>
  );
}
