/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import PostCard from "@/features/profile/components/PostCard";
import PostModal from "@/features/profile/components/PostModal";
import { getUserName } from "@/utils/userDisplay";
import { toBanglaDigits } from "@/utils/timeAgo";
import {
  fetchPosts,
  fetchMe,
  likePost,
  commentOnPost,
  deleteComment,
  fetchSinglePost,
} from "@/api/authApi";
import { baseApi } from "../../../api";

// --- HELPERS ---
const ensureAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${baseApi}${url}`;
};

const resolveId = (entity) => {
  if (entity == null) return null;
  if (typeof entity === "string" || typeof entity === "number") return entity;
  return entity._id ?? entity.id ?? entity.userId ?? entity.username ?? null;
};

const sameId = (left, right) => {
  if (left == null || right == null) return false;
  return String(left).toLowerCase() === String(right).toLowerCase();
};

// --- FIX: UPDATED ADAPT USER TO PRIORITIZE NAME/FULLNAME ---
const adaptUser = (
  user,
  fallbackName = "\u0985\u099C\u09BE\u09A8\u09BE \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0"
) => {
  if (!user || typeof user !== "object") {
    return {
      id: fallbackName,
      name: fallbackName,
      username: undefined,
      avatar:
        "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png",
    };
  }
  const identifier = resolveId(user) ?? user.username ?? fallbackName;
  const avatarSource =
    ensureAbsoluteUrl(user.profileImage) ??
    ensureAbsoluteUrl(user.avatar) ??
    "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png";

  const displayName = getUserName(user, fallbackName);

  return {
    id: identifier,
    name: displayName,
    username: user.username,
    fullName: user.fullName,
    fullname: user.fullname,
    address: user.address,
    state: user.state,
    district: user.district,
    division: user.division,
    location: user.location,
    avatar: avatarSource,
  };
};

const adaptFeedPost = (rawPost, viewerId) => {
  const postId =
    resolveId(rawPost) ?? rawPost?._id ?? rawPost?.id ?? `post-${Date.now()}`;
  const author = adaptUser(
    rawPost?.user ?? rawPost?.author ?? {},
    "\u0985\u09A8\u09BE\u09AE\u09BE \u09B2\u09C7\u0996\u0995"
  );
  const getSrc = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    return item.url || item.src || item.path || null;
  };

  const validVideos = [];
  const rawVideosList = Array.isArray(rawPost.videos)
    ? [...rawPost.videos]
    : [];
  if (rawPost.video) rawVideosList.push(rawPost.video);
  if (rawPost.media?.video) rawVideosList.push(rawPost.media.video);
  rawVideosList.forEach((v) => {
    const src = ensureAbsoluteUrl(getSrc(v));
    if (src && !validVideos.find((existing) => existing.src === src)) {
      validVideos.push({ type: "video", src });
    }
  });

  const validImages = [];
  const rawImagesList = Array.isArray(rawPost.images)
    ? [...rawPost.images]
    : [];
  if (rawPost.image) rawImagesList.push(rawPost.image);
  if (rawPost.mediaUrl) rawImagesList.push(rawPost.mediaUrl);
  if (rawPost.coverPhoto) rawImagesList.push(rawPost.coverPhoto);
  if (rawPost.media?.images && Array.isArray(rawPost.media.images)) {
    rawImagesList.push(...rawPost.media.images);
  }
  const seenImages = new Set();
  rawImagesList.forEach((img) => {
    const src = ensureAbsoluteUrl(getSrc(img));
    if (src && !seenImages.has(src)) {
      seenImages.add(src);
      validImages.push({ type: "image", src });
    }
  });

  const mediaGallery = [...validVideos, ...validImages];
  const media = mediaGallery.length > 0 ? mediaGallery[0] : null;

  const likeEntries = Array.isArray(rawPost?.likes) ? rawPost.likes : [];
  const likedUsers = likeEntries.map((entry, index) =>
    adaptUser(
      typeof entry === "object"
        ? entry
        : { id: entry, username: String(entry) },
      `লাইককারী ${toBanglaDigits(index + 1)}`
    )
  );
  const liked = viewerId
    ? likedUsers.some((user) => {
        const identifier = resolveId(user) ?? user.username;
        return identifier ? sameId(identifier, viewerId) : false;
      })
    : false;

  const comments = Array.isArray(rawPost?.comments)
    ? rawPost.comments.map((comment, index) => {
        const authorInfo = adaptUser(
          comment?.user ?? comment?.author ?? {},
          `মন্তব্যকারী ${toBanglaDigits(index + 1)}`
        );
        return {
          id: comment._id.toString(),
          _id: comment._id.toString(),
          text: comment?.text ?? comment?.content ?? "",
          createdAt:
            comment?.createdAt ?? comment?.date ?? new Date().toISOString(),
          author: authorInfo,
        };
      })
    : [];

  return {
    id: postId,
    content:
      rawPost?.text ??
      rawPost?.content ??
      rawPost?.caption ??
      rawPost?.description ??
      "",
    createdAt: rawPost?.createdAt ?? new Date().toISOString(),
    media,
    mediaGallery,
    likes: likedUsers.length,
    liked,
    likedUsers,
    comments,
    author,
    raw: rawPost,
  };
};

export default function InfiniteFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const loaderRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePostId, setActivePostId] = useState(null);
  const [activeModalMode, setActiveModalMode] = useState("comments");
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const previousUrlPostId = useRef(null);
  const currentUserId = useMemo(() => resolveId(currentUser), [currentUser]);
  const viewerIdentity = useMemo(
    () => adaptUser(currentUser ?? {}, "আপনি"),
    [currentUser]
  );
  console.log("current User :--->", currentUser);
  const getChunkSize = useCallback(
    (pageNumber) => (pageNumber === 1 ? 30 : 10),
    []
  );

  const getSliceWindow = useCallback((pageNumber) => {
    if (pageNumber === 1) return { start: 0, end: 30 };
    const start = 30 + (pageNumber - 2) * 10;
    return { start, end: start + 10 };
  }, []);

  const loadPosts = useCallback(async () => {
    if (isLoadingPosts || !hasMore) return;
    setIsLoadingPosts(true);
    try {
      const response = await fetchPosts();
      const allPosts = response?.posts ?? [];
      const { start, end } = getSliceWindow(page);
      const nextChunk = allPosts.slice(start, end);
      if (!nextChunk.length) {
        setHasMore(false);
        return;
      }
      const mapped = nextChunk.map((item) =>
        adaptFeedPost(item, currentUserId ?? null)
      );
      setPosts((prev) => {
        const map = new Map();
        prev.forEach((p) => map.set(String(p.id), p));
        mapped.forEach((p) => {
          const key = String(p.id);
          if (!map.has(key)) map.set(key, p);
        });
        return Array.from(map.values());
      });
      if (nextChunk.length < 10) setHasMore(false);
    } catch (error) {
      console.error("Failed to load posts", error);
      toast.error("পোস্ট লোড করা যায়নি");
    } finally {
      setIsLoadingPosts(false);
    }
  }, [currentUserId, getSliceWindow, hasMore, isLoadingPosts, page]);

  useEffect(() => {
    if (hasMore) loadPosts();
  }, [loadPosts, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingPosts)
          setPage((prev) => prev + 1);
      },
      { threshold: 0.1, rootMargin: "200px" }
    );
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, isLoadingPosts]);

  useEffect(() => {
    let ignore = false;
    const loadCurrentUser = async () => {
      try {
        const response = await fetchMe();
        if (ignore) return;
        setCurrentUser(response?.data ?? response ?? null);
      } catch (error) {
        console.error("Failed to load current user", error);
      }
    };
    loadCurrentUser();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    setPosts((prev) =>
      prev.map((post) => {
        if (!post?.raw) return post;
        const remapped = adaptFeedPost(post.raw, currentUserId);
        return { ...remapped, raw: post.raw };
      })
    );
  }, [currentUserId]);

  useEffect(() => {
    const queryPostId = searchParams.get("postId");
    if (queryPostId) {
      previousUrlPostId.current = queryPostId;
      if (currentUserId && !sameId(activePostId, queryPostId)) {
        const checkAndOpenPost = async () => {
          const existingPost = posts.find((p) => sameId(p.id, queryPostId));
          if (existingPost) {
            setActivePostId(queryPostId);
            setActiveModalMode("comments");
          } else {
            try {
              const res = await fetchSinglePost(queryPostId);
              const rawPost = res.data || res.post || res;
              const adaptedPost = adaptFeedPost(rawPost, currentUserId);
              setPosts((prev) => {
                if (prev.find((p) => sameId(p.id, adaptedPost.id))) return prev;
                return [adaptedPost, ...prev];
              });
              setActivePostId(queryPostId);
              setActiveModalMode("comments");
            } catch (error) {
              console.error("Failed to fetch post", error);
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("postId");
              navigate(`${location.pathname}?${newParams.toString()}`, {
                replace: true,
              });
            }
          }
        };
        checkAndOpenPost();
      }
    } else if (previousUrlPostId.current) {
      setActivePostId(null);
      setActiveModalMode("comments");
      setDeletingCommentId(null);
      previousUrlPostId.current = null;
    }
  }, [
    searchParams,
    currentUserId,
    posts,
    activePostId,
    navigate,
    location.pathname,
  ]);

  const closeModal = useCallback(() => {
    const urlPostId = searchParams.get("postId");
    setSelectedIndex(0);
    if (urlPostId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("postId");
      navigate(`${location.pathname}?${newParams.toString()}`, {
        replace: true,
      });
    } else {
      setActivePostId(null);
      setActiveModalMode("comments");
      setDeletingCommentId(null);
    }
  }, [searchParams, navigate, location.pathname]);

  // --- FULL LOGIC RESTORED FOR LIKES ---
  const handleToggleLike = useCallback(
    async (postId) => {
      let previousState = null;
      setPosts((prev) =>
        prev.map((post) => {
          if (!sameId(post.id, postId)) return post;
          previousState = {
            liked: post.liked,
            likes: post.likes,
            likedUsers: Array.isArray(post.likedUsers) ? [...post.likedUsers] : [],
            raw: post.raw,
          };
          const viewerKey = viewerIdentity?.id
            ? String(viewerIdentity.id).toLowerCase()
            : null;
          const existingLikedUsers = Array.isArray(post.likedUsers)
            ? post.likedUsers
            : [];
          const hasViewer = viewerKey
            ? existingLikedUsers.some((user) => {
                const identifier = resolveId(user) ?? user.username;
                return identifier ? sameId(identifier, viewerKey) : false;
              })
            : false;
          let updatedLikedUsers = existingLikedUsers;
          let liked = post.liked;
          let nextLikesCount = post.likes ?? updatedLikedUsers.length;
          if (hasViewer) {
            updatedLikedUsers = existingLikedUsers.filter((user) => {
              const identifier = resolveId(user) ?? user.username;
              return identifier ? !sameId(identifier, viewerKey) : true;
            });
            liked = false;
            nextLikesCount = updatedLikedUsers.length;
          } else if (viewerKey) {
            updatedLikedUsers = [...existingLikedUsers, viewerIdentity];
            liked = true;
            nextLikesCount = updatedLikedUsers.length;
          } else {
            liked = !post.liked;
            nextLikesCount = liked
              ? (post.likes ?? 0) + 1
              : Math.max((post.likes ?? 1) - 1, 0);
          }
          const updatedRaw = post.raw && viewerKey
            ? {
                ...post.raw,
                likes: liked
                  ? [...(post.raw.likes ?? []), viewerIdentity]
                  : (post.raw.likes ?? []).filter((entry) => {
                      const identifier =
                        resolveId(entry) ?? entry?.username ?? entry;
                      return identifier ? !sameId(identifier, viewerKey) : true;
                    }),
              }
            : post.raw;
          return {
            ...post,
            liked,
            likes: nextLikesCount,
            likedUsers: updatedLikedUsers,
            raw: updatedRaw,
          };
        })
      );
      try {
        await likePost(postId);
      } catch (error) {
        console.error("Failed to toggle like", error);
        toast.error("লাইক পরিবর্তন করা যায়নি");
        if (previousState) {
          setPosts((prev) =>
            prev.map((post) =>
              sameId(post.id, postId)
                ? { ...post, ...previousState }
                : post
            )
          );
        }
      }
    },
    [viewerIdentity]
  );

  // --- FULL LOGIC RESTORED FOR COMMENTS ---
  const handleAddComment = useCallback(
    async (postId, text) => {
      if (!text.trim()) return;
      try {
        const response = await commentOnPost(postId, text);
        const payload = response?.data ?? response;
        let actualCommentData = null;
        if (payload?.post?.comments && Array.isArray(payload.post.comments)) {
          const commentsArray = payload.post.comments;
          actualCommentData = commentsArray[commentsArray.length - 1];
        } else if (payload?.comment) {
          actualCommentData = payload.comment;
        } else {
          actualCommentData = payload;
        }
        const realId = resolveId(actualCommentData);
        const finalId = realId ?? `comment-${Date.now()}`;
        const normalizedAuthor = adaptUser(
          actualCommentData?.user ?? currentUser ?? {},
          "আপনি"
        );
        const newComment = {
          id: finalId,
          _id: finalId,
          text: actualCommentData?.text ?? text,
          createdAt: actualCommentData?.createdAt ?? new Date().toISOString(),
          author: normalizedAuthor,
        };
        setPosts((prev) =>
          prev.map((post) => {
            if (!sameId(post.id, postId)) return post;
            const updatedRaw = post.raw
              ? {
                  ...post.raw,
                  comments: [
                    ...(post.raw.comments ?? []),
                    actualCommentData ?? newComment,
                  ],
                }
              : post.raw;
            return {
              ...post,
              comments: [...post.comments, newComment],
              raw: updatedRaw,
            };
          })
        );
        toast.success("মন্তব্য যোগ হয়েছে");
      } catch (error) {
        console.error("Failed to add comment", error);
        toast.error("মন্তব্য যোগ করা যায়নি");
      }
    },
    [currentUser]
  );

  // --- FULL LOGIC RESTORED FOR DELETE COMMENT ---
  const handleDeleteComment = useCallback(async (postId, commentId) => {
    if (!postId || !commentId) return;
    setDeletingCommentId(commentId);
    try {
      await deleteComment(postId, commentId);
      setPosts((prev) =>
        prev.map((post) => {
          if (!sameId(post.id, postId)) return post;
          const filtered = post.comments.filter(
            (c) => c._id !== commentId && c.id !== commentId
          );
          const updatedRaw = post.raw
            ? {
                ...post.raw,
                comments: (post.raw.comments ?? []).filter(
                  (c) => c._id !== commentId
                ),
              }
            : post.raw;
          return { ...post, comments: filtered, raw: updatedRaw };
        })
      );
      toast.success("মন্তব্য মুছে ফেলা হয়েছে");
    } catch (error) {
      console.error("Failed to delete comment", error);
      toast.error("মন্তব্য মুছে ফেলা যায়নি");
    } finally {
      setDeletingCommentId(null);
    }
  }, []);

  const handleDeletePost = useCallback(
    (postId) => {
      setPosts((prev) => prev.filter((p) => !sameId(p.id, postId)));
      if (sameId(activePostId, postId)) {
        setActivePostId(null);
        const newParams = new URLSearchParams(searchParams);
        if (newParams.get("postId")) {
          newParams.delete("postId");
          navigate(`${location.pathname}?${newParams.toString()}`, {
            replace: true,
          });
        }
      }
      toast.success("পোস্ট মুছে ফেলা হয়েছে");
    },
    [activePostId, searchParams, navigate, location.pathname]
  );

  const openCommentsModal = useCallback((postId, index = 0) => {
    setActiveModalMode("comments");
    setActivePostId(postId);
    setSelectedIndex(index);
  }, []);

  const openLikesModal = useCallback((postId) => {
    setActiveModalMode("likes");
    setActivePostId(postId);
  }, []);

  const activePost = useMemo(
    () => posts.find((post) => sameId(post.id, activePostId)) ?? null,
    [posts, activePostId]
  );

  const canDeleteComment = useCallback(
    (comment) => {
      const commentAuthorId = resolveId(comment?.author);
      return currentUserId && commentAuthorId
        ? sameId(commentAuthorId, currentUserId)
        : false;
    },
    [currentUserId]
  );

  return (
    <div className="feed">
      {posts.map((post) => {
        const isOwner = currentUserId
          ? sameId(post.author?.id, currentUserId)
          : false;
        return (
          <PostCard
            key={post.id}
            post={post}
            isOwner={isOwner}
            onDelete={() => handleDeletePost(post.id)}
            onLike={() => handleToggleLike(post.id)}
            onOpenLikes={() => openLikesModal(post.id)}
            onOpenComments={() => openCommentsModal(post.id)}
            onAddComment={handleAddComment}
            onOpenPost={openCommentsModal}
          />
        );
      })}
      {hasMore && (
        <div
          ref={loaderRef}
          style={{ height: "40px" }}
        />
      )}
      <PostModal
        open={Boolean(activePost)}
        post={activePost}
        mode={activeModalMode}
        onClose={closeModal}
        initialSlideIndex={selectedIndex}
        onToggleLike={handleToggleLike}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        canDeleteComment={canDeleteComment}
      />
    </div>
  );
}

const INITIAL_CHUNK = 30;
const SUBSEQUENT_CHUNK = 10;
