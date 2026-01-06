import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import { baseApi } from "../../../api";

const ACCEPTED_MEDIA =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
const MAX_ATTACHMENTS = 6;
const DEFAULT_AVATAR =
  "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png";

const formatSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1
  );
  const value = bytes / 1024 ** i;
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${sizes[i]}`;
};

const deriveAvatar = (viewer) =>
  viewer?.avatar || viewer?.profileImage || viewer?.profile || DEFAULT_AVATAR;

const createAttachment = (file) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  file,
  name: file.name,
  size: formatSize(file.size),
  type: file.type.startsWith("video/") ? "video" : "image",
  previewUrl: URL.createObjectURL(file),
});

export default function PostComposerModal({
  open,
  mode,
  onClose,
  onSubmit,
  viewer,
  maxAttachments = MAX_ATTACHMENTS,
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Reset composer state when closing
  useEffect(() => {
    if (!open) {
      attachments.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setText("");
      setAttachments([]);
      setSubmitting(false);
      return;
    }

    const autoOpenTimeout = setTimeout(() => {
      if (mode !== "text" && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 120);

    return () => clearTimeout(autoOpenTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mediaSummary = useMemo(() => {
    const imageCount = attachments.filter(
      (item) => item.type === "image"
    ).length;
    const videoCount = attachments.filter(
      (item) => item.type === "video"
    ).length;
    return { total: attachments.length, imageCount, videoCount };
  }, [attachments]);

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) {
      event.target.value = "";
      return;
    }

    setAttachments((prev) => {
      if (prev.length >= maxAttachments) return prev;
      const remainingSlots = maxAttachments - prev.length;
      const nextFiles = selectedFiles
        .slice(0, remainingSlots)
        .map(createAttachment);
      return [...prev, ...nextFiles];
    });

    event.target.value = "";
  };

  const handleRemoveAttachment = (id) => {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClose = () => {
    attachments.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!text.trim() && attachments.length === 0) return;

    const payload = {
      text: text.trim(),
      attachments: attachments.map(({ file, type, name, size }) => ({
        file,
        type,
        name,
        size,
      })),
      mode,
    };

    try {
      setSubmitting(true);
      await onSubmit?.(payload);
      attachments.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setText("");
      setAttachments([]);
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  const headerTitle =
    mode === "video"
      ? "ভিডিও পোস্ট করুন.."
      : mode === "media"
      ? "ছবি / ভিডিও যুক্ত করুন"
      : "আপনি কী ভাবছেন?";

  const disableSubmit =
    submitting || (!text.trim() && attachments.length === 0);
  const viewerAvatar = deriveAvatar(viewer);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={headerTitle}
      size="lg"
      footer={
        <div className="composer-actions">
          <button
            type="button"
            className="secondary"
            onClick={handleClose}
            disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleSubmit}
            disabled={disableSubmit}>
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      }>
      <div className="composer-body">
        {viewer && (
          <div className="composer-viewer">
            <img
              src={viewerAvatar ? `${baseApi}${viewerAvatar}` : viewerAvatar}
              alt={viewer?.name ?? "Current user"}
            />

            <div>
              <div className="composer-viewer-name">
                {viewer?.name ?? "You"}
              </div>
              {viewer?.username && (
                <div className="composer-viewer-username">
                  @{viewer.username}
                </div>
              )}
            </div>
          </div>
        )}

        <textarea
          name="text"
          placeholder="Write something to share with everyone..."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <label className="composer-upload">
          <strong>মিডিয়া যুক্ত করুন</strong>
          <p style={{ marginTop: "0.35rem", color: "#64748b" }}>
            সমর্থিত ফরম্যাট: JPG, PNG, GIF, MP4, WEBM (সর্বোচ্চ {maxAttachments}{" "}
            ফাইল)
          </p>
          <input
            name="attachments"
            type="file"
            ref={fileInputRef}
            accept={ACCEPTED_MEDIA}
            multiple
            onChange={handleFilesChange}
            style={{ display: "none" }}
          />
        </label>

        {attachments.length > 0 && (
          <>
            <div className="composer-media-summary">
              <span>{mediaSummary.total} attachment(s)</span>
              <span>
                {mediaSummary.imageCount} image
                {mediaSummary.imageCount === 1 ? "" : "s"}
              </span>
              <span>
                {mediaSummary.videoCount} video
                {mediaSummary.videoCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="composer-media-grid">
              {attachments.map((item) => (
                <article
                  key={item.id}
                  className="composer-media-card">
                  <div className="composer-media-thumb">
                    {item.type === "video" ? (
                      <video
                        src={item.previewUrl}
                        controls
                        autoPlay
                      />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                      />
                    )}

                    <button
                      type="button"
                      className="composer-media-remove"
                      onClick={() => handleRemoveAttachment(item.id)}
                      aria-label={`Remove ${item.name}`}
                      disabled={submitting}>
                      ×
                    </button>

                    <span
                      className={`composer-media-badge composer-media-badge-${item.type}`}>
                      {item.type === "video" ? "Video" : "Image"}
                    </span>
                  </div>
                  <div className="composer-media-info">
                    <span
                      className="composer-media-name"
                      title={item.name}>
                      {item.name}
                    </span>
                    <span className="composer-media-size">{item.size}</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

PostComposerModal.propTypes = {
  open: PropTypes.bool,
  mode: PropTypes.oneOf(["text", "media", "video"]),
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  viewer: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string,
    avatar: PropTypes.string,
    profileImage: PropTypes.string,
    profile: PropTypes.string,
  }),
  maxAttachments: PropTypes.number,
};

PostComposerModal.defaultProps = {
  open: false,
  mode: "text",
  onClose: undefined,
  onSubmit: undefined,
  viewer: undefined,
  maxAttachments: MAX_ATTACHMENTS,
};
