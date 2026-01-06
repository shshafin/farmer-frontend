/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { format } from "timeago.js";
import DeleteOutlineIcon from "@/assets/IconComponents/DeleteOutlineIcon";
import { LiquedLoader } from "@/components/loaders";
import Modal from "./Modal";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  useModalVideoController,
} from "@/hooks/useVideoVisibility";
import ExpandableText from "@/components/ui/ExpandableText";

// --- CONSTANTS ---
const LIKES_CHUNK = 12;
const TEXT_LOADING = "লোড হচ্ছে...";
const TEXT_LIKE_TOGGLE_ACTIVE = "লাইক করা হয়েছে";
const TEXT_LIKE_TOGGLE_INACTIVE = "লাইক";
const TEXT_LIKES_LABEL = "লাইক";
const TEXT_COMMENTS_LABEL = "মন্তব্য";
const TEXT_COMMENT_PLACEHOLDER = "এখানে মন্তব্য লিখুন...";
const TEXT_SUBMIT_COMMENT = "মন্তব্য করুন";
const TEXT_DELETE_COMMENT_ARIA = "মন্তব্য মুছুন";
const CLOSE_SYMBOL = "×";

export default function PostModal({
  open,
  post,
  mode,
  onClose,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  canDeleteComment,
  startIndex,
  initialSlideIndex = 0,
}) {
  const [commentText, setCommentText] = useState("");
  const [activeMode, setActiveMode] = useState(mode ?? "comments");
  const [carouselHeight, setCarouselHeight] = useState(null);
  const [likesPage, setLikesPage] = useState(1);

  const isPointerOverMediaRef = useRef(false);
  const isVideoPlayingRef = useRef(false);

  const effectiveStartIndex = Number.isFinite(startIndex)
    ? startIndex
    : initialSlideIndex;

  useEffect(() => {
    if (!open) return;
    setActiveMode(mode ?? "comments");
  }, [open, mode]);

  useModalVideoController(open);
  const videoRef = useRef(null);
  const textareaRef = useRef(null);
  const slideMediaRefs = useRef([]);
  const carouselViewportRef = useRef(null);
  const previousHashRef = useRef("");
  const historyPushedRef = useRef(false);

  const slides = useMemo(() => {
    if (!post) return [];
    const gallery = Array.isArray(post.mediaGallery)
      ? post.mediaGallery.filter((i) => i && i.src)
      : [];
    if (gallery.length > 0) return gallery;
    return post.media?.src ? [post.media] : [];
  }, [post]);

  const useCarousel = slides.length > 1;

  const autoplayPlugin = useMemo(
    () =>
      useCarousel
        ? Autoplay({
            delay: 4000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          })
        : null,
    [useCarousel]
  );

  const likedUsers = useMemo(
    () => (Array.isArray(post?.likedUsers) ? post.likedUsers.filter(Boolean) : []),
    [post]
  );

  useEffect(() => {
    if (!open) return;
    setLikesPage(1);
  }, [open, post?.id]);

  const visibleLikedUsers = useMemo(() => {
    const count = Math.max(0, likesPage * LIKES_CHUNK);
    return likedUsers.slice(0, count);
  }, [likedUsers, likesPage]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: useCarousel,
      startIndex: effectiveStartIndex,
      containScroll: "trimSnaps",
    },
    useCarousel && autoplayPlugin ? [autoplayPlugin] : []
  );

  const autoplayApi = useMemo(
    () => emblaApi?.plugins?.()?.autoplay ?? null,
    [emblaApi]
  );

  const pauseAutoplay = useCallback(() => {
    autoplayApi?.stop?.();
  }, [autoplayApi]);

  const resumeAutoplay = useCallback(() => {
    if (!autoplayApi) return;
    if (isPointerOverMediaRef.current) return;
    if (isVideoPlayingRef.current) return;
    autoplayApi.play?.();
  }, [autoplayApi]);

  const syncCarouselHeight = useCallback(() => {
    if (!emblaApi) return;
    if (!carouselViewportRef.current) return;

    const selectedIndex = emblaApi.selectedScrollSnap();
    const mediaEl = slideMediaRefs.current?.[selectedIndex] ?? null;
    if (!mediaEl) return;

    const viewportWidth = carouselViewportRef.current.clientWidth;
    if (!viewportWidth) return;

    const maxHeight = Math.round(window.innerHeight * 0.8);

    if (mediaEl instanceof HTMLImageElement) {
      const naturalWidth = mediaEl.naturalWidth;
      const naturalHeight = mediaEl.naturalHeight;
      if (naturalWidth && naturalHeight) {
        const ratio = naturalHeight / naturalWidth;
        const next = Math.max(1, Math.min(maxHeight, Math.round(viewportWidth * ratio)));
        setCarouselHeight((prev) => (prev === next ? prev : next));
        return;
      }
    }

    if (mediaEl instanceof HTMLVideoElement) {
      const videoWidth = mediaEl.videoWidth;
      const videoHeight = mediaEl.videoHeight;
      if (videoWidth && videoHeight) {
        const ratio = videoHeight / videoWidth;
        const next = Math.max(1, Math.min(maxHeight, Math.round(viewportWidth * ratio)));
        setCarouselHeight((prev) => (prev === next ? prev : next));
        return;
      }
    }

    const rect = mediaEl.getBoundingClientRect();
    if (rect?.height) {
      const next = Math.round(rect.height);
      setCarouselHeight((prev) => (prev === next ? prev : next));
    }
  }, [emblaApi]);

  const nativeBackHash = useMemo(() => {
    const base = "post-modal";
    if (!post?.id) return base;
    const safeId = String(post.id).replace(/[^a-zA-Z0-9-_]/g, "");
    return `${base}-${safeId || "item"}`;
  }, [post?.id]);

  useEffect(() => {
    if (open && emblaApi) {
      const clampedIndex = Math.max(
        0,
        Math.min(effectiveStartIndex, Math.max(slides.length - 1, 0))
      );
      emblaApi.reInit();
      emblaApi.scrollTo(clampedIndex, true);
      setTimeout(syncCarouselHeight, 150);
      emblaApi.on("select", syncCarouselHeight);
      emblaApi.on("reInit", syncCarouselHeight);
      window.addEventListener("resize", syncCarouselHeight);
      return () => {
        window.removeEventListener("resize", syncCarouselHeight);
        emblaApi.off("select", syncCarouselHeight);
        emblaApi.off("reInit", syncCarouselHeight);
      };
    }
  }, [open, emblaApi, effectiveStartIndex, slides.length, syncCarouselHeight]);

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

  useEffect(() => {
    if (!open) return;
    if (!useCarousel) return;
    if (!carouselViewportRef.current) return;

    const viewport = carouselViewportRef.current;

    const handlePointerEnter = () => {
      isPointerOverMediaRef.current = true;
      pauseAutoplay();
    };

    const handlePointerLeave = () => {
      isPointerOverMediaRef.current = false;
      resumeAutoplay();
    };

    const handlePointerDown = () => {
      isPointerOverMediaRef.current = true;
      pauseAutoplay();
    };

    const handlePointerUp = () => {
      isPointerOverMediaRef.current = false;
      resumeAutoplay();
    };

    viewport.addEventListener("pointerenter", handlePointerEnter);
    viewport.addEventListener("pointerleave", handlePointerLeave);
    viewport.addEventListener("pointerdown", handlePointerDown);
    viewport.addEventListener("pointerup", handlePointerUp);
    viewport.addEventListener("pointercancel", handlePointerUp);

    return () => {
      viewport.removeEventListener("pointerenter", handlePointerEnter);
      viewport.removeEventListener("pointerleave", handlePointerLeave);
      viewport.removeEventListener("pointerdown", handlePointerDown);
      viewport.removeEventListener("pointerup", handlePointerUp);
      viewport.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [open, useCarousel, pauseAutoplay, resumeAutoplay]);

  useEffect(() => {
    if (!open) return;

    const videos = slideMediaRefs.current.filter(
      (el) => el && el instanceof HTMLVideoElement
    );
    if (!videos.length) return;

    const handlePlay = () => {
      isVideoPlayingRef.current = true;
      pauseAutoplay();
    };

    const handlePauseOrEnd = () => {
      isVideoPlayingRef.current = false;
      resumeAutoplay();
    };

    videos.forEach((video) => {
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePauseOrEnd);
      video.addEventListener("ended", handlePauseOrEnd);
    });

    return () => {
      videos.forEach((video) => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePauseOrEnd);
        video.removeEventListener("ended", handlePauseOrEnd);
      });
    };
  }, [open, slides.length, pauseAutoplay, resumeAutoplay]);

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment?.(post.id, commentText.trim());
    setCommentText("");
  };

  if (!post) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      disableBodyPadding
      className="post-modal post-modal--top"
      backdropZIndex={2000}
      header={
        <div
          className="ka-modal-header"
          style={{ gap: "0.75rem" }}>
          <div
            style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
            <img
              src={
                post.author?.avatar ||
                `https://i.pravatar.cc/120?u=${post.author?.id || post.author?.name || "user"}`
              }
              alt={post.author.name}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <div style={{ fontWeight: 600, color: "#fff" }}>
                {post.author.name}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                {format(post.createdAt)}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="ka-modal-close"
            onClick={onClose}>
            {CLOSE_SYMBOL}
          </button>
        </div>
      }>
      <div className="post-modal-content">
        {/* MEDIA SECTION - Design from Fix Branch */}
        <div
          className={`post-modal-media ${
            useCarousel ? "post-modal-media--carousel" : ""
          }`}>
          <div className="post-modal-carousel">
            <div
              className="post-modal-carousel__viewport"
              ref={(node) => {
                carouselViewportRef.current = node;
                emblaRef(node);
              }}
              style={
                carouselHeight
                  ? {
                      height: `${carouselHeight}px`,
                      transition: "height 180ms ease",
                    }
                  : undefined
              }>
              <div className="post-modal-carousel__container">
                {slides.map((item, index) => (
                  <div
                    className="post-modal-carousel__slide"
                    key={index}>
                    {item.type === "video" ? (
                      <video
                        src={item.src}
                        controls
                        loop
                        playsInline
                        ref={(node) => {
                          videoRef.current = node;
                          if (node) slideMediaRefs.current[index] = node;
                        }}
                        onLoadedMetadata={() => {
                          if (!emblaApi) return;
                          if (emblaApi.selectedScrollSnap() === index) {
                            syncCarouselHeight();
                          }
                        }}
                        style={{
                          width: "auto",
                          height: "auto",
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          touchAction: "pan-y",
                        }}
                      />
                    ) : (
                      <img
                        src={item.src}
                        ref={(node) => {
                          if (node) slideMediaRefs.current[index] = node;
                        }}
                        onLoad={() => {
                          if (!emblaApi) return;
                          if (emblaApi.selectedScrollSnap() === index) {
                            syncCarouselHeight();
                          }
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* INFO SECTION - Fixed Design Structure */}
        <section>
          <div className="post-modal-comments">
            {post.content && (
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                }}>
                <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
                  {post.author.name}
                </div>
                <ExpandableText text={post.content} />
              </div>
            )}

            <div
              className="post-engagement"
              style={{ marginTop: "0.25rem", gap: "0.5rem", display: "flex" }}>
              <button
                type="button"
                className={post.liked ? "liked" : ""}
                onClick={() => onToggleLike?.(post.id)}>
                {post.liked ? TEXT_LIKE_TOGGLE_ACTIVE : TEXT_LIKE_TOGGLE_INACTIVE}
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("likes")}> 
                {post.likes} {TEXT_LIKES_LABEL}
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("comments")}>
                {post.comments.length} {TEXT_COMMENTS_LABEL}
              </button>
            </div>

            {activeMode === "likes" ? (
              <div
                className="comment-list"
                style={{ marginTop: "1rem" }}>
                {visibleLikedUsers.length ? (
                  visibleLikedUsers.map((user, idx) => (
                    <div
                      key={`${user?.id ?? user?.username ?? "u"}-${idx}`}
                      className="comment-item">
                      <img
                        src={user?.avatar}
                        alt={user?.name || user?.username || "User"}
                        className="comment-item-avatar"
                      />
                      <div
                        className="comment-item-body"
                        style={{ flex: 1 }}>
                        <h6 style={{ margin: 0 }}>
                          {user?.name || user?.username || "User"}
                        </h6>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">এখনো কোনো লাইক নেই</div>
                )}

                {likedUsers.length > visibleLikedUsers.length && (
                  <button
                    type="button"
                    onClick={() => setLikesPage((p) => p + 1)}
                    style={{ width: "100%", marginTop: "0.75rem" }}>
                    আরও দেখুন
                  </button>
                )}
              </div>
            ) : (
              <div
                className="comment-list"
                style={{ marginTop: "1rem" }}>
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="comment-item">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="comment-item-avatar"
                    />
                    <div
                      className="comment-item-body"
                      style={{ flex: 1 }}>
                      <h6 style={{ margin: 0 }}>{comment.author.name}</h6>
                      <p
                        style={{
                          margin: "4px 0",
                          fontSize: "0.9rem",
                          color: "#cbd5e1",
                        }}>
                        {comment.text}
                      </p>
                      <div
                        className="comment-item-meta"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {format(comment.createdAt)}
                        </span>
                        {canDeleteComment?.(comment) && (
                          <button
                            type="button"
                            className="comment-delete-btn"
                            onClick={() =>
                              onDeleteComment?.(post.id, comment.id)
                            }>
                            <DeleteOutlineIcon width={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COMMENT INPUT - Or's Style */}
          <div className="comment-input-area">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={TEXT_COMMENT_PLACEHOLDER}
              style={{ width: "100%", minHeight: "44px" }}
            />
            <button
              type="button"
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}>
              {TEXT_SUBMIT_COMMENT}
            </button>
          </div>
        </section>
      </div>
    </Modal>
  );
}
