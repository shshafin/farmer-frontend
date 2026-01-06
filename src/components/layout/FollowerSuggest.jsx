import { useEffect, useState } from "react";
import Follower from "@/components/ui/Follower";
import {
  fetchAllUsers,
  followUser,
  unfollowUser,
  fetchMe,
} from "@/api/authApi";
import "@/assets/styles/FollowerSuggest.css";

export default function FollowerSuggest() {
  const [users, setUsers] = useState([]);
  const [myUser, setMyUser] = useState(null);
  const [followingIds, setFollowingIds] = useState(new Set());

  // load current user and following list
  useEffect(() => {
    const loadMe = async () => {
      const me = await fetchMe();
      setMyUser(me);
      setFollowingIds(new Set(me.following)); // currently following
    };
    loadMe();
  }, []);

  // load all users except self and already following
  useEffect(() => {
    const loadUsers = async () => {
      if (!myUser) return;
      try {
        const allUsersRes = await fetchAllUsers();
        const allUsers = allUsersRes.data || []; // এইখানে array বের কর
        const filtered = allUsers.filter(
          (u) => u._id !== myUser._id && !followingIds.has(u._id)
        );

        setUsers(filtered.slice(0, 6)); // max 6 users
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };
    loadUsers();
  }, [myUser, followingIds]);

  // toggle follow/unfollow
  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await followUser(userId);
        setFollowingIds((prev) => new Set(prev).add(userId));
      } else {
        await unfollowUser(userId);
        setFollowingIds((prev) => {
          const n = new Set(prev);
          n.delete(userId);
          return n;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="follower-suggest">
      <h3 className="title">ফলো করুন</h3>
      <section className="scrollViw">
        {users.map((u) => (
          <Follower
            key={u._id}
            userid={u._id}
            userProfile={u.profileImage}
            username={u.name}
            email={u.email}
            isFollowing={followingIds.has(u._id)}
            onFollow={handleFollowToggle}
          />
        ))}
      </section>
    </div>
  );
}
