// /seed/ShowFollowUsers.jsx
import { useEffect, useState } from "react";
import FollowUsersPage from "./FollowUsersPage";
import { fetchAllUsers } from "@/api/authApi";
import { baseApi } from "../../../api";
import { followUser, unfollowUser } from "../../../api/authApi";
import toast from "react-hot-toast";
import { LiquedLoader } from "@/components/loaders";

export default function ShowFollowUsers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetchAllUsers(); // API call
        if (!alive) return;

        const users = (res?.data ?? res).map((u, i) => ({
          id: u._id || `${u.username}-${i}`,
          name: u.name || u.username || "Unknown",
          bio: u.bio || "No bio available",
          followers: u.followers?.length || 0,
          avatar: u.profileImage
            ? `${baseApi}${u.profileImage}`
            : `https://api.dicebear.com/9.x/initials/svg?seed=${
                u.username || u._id
              }-${i}`,
          isOnline: u.isOnline || false,
        }));

        setItems(users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <LiquedLoader label="অনুসারীদের তালিকা লোড হচ্ছে..." />
      </div>
    );
  }


  const handleFollow = async (user) => {
    try {
      await followUser(user.id);
      setItems((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, followers: u.followers + 1 } : u
        )
      );
      toast.success(`You followed ${user.name}`);
      return true;
    } catch (err) {
      console.error("Follow failed:", err);
      toast.error(`Failed to follow ${user.name}`);
      return false;
    }
  };

  const handleUnfollow = async (user) => {
    try {
      await unfollowUser(user.id);
      setItems((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, followers: Math.max(0, u.followers - 1) }
            : u
        )
      );
      toast.success(`You unfollowed ${user.name}`);
      return true;
    } catch (err) {
      console.error("Unfollow failed:", err);
      toast.error(`Failed to unfollow ${user.name}`);
      return false;
    }
  };

  return (
    <FollowUsersPage
      title="ব্যবহারকারীর অনুসরণ করুন"
      subtitle="নতুন ব্যবহারকারীদের খুঁজে নিন এবং অনুসরণ করুন"
      items={items}
      pageSizeFirst={16}
      pageSizeNext={10}
      onFollow={handleFollow}
      onUnfollow={handleUnfollow}
    />
  );
}
