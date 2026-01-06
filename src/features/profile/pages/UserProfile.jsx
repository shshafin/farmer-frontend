/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import ProfileOverview from "../components/ProfileOverview";
import ProfileSidebarNew from "../components/ProfileSidebarNew";
import PostCard from "../components/PostCard";
import PostModal from "../components/PostModal";
import FollowListModal from "../components/FollowListModal";
import AllPostsModal from "../components/AllPostsModal";
import { LiquedLoader } from "@/components/loaders";
import {
  fetchMe,
  fetchSingleUser,
  fetchUserPosts,
  fetchAllSeedPrices,
  likePost,
  commentOnPost,
  deleteComment,
  followUser,
  unfollowUser,
  totalFollowers,
  totalFollowing,
} from "@/api/authApi";
import { baseApi } from "../../../api";

const avatarFromSeed = (seed) => `https://i.pravatar.cc/120?u=${seed}`;

function resolveUserId(user) {
  return user?._id ?? user?.id ?? null;
}

function normalizeFollowUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw._id ?? raw.id ?? raw.userId ?? raw.username ?? null;
  if (!id) return null;
  const username = raw.username ?? raw.userName ?? String(id);
  const name = raw.name ?? raw.username ?? "User";
  const avatarPath = raw.profileImage ?? raw.avatar ?? null;

  return {
    id,
    username,
    name,
    avatar:
      typeof avatarPath === "string" && avatarPath.startsWith("http")
        ? avatarPath
        : avatarPath
          ? `${baseApi}${avatarPath}`
          : avatarFromSeed(username),
  };
}

function normalizeLikedUser(raw, fallbackSeed) {
  if (!raw) return null;
  if (typeof raw === "string" || typeof raw === "number") {
    const id = String(raw);
    return { id, username: id, name: id, avatar: avatarFromSeed(id) };
  }
  if (typeof raw === "object") {
    const id = raw._id ?? raw.id ?? raw.userId ?? raw.username ?? null;
    if (!id) return null;
    const username = raw.username ?? String(id);
    const name = raw.name ?? raw.fullName ?? raw.username ?? String(id);
    const avatarPath = raw.profileImage ?? raw.avatar ?? null;
    const avatar = avatarPath
      ? `${baseApi}${avatarPath}`
      : avatarFromSeed(username || fallbackSeed || String(id));
    return { id, username, name, avatar };
  }
  return null;
}

export default function UserProfilePage() {
  const url = decodeURIComponent(location.pathname);
  const parts = url.split("/").filter(Boolean);
  const userId = parts[parts.length - 1] || "";
  console.log(userId);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [mySeedPrices, setMySeedPrices] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const [allPostsOpen, setAllPostsOpen] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [activePostMode, setActivePostMode] = useState("comments");
  const [activePostStartIndex, setActivePostStartIndex] = useState(0);

  const closeActivePost = useCallback(() => {
    setActivePostId(null);
    setActivePostMode("comments");
    setActivePostStartIndex(0);
  }, []);

  const openPostComments = useCallback((postId, startIndex = 0) => {
    setActivePostMode("comments");
    setActivePostStartIndex(Number.isFinite(startIndex) ? startIndex : 0);
    setActivePostId(postId);
  }, []);

  const openPostLikes = useCallback((postId) => {
    setActivePostMode("likes");
    setActivePostStartIndex(0);
    setActivePostId(postId);
  }, []);

  const viewerId = useMemo(() => resolveUserId(currentUser), [currentUser]);
  const profileOwnerId = useMemo(() => resolveUserId(profile), [profile]);

  const activePost = useMemo(
    () => posts.find((p) => String(p.id) === String(activePostId)) ?? null,
    [posts, activePostId]
  );

  const canDeleteComment = useCallback(
    (comment) => {
      const commentAuthorId = resolveUserId(comment?.author);
      return viewerId && commentAuthorId
        ? String(viewerId) === String(commentAuthorId)
        : false;
    },
    [viewerId]
  );

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);

        const meResponse = await fetchMe();
        const meData = meResponse?.data ?? meResponse;
        setCurrentUser(meData);

        // ১️⃣ Single user fetch
        const userResponse = await fetchSingleUser(userId);
        const userData = userResponse?.data ?? userResponse;
        setProfile(userData);

        const meId = resolveUserId(meData);
        const followerIds = Array.isArray(userData?.followers)
          ? userData.followers
          : [];
        const isMeFollowing = meId
          ? followerIds.some((id) => String(id) === String(meId))
          : false;
        setIsFollowing(isMeFollowing);

        // ২️⃣ User posts fetch
        const postsResponse = await fetchUserPosts(userData._id);
        const fetchedPosts = postsResponse?.posts ?? [];
        const normalizedPosts = fetchedPosts.map((post) => {
          const rawLikes = Array.isArray(post.likes) ? post.likes : [];
          const likedUsers = rawLikes
            .map((l) => normalizeLikedUser(l, meData?.username || meData?.name))
            .filter(Boolean);
          const liked = meId
            ? likedUsers.some((u) => String(resolveUserId(u)) === String(meId))
            : false;

          return {
            ...post,
            id: post._id,
            author: {
              id: post.user?._id || post.userId,
              name: post.user?.username || post.user?.name || "Unknown",
              avatar: post.user?.profileImage
                ? `${baseApi}${post.user.profileImage}`
                : avatarFromSeed(post.user?.username || "user"),
            },
            content: post.text || post.content || post.caption || post.description || "",
            likes: likedUsers.length,
            liked,
            likedUsers,
            comments: (post.comments || []).map((c) => ({
              id: c._id,
              text: c.text,
              author: {
                id: resolveUserId(c.user),
                name: c.user?.username || c.user?.name || "Unknown",
                avatar: c.user?.profileImage
                  ? `${baseApi}${c.user?.profileImage}`
                  : avatarFromSeed(c.user?.username || "user"),
              },
              createdAt: c.createdAt,
            })),
            mediaGallery: [
              ...(post.videos || []).map((vid) => ({
                type: "video",
                src: `${baseApi}${vid}`,
              })),
              ...(post.images || []).map((img) => ({
                type: "image",
                src: `${baseApi}${img}`,
              })),
            ],
            videoGallery: (post.videos || []).map((vid) => ({
              type: "video",
              src: `${baseApi}${vid}`,
            })),
            media:
              [
                ...(post.videos || []).map((vid) => ({
                  type: "video",
                  src: `${baseApi}${vid}`,
                })),
                ...(post.images || []).map((img) => ({
                  type: "image",
                  src: `${baseApi}${img}`,
                })),
              ][0] ?? null,
          };
        });
        setPosts(normalizedPosts);

        try {
          const followersRes = await totalFollowers(userData._id);
          const rawFollowers = followersRes?.data ?? followersRes ?? [];
          const normalized = Array.isArray(rawFollowers)
            ? rawFollowers
                .map(normalizeFollowUser)
                .filter(Boolean)
            : [];
          setFollowers(normalized);
        } catch (err) {
          setFollowers([]);
        }

        try {
          const followingRes = await totalFollowing(userData._id);
          const rawFollowing = followingRes?.data ?? followingRes ?? [];
          const normalized = Array.isArray(rawFollowing)
            ? rawFollowing
                .map(normalizeFollowUser)
                .filter(Boolean)
            : [];
          setFollowing(normalized);
        } catch (err) {
          setFollowing([]);
        }

        // ৩️⃣ All seed prices fetch
        const seedsResponse = await fetchAllSeedPrices();
        const allSeeds = seedsResponse?.data ?? seedsResponse ?? [];
        const userSeeds = allSeeds.filter(
          (seed) => seed.user?._id === userData._id
        );
        setMySeedPrices(userSeeds);
      } catch (err) {
        console.error("Failed to load user profile", err);
        toast.error("User profile load করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadUserProfile();
  }, [userId]);

  const stats = useMemo(
    () => ({
      posts: posts?.length || 0,
      followers: followers.length || profile?.followers?.length || 0,
      following: following.length || profile?.following?.length || 0,
    }),
    [posts?.length, followers.length, following.length, profile]
  );

  const toggleFollow = useCallback(async () => {
    if (!profileOwnerId) return;
    try {
      if (isFollowing) {
        await unfollowUser(profileOwnerId);
        setIsFollowing(false);
      } else {
        await followUser(profileOwnerId);
        setIsFollowing(true);
      }

      try {
        const followersRes = await totalFollowers(profileOwnerId);
        const rawFollowers = followersRes?.data ?? followersRes ?? [];
        const normalized = Array.isArray(rawFollowers)
          ? rawFollowers.map(normalizeFollowUser).filter(Boolean)
          : [];
        setFollowers(normalized);
      } catch (err) {
        // keep previous list
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
      toast.error("Follow পরিবর্তন করা যায়নি");
    }
  }, [profileOwnerId, isFollowing]);

  const toggleLike = useCallback(
    async (postId) => {
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) => {
          if (String(p.id) !== String(postId)) return p;
          const willLike = !p.liked;
          const nextLikes = willLike ? (p.likes ?? 0) + 1 : Math.max((p.likes ?? 1) - 1, 0);
          return { ...p, liked: willLike, likes: nextLikes };
        })
      );

      try {
        await likePost(postId);
      } catch (error) {
        console.error("Failed to toggle like", error);
        toast.error("Like করা যায়নি");
        // revert optimistic update
        setPosts((prev) =>
          prev.map((p) => {
            if (String(p.id) !== String(postId)) return p;
            const willLike = !p.liked;
            const nextLikes = willLike ? (p.likes ?? 0) + 1 : Math.max((p.likes ?? 1) - 1, 0);
            return { ...p, liked: willLike, likes: nextLikes };
          })
        );
      }
    },
    []
  );

  const addComment = useCallback(
    async (postId, text) => {
      const value = String(text ?? "").trim();
      if (!postId || !value) return;

      try {
        const response = await commentOnPost(postId, value);
        const payload = response?.data ?? response ?? null;
        const latest = payload?.post?.comments?.slice(-1)?.[0] ?? payload?.comment ?? null;

        const fallbackSeed = currentUser?.username || currentUser?.name || "you";
        const newComment = {
          id: latest?._id ?? latest?.id ?? `c-${Date.now()}`,
          text: latest?.text ?? latest?.content ?? value,
          createdAt: latest?.createdAt ?? new Date().toISOString(),
          author: {
            id: resolveUserId(latest?.user) ?? viewerId ?? `viewer-${fallbackSeed}`,
            name: latest?.user?.username ?? latest?.user?.name ?? currentUser?.username ?? "You",
            username: latest?.user?.username ?? currentUser?.username ?? fallbackSeed,
            avatar: latest?.user?.profileImage
              ? `${baseApi}${latest.user.profileImage}`
              : currentUser?.profileImage
                ? `${baseApi}${currentUser.profileImage}`
                : avatarFromSeed(fallbackSeed),
          },
        };

        setPosts((prev) =>
          prev.map((p) =>
            String(p.id) === String(postId)
              ? { ...p, comments: [...(p.comments || []), newComment] }
              : p
          )
        );
        toast.success("মন্তব্য যোগ হয়েছে");
      } catch (error) {
        console.error("Failed to add comment", error);
        toast.error("মন্তব্য যোগ করা যায়নি");
      }
    },
    [currentUser, viewerId]
  );

  const removeComment = useCallback(async (postId, commentId) => {
    if (!postId || !commentId) return;
    try {
      await deleteComment(postId, commentId);
      setPosts((prev) =>
        prev.map((p) =>
          String(p.id) === String(postId)
            ? {
                ...p,
                comments: (p.comments || []).filter(
                  (c) => String(c.id) !== String(commentId) && String(c._id ?? "") !== String(commentId)
                ),
              }
            : p
        )
      );
      toast.success("মন্তব্য মুছে ফেলা হয়েছে");
    } catch (error) {
      console.error("Failed to delete comment", error);
      toast.error("মন্তব্য মুছে ফেলা যায়নি");
    }
  }, []);

  if (loading || !profile) {
    return (
      <div className="profile-page profile-page--loading">
        <LiquedLoader label="প্রোফাইল লোড হচ্ছে..." />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ProfileOverview
        profile={profile}
        stats={stats}
        isOwner={false}
        isFollowing={isFollowing}
        showPrimaryAction={true}
        onPrimaryAction={toggleFollow}
        onOpenAllPosts={() => setAllPostsOpen(true)}
        onOpenFollowers={() => setFollowersOpen(true)}
        onOpenFollowing={() => setFollowingOpen(true)}
      />

      <div className="profile-two-column">
        <ProfileSidebarNew
          profile={profile}
          isOwner={false}
          compactSeedDisplay={true}
          seeds={mySeedPrices}
          hasMoreSeeds={false}
          onDeleteSeed={null}
          onOpenComposer={null}
        />

        <section className="post-feed">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={false}
              onLike={toggleLike}
              onOpenComments={openPostComments}
              onOpenLikes={openPostLikes}
              onDelete={null}
              onAddComment={addComment}
              onOpenPost={openPostComments}
            />
          ))}
        </section>
      </div>

      <AllPostsModal
        open={allPostsOpen}
        onClose={() => setAllPostsOpen(false)}
        posts={posts}
        onSelect={(post, startIndex = 0) => {
          openPostComments(post.id, startIndex);
          setAllPostsOpen(false);
        }}
      />

      <FollowListModal
        open={followersOpen}
        onClose={() => setFollowersOpen(false)}
        title="অনুসরণকারী"
        users={followers}
      />

      <FollowListModal
        open={followingOpen}
        onClose={() => setFollowingOpen(false)}
        title="অনুসরণ করছেন"
        users={following}
      />

      <PostModal
        open={Boolean(activePost)}
        post={activePost}
        mode={activePostMode}
        startIndex={activePostStartIndex}
        onClose={closeActivePost}
        onToggleLike={toggleLike}
        onAddComment={addComment}
        onDeleteComment={removeComment}
        canDeleteComment={canDeleteComment}
      />
    </div>
  );
}
