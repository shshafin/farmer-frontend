import { useState, useMemo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { formatTimeAgo } from "@/utils/timeAgo";
import { getUserDistrict, getUserName } from "@/utils/userDisplay";

import "@/assets/styles/Post.css";
import "@/assets/styles/ZoomInOutOff.css";

import MoreIcon from "@/assets/IconComponents/More";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import CommentBox from "../ui/CommentBox";
import ExpandableText from "../ui/ExpandableText";
import { baseApi } from "../../api";
import { likePost, commentOnPost } from "@/api/authApi";
import { Video, Zoom } from "yet-another-react-lightbox/plugins";
import { useVideoVisibility } from "../../hooks/useVideoVisibility";

export default function Post({
  post,
  currentUserId = null,
  onLikeClick = () => { },
  onLikesView = () => { },
  onCommentsView = () => { },
}) {
  const {
    _id,
    user,
    text = "",
    images = [],
    videos = [],
    likes = [],
    comments: initialComments = [],
    createdAt,
  } = post;

  const resolveId = (entity) =>
    entity?._id ?? entity?.id ?? entity?.userId ?? entity?.username ?? null;

  const hasUserLiked = useMemo(() => {
    if (!currentUserId) return false;
    return likes.some((like) => {
      if (typeof like === "string" || typeof like === "number") {
        return String(like) === String(currentUserId);
      }
      const likeId = resolveId(like);
      return likeId && String(likeId) === String(currentUserId);
    });
  }, [likes, currentUserId]);

  const [isLiked, setIsLiked] = useState(hasUserLiked);
  const [likesCount, setLikesCount] = useState(likes.length);
  const [comments, setComments] = useState(initialComments);
  const [openIndex, setOpenIndex] = useState(-1);

  // Video visibility hook for viewport-based play/pause with global coordination
  const videoRef = useVideoVisibility({ threshold: 0.3, priority: 'normal' });

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    setLikesCount(likes.length);
  }, [likes]);

  useEffect(() => {
    setIsLiked(hasUserLiked);
  }, [hasUserLiked]);

  const formattedTime = useMemo(() => formatTimeAgo(createdAt), [createdAt]);
  const displayName = useMemo(
    () => getUserName(user, "অজানা ব্যবহারকারী"),
    [user]
  );
  const displayDistrict = useMemo(() => getUserDistrict(user), [user]);

  const media = useMemo(() => [...images, ...videos], [images, videos]);

  const slides = useMemo(
    () =>
      media.map((url) => {
        // ensure full URL
        const fullUrl = url.startsWith("http") ? url : `${baseApi}${url}`;

        const isVideo = /\.(mp4|webm|ogg)$/i.test(fullUrl);
        if (isVideo) {
          return {
            type: "video",
            sources: [{ src: fullUrl, type: "video/mp4" }],
          };
        }
        return { src: fullUrl }; // image
      }),
    [media]
  );

  // Like / Unlike
  const handleLikeToggle = async () => {
    try {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount((prev) => {
        const next = newIsLiked ? prev + 1 : prev - 1;
        return next < 0 ? 0 : next;
      });
      await likePost(_id);
      onLikeClick(_id, newIsLiked);
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => {
        const next = isLiked ? prev + 1 : prev - 1;
        return next < 0 ? 0 : next;
      });
    }
  };

  // Comment Submission
  const handleCommentSubmit = async (commentText) => {
    if (!commentText.trim()) return;
    try {
      const res = await commentOnPost(_id, commentText);
      const newComment = res?.data || {
        text: commentText,
        user,
        createdAt: new Date(),
      };
      setComments((prev) => [...prev, newComment]);
      onCommentsView(_id);
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  return (
    <article className="post">
      {/* Header */}
      <header className="post-header flex FY-center F-space">
        <NavLink
          to={`/user/${user._id}`}
          className="flex profile-container">
          <div className="profile">
            <img
              src={
                user.profileImage
                  ? user.profileImage.startsWith("http") ||
                    user.profileImage.startsWith("blob:")
                    ? user.profileImage
                    : `${baseApi}${user.profileImage}`
                  : "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png"
              }
              alt={`${displayName} প্রোফাইল`}
              className="object-cover"
            />
          </div>
          <div className="info">
            <div className="name">{displayName}</div>
            {displayDistrict && (
              <div className="time">{displayDistrict}</div>
            )}
            <div className="time">{formattedTime}</div>
          </div>
        </NavLink>
        <div className="options flex F-center">
          <MoreIcon />
        </div>
      </header>

      {/* Main Content */}
      <section className="post-main">
        {text && (
          <div className="content">
            <ExpandableText text={text} />
          </div>
        )}


        <div className="media-content flex FY-center">
          {/* Media */}
          {media.map((url, index) => {
            const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
            return (
              <div
                key={`${_id}-${index}`}
                className="media-item cursor-pointer"
                onClick={() => setOpenIndex(index)}>
                {isVideo ? (
                  <video
                    ref={videoRef}
                    src={url.startsWith("http") ? url : `${baseApi}${url}`}
                    controls
                    muted
                    preload="metadata"
                    className="media-video"
                  />
                ) : (
                  <img
                    src={url.startsWith("http") ? url : `${baseApi}${url}`}
                    alt={`media-${index}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Interactions */}
        <footer className="interactions flex gap-4 mt-3">
          <button
            type="button"
            onClick={handleLikeToggle}
            className={`like-btn flex F-center ${isLiked ? "liked" : ""}`}>
            <span>{isLiked ? "Unlike" : "Like"}</span>
            {likesCount > 0 && (
              <span
                className="likes-count"
                onClick={(e) => {
                  e.stopPropagation();
                  onLikesView(_id);
                }}>
                ({likesCount})
              </span>
            )}
          </button>

          <button
            type="button"
            className="comment-btn flex F-center">
            <span>Comments</span>
            {comments.length > 0 && (
              <span
                className="comments-count"
                onClick={(e) => {
                  e.stopPropagation();
                  onCommentsView(_id);
                }}>
                ({comments.length})
              </span>
            )}
          </button>
        </footer>

        {/* Comments */}
        <section className="comment-section">
          <CommentBox
            onSubmit={handleCommentSubmit}
            profileSrc={user.profileImage}
          />
        </section>
      </section>

      {/* Lightbox */}
      <Lightbox
        open={openIndex >= 0}
        index={openIndex}
        close={() => setOpenIndex(-1)}
        slides={slides}
        plugins={[Video, Zoom]}
        zoom={{ maxZoomPixelRatio: 4, wheelZoomDistanceFactor: 100 }}
      />
    </article>
  );
}
