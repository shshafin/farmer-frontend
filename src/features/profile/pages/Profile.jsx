/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchMe,
  fetchUserPosts,
  likePost,
  commentOnPost,
  deleteComment,
  deletePost,
} from "@/api/authApi";
import { fetchMySeedPrices, deleteSeedPrice, createPost } from "@/api/authApi";

import ProfileOverview from "../components/ProfileOverview";
import ProfileSidebar from "../components/ProfileSidebar";
import PostCard from "../components/PostCard";
import PostModal from "../components/PostModal";
import PostComposerModalNew from "../components/PostComposerModalNew";
import FollowListModal from "../components/FollowListModal";
import AllPostsModal from "../components/AllPostsModal";
import { LiquedLoader } from "@/components/loaders";
import CreatePost from "@/components/layout/CreatePost";
import { getUserName } from "@/utils/userDisplay";

import "@/features/profile/styles/ProfilePage.css";
import { baseApi } from "../../../api";

const avatarFromSeed = (seed) => `https://i.pravatar.cc/120?u=${seed}`;

function resolveUserId(user) {
  if (user == null) return null;
  if (typeof user === "string" || typeof user === "number") return user;
  return user?.id ?? user?._id ?? user?.userId ?? user?.username ?? null;
}

function normalizeLikedUser(raw, fallbackSeed) {
  if (!raw) return null;
  if (typeof raw === "string" || typeof raw === "number") {
    const id = String(raw);
    return { id, username: id, name: undefined, avatar: avatarFromSeed(id) };
  }
  if (typeof raw === "object") {
    const id = raw._id ?? raw.id ?? raw.userId ?? raw.username ?? null;
    if (!id) return null;
    const username = raw.username ?? String(id);
    const name = raw.name ?? raw.fullName ?? raw.fullname;
    const avatarPath = raw.profileImage ?? raw.avatar ?? null;
    const avatar = avatarPath
      ? `${baseApi}${avatarPath}`
      : avatarFromSeed(username || fallbackSeed || String(id));
    return {
      id,
      username,
      name,
      fullName: raw.fullName,
      fullname: raw.fullname,
      address: raw.address,
      state: raw.state,
      district: raw.district,
      division: raw.division,
      location: raw.location,
      avatar,
    };
  }
  return null;
}

export default function ProfilePage() {
  const { username } = useParams();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);
  const [mySeedPrices, setMySeedPrices] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("text");
  const [allPostsOpen, setAllPostsOpen] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [activePostMode, setActivePostMode] = useState("comments");
  const [activePostStartIndex, setActivePostStartIndex] = useState(0);

  // 👇 এখানেই declare করো
  const composerRef = useRef(null);

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

  // Load current user, posts, and seed prices
  useEffect(() => {
    const loadCurrentUserAndProfile = async () => {
      try {
        setLoading(true);

        // ১️⃣ লগিন করা ইউজারের ডেটা
        const meResponse = await fetchMe();
        const meData = meResponse?.data ?? meResponse;
        setCurrentUser(meData);

        // ২️⃣ profile owner userId
        let profileUserId = username ?? resolveUserId(meData);
        if (!profileUserId) throw new Error("Profile user not found");

        // ৩profile userএর পোস্ট fetch
        const postsResponse = await fetchUserPosts(profileUserId);
        const fetchedPosts = postsResponse ?? [];

        // ৪Normalize posts
        const normalizedPosts = (fetchedPosts.posts || []).map((post) => {
          const meId = resolveUserId(meData);
          const rawLikes = Array.isArray(post.likes) ? post.likes : [];
          const likedUsers = rawLikes
            .map((l) => normalizeLikedUser(l, meData?.username || meData?.name))
            .filter(Boolean);
          const liked = meId
            ? likedUsers.some((u) => String(resolveUserId(u)).toLowerCase() === String(meId).toLowerCase())
            : false;

          return {
            ...post,
            id: post._id,
            author: {
              id: post.user?._id || post.userId,
              name: getUserName(post.user, "অজানা ব্যবহারকারী"),
              fullName: post.user?.fullName,
              fullname: post.user?.fullname,
              address: post.user?.address,
              state: post.user?.state,
              district: post.user?.district,
              division: post.user?.division,
              location: post.user?.location,
              username: post.user?.username,
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
                name: getUserName(c.user, "অজানা ব্যবহারকারী"),
                fullName: c.user?.fullName,
                fullname: c.user?.fullname,
                address: c.user?.address,
                state: c.user?.state,
                district: c.user?.district,
                division: c.user?.division,
                location: c.user?.location,
                username: c.user?.username,
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

        // Profile overview
        setProfile(
          meData?._id === profileUserId
            ? meData
            : { ...meData, _id: profileUserId }
        );
        setPosts(normalizedPosts);
        setFollowers(meData.followers ?? []);
        setFollowing(meData.following ?? []);

        // ৫️⃣ নিজের seed prices fetch
        if (profileUserId === resolveUserId(meData)) {
          try {
            const seedsResponse = await fetchMySeedPrices();
            console.log("seed", seedsResponse);
            const prices = seedsResponse?.data ?? seedsResponse ?? [];
            setMySeedPrices(prices);
          } catch (err) {
            console.error("Failed to fetch seed prices", err);
          }
        }
      } catch (error) {
        console.error("Failed to load profile", error);
        toast.error("Profile load করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUserAndProfile();
  }, [username]);

  const viewerIdentity = useMemo(() => {
    if (currentUser) {
      const fallbackSeed = currentUser.username || currentUser.name || "viewer";
      return {
        ...currentUser,
        id: resolveUserId(currentUser) ?? `viewer-${fallbackSeed}`,
        name: getUserName(currentUser, "আপনি"),
        username: currentUser.username || fallbackSeed,
        avatar: currentUser.profileImage
          ? `${baseApi}${currentUser.profileImage}`
          : currentUser.avatar
            ? `${baseApi}${currentUser.avatar}`
            : avatarFromSeed(fallbackSeed),
      };
    }
    return {
      id: "viewer-guest",
      name: "আপনি",
      username: "guest",
      avatar: avatarFromSeed("guest"),
    };
  }, [currentUser]);

  const currentUserId = resolveUserId(currentUser);
  const profileOwnerId = resolveUserId(profile);
  const isOwner = Boolean(
    (currentUserId &&
      profileOwnerId &&
      String(currentUserId).toLowerCase() ===
      String(profileOwnerId).toLowerCase()) ||
    (!username && currentUserId)
  );

  const stats = useMemo(
    () => ({
      posts: posts?.length,
      followers: followers.length,
      following: following.length,
    }),
    [posts?.length, followers.length, following.length]
  );

  // Handlers
  const toggleLike = async (postId) => {
    if (!postId) return;
    let previousState = null;
    try {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          previousState = {
            liked: p.liked,
            likes: p.likes,
            likedUsers: Array.isArray(p.likedUsers) ? [...p.likedUsers] : [],
          };
          const viewerKey = viewerIdentity?.id
            ? String(viewerIdentity.id).toLowerCase()
            : null;
          const existingLikedUsers = Array.isArray(p.likedUsers)
            ? p.likedUsers
            : [];
          const hasViewer = viewerKey
            ? existingLikedUsers.some((user) => {
                const identifier = resolveUserId(user) ?? user?.username;
                return identifier
                  ? String(identifier).toLowerCase() === viewerKey
                  : false;
              })
            : false;

          let updatedLikedUsers = existingLikedUsers;
          let liked = p.liked;
          let nextLikesCount = p.likes ?? updatedLikedUsers.length;
          if (hasViewer) {
            updatedLikedUsers = existingLikedUsers.filter((user) => {
              const identifier = resolveUserId(user) ?? user?.username;
              return identifier
                ? String(identifier).toLowerCase() !== viewerKey
                : true;
            });
            liked = false;
            nextLikesCount = updatedLikedUsers.length;
          } else if (viewerKey) {
            updatedLikedUsers = [...existingLikedUsers, viewerIdentity];
            liked = true;
            nextLikesCount = updatedLikedUsers.length;
          } else {
            liked = !p.liked;
            nextLikesCount = liked
              ? (p.likes ?? 0) + 1
              : Math.max((p.likes ?? 1) - 1, 0);
          }

          return {
            ...p,
            liked,
            likedUsers: updatedLikedUsers,
            likes: nextLikesCount,
          };
        })
      );
      await likePost(postId);
    } catch (error) {
      console.error("Failed to like post", error);
      toast.error("Like করা যায়নি");
      if (previousState) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, ...previousState } : p
          )
        );
      }
    }
  };

  const addComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      const response = await commentOnPost(postId, text);
      const commentData = response.post.comments.slice(-1)[0];
      const commentUser = commentData?.user ?? currentUser ?? {};
      const newComment = {
        id: commentData._id,
        text: commentData.text,
        createdAt: commentData.createdAt,
        author: {
          id: resolveUserId(commentUser) || resolveUserId(currentUser),
          name: getUserName(commentUser, "আপনি"),
          fullName: commentUser?.fullName,
          fullname: commentUser?.fullname,
          address: commentUser?.address,
          state: commentUser?.state,
          district: commentUser?.district,
          division: commentUser?.division,
          location: commentUser?.location,
          username: commentUser?.username,
          avatar: commentUser?.profileImage
            ? `${baseApi}${commentUser.profileImage}`
            : currentUser?.profileImage ||
            currentUser?.avatar ||
            avatarFromSeed(currentUser?.username || "current"),
        },
      };
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), newComment] }
            : p
        )
      );
      toast.success("মন্তব্য যোগ হয়েছে");
    } catch (error) {
      console.error("Failed to add comment", error);
      toast.error("মন্তব্য যোগ করা যায়নি");
    }
  };

  const removeComment = async (postId, commentId) => {
    try {
      await deleteComment(postId, commentId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              comments: (p.comments || []).filter((c) => c.id !== commentId),
            }
            : p
        )
      );
      toast.success("মন্তব্য মুছে ফেলা হয়েছে");
    } catch (error) {
      console.error("Failed to delete comment", error);
      toast.error("মন্তব্য মুছে ফেলা যায়নি");
    }
  };

  const deletePostHandler = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      if (activePostId === postId) closeActivePost();
      toast.success("পোস্ট মুছে ফেলা হয়েছে");
    } catch (error) {
      console.error("Failed to delete post", error);
      toast.error("পোস্ট মুছে ফেলা যায়নি");
    }
  };

  const deleteSeedHandler = async (priceId) => {
    console.log("Deleting seed ID:", priceId);
    if (!priceId) {
      toast.error("Invalid price ID");
      return;
    }

    try {
      await deleteSeedPrice(priceId);
      setMySeedPrices((prev) => prev.filter((s) => s._id !== priceId));
      toast.success("Seed price মুছে ফেলা হয়েছে");
    } catch (error) {
      console.error("Failed to delete seed price", error);
      toast.error("Seed price মুছে ফেলা যায়নি");
    }
  };

  // ✅ Updated submitComposer with createPost API
  const [submitting, setSubmitting] = useState(false);

  const submitComposer = async (payload) => {
    if (!payload) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      if (payload.text) formData.append("text", payload.text);
      payload.images?.forEach((file) => formData.append("images", file));
      payload.videos?.forEach((file) => formData.append("videos", file));

      const response = await createPost(formData);

      const postData = response?.data?.post || response?.post || response;

      // UI update
      setPosts((prev) => [
        {
          ...postData,
          id: postData._id,
          author: {
            id: currentUser._id,
            name: getUserName(currentUser, "আপনি"),
            fullName: currentUser.fullName,
            fullname: currentUser.fullname,
            address: currentUser.address,
            state: currentUser.state,
            district: currentUser.district,
            division: currentUser.division,
            location: currentUser.location,
            username: currentUser.username,
            avatar: currentUser.profileImage
              ? `${baseApi}${currentUser.profileImage}`
              : avatarFromSeed(currentUser.username || "current"),
          },
          content: postData.text || postData.content || postData.caption || postData.description || "",
          likes: 0,
          liked: false,
          comments: [],
          mediaGallery: [
            ...(postData.videos || []).map((vid) => ({
              type: "video",
              src: `${baseApi}${vid}`,
            })),
            ...(postData.images || []).map((img) => ({
              type: "image",
              src: `${baseApi}${img}`,
            })),
          ],
          videoGallery: (postData.videos || []).map((vid) => ({
            type: "video",
            src: `${baseApi}${vid}`,
          })),
          media:
            [
              ...(postData.videos || []).map((vid) => ({
                type: "video",
                src: `${baseApi}${vid}`,
              })),
              ...(postData.images || []).map((img) => ({
                type: "image",
                src: `${baseApi}${img}`,
              })),
            ][0] ?? null,
        },
        ...prev,
      ]);

      toast.success("পোস্ট সফলভাবে তৈরি হয়েছে");
      setComposerOpen(false);
    } catch (error) {
      console.error("Failed to create post", error);
      toast.error("পোস্ট তৈরি করা যায়নি");
    } finally {
      setSubmitting(false);
    }
  };

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
        isOwner={isOwner}
        isFollowing={isFollowingProfile}
        showPrimaryAction={!isOwner}
        onPrimaryAction={() => toast.success("প্রোফাইল সম্পাদনা")}
        onOpenAllPosts={() => setAllPostsOpen(true)}
        onOpenFollowers={() => setFollowersOpen(true)}
        onOpenFollowing={() => setFollowingOpen(true)}
      />

      <div className="profile-two-column">
        <ProfileSidebar
          profile={profile}
          isOwner={isOwner}
          compactSeedDisplay={!isOwner}
          seeds={mySeedPrices}
          hasMoreSeeds={false}
          onDeleteSeed={deleteSeedHandler}
          onOpenComposer={(mode) => {
            setComposerMode(mode);
            setComposerOpen(true);
          }}
          onLoadMoreSeeds={() => { }}
        />

        <section className="post-feed">
          {isOwner && (
            <CreatePost
              user={getUserName(profile, "আপনি")}
              profile={profile.profileImage}
              onTextClick={() => {
                setComposerMode("text");
                setComposerOpen(true);
              }}
              onPhotoVideoClick={() => {
                setComposerMode("media");
                setComposerOpen(true);
                setTimeout(() => {
                  composerRef.current?.triggerFileInput(); // auto open file picker
                }, 100);
              }}
            />
          )}

          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={isOwner}
              onLike={toggleLike}
              onOpenComments={openPostComments}
              onOpenLikes={openPostLikes}
              onDelete={deletePostHandler}
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
        title="আপনি যাদের অনুসরণ করছেন"
        users={following}
      />

      <PostModal
        open={Boolean(activePostId)}
        post={posts.find((p) => p.id === activePostId)}
        mode={activePostMode}
        startIndex={activePostStartIndex}
        onClose={closeActivePost}
        onToggleLike={toggleLike}
        onAddComment={addComment}
        onDeleteComment={removeComment}
      />

      <PostComposerModalNew
        ref={composerRef}
        open={composerOpen}
        mode={composerMode}
        onClose={() => setComposerOpen(false)}
        onSubmit={submitComposer}
        viewer={{
          name: viewerIdentity?.name,
          username: viewerIdentity?.username,
          avatar: viewerIdentity?.avatar,
        }}
      />
    </div>
  );
}
