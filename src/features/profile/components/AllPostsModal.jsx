import PropTypes from "prop-types";
import { useEffect, useMemo, useRef } from "react";
import Modal from "./Modal";

export default function AllPostsModal({ open, onClose, posts, onSelect }) {
  const previousHashRef = useRef("");
  const historyPushedRef = useRef(false);

  const nativeBackHash = useMemo(() => {
    const base = "all-posts";
    return base;
  }, []);

  const mediaItems = (posts || []).flatMap((post) => {
    const gallery = Array.isArray(post?.mediaGallery) ? post.mediaGallery : [];
    if (!gallery.length) return [];
    return gallery
      .filter((item) => item && item.src)
      .map((item, index) => ({ post, item, index }));
  });

  useEffect(() => {
    if (!open) return undefined;
    if (!nativeBackHash) return undefined;

    previousHashRef.current = window.location.hash;
    const url = new URL(window.location.href);
    url.hash = nativeBackHash;
    window.history.pushState({ modal: nativeBackHash }, "", url);
    historyPushedRef.current = true;

    const handlePopState = () => {
      onClose?.();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (historyPushedRef.current) {
        const cleanupUrl = new URL(window.location.href);
        cleanupUrl.hash = previousHashRef.current || "";
        window.history.replaceState(window.history.state, "", cleanupUrl);
        historyPushedRef.current = false;
      }
    };
  }, [open, nativeBackHash, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="সবগুলো পোস্ট" size="lg">
      {mediaItems.length ? (
        <div className="all-posts-grid">
          {mediaItems.map(({ post, item, index }, idx) => (
            <button
              type="button"
              className="all-posts-item"
              key={`${post.id ?? "p"}-${idx}-${index}`}
              onClick={() => onSelect?.(post, index)}
            >
              {item.type === "video" ? (
                <video src={item.src} muted playsInline preload="metadata" />
              ) : (
                <img src={item.src} alt={post.content || "পোস্টের ছবি"} />
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">এখনো কোনো পোস্ট নেই</div>
      )}
    </Modal>
  );
}

AllPostsModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      mediaGallery: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.oneOf(["image", "video"]),
          src: PropTypes.string,
        })
      ),
      content: PropTypes.string,
    })
  ),
  onSelect: PropTypes.func,
};

AllPostsModal.defaultProps = {
  open: false,
  onClose: undefined,
  posts: [],
  onSelect: undefined,
};
