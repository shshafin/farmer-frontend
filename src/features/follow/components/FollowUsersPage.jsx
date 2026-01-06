/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import styles from "../styles/Follow.module.css";
import UserCard from "@/components/ui/UserCard";
import {
  fetchAllUsers,
  followUser,
  unfollowUser,
  fetchMe,
} from "@/api/authApi";
import { toast } from "react-hot-toast";

export default function FollowUsersPage({
  title,
  subtitle,
  pageSizeFirst = 16,
  pageSizeNext = 10,
}) {
  const [users, setUsers] = useState([]);
  const [visible, setVisible] = useState(pageSizeFirst);
  const [following, setFollowing] = useState(new Set());
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [meId, setMeId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // current user
        const me = await fetchMe();
        const meIdLocal = me?.data?._id || me?.data?.id;
        setMeId(meIdLocal);

        // all users
        const res = await fetchAllUsers();
        let data = res?.data || res || [];

        // remove current user
        data = data.filter((u) => (u._id || u.id) !== meIdLocal);

        setUsers(data);

        // initial following set
        const initialFollowing = new Set();
        data.forEach((u) => {
          if (u.followers?.includes(meIdLocal)) {
            initialFollowing.add(u._id || u.id);
          }
        });
        setFollowing(initialFollowing);
      } catch (err) {
        toast.error("Failed to fetch users");
        console.error(err);
      }
    })();
  }, []);

  const toggleFollow = useCallback(
    async (user) => {
      const userId = user._id || user.id;
      if (!userId) return;

      if (loadingIds.has(userId)) return;
      setLoadingIds((prev) => new Set(prev).add(userId));

      try {
        if (following.has(userId)) {
          await unfollowUser(userId);
          setFollowing((prev) => {
            const n = new Set(prev);
            n.delete(userId);
            return n;
          });
          toast.success(`Unfollowed ${user.name}`);
        } else {
          await followUser(userId);
          setFollowing((prev) => new Set(prev).add(userId));
          toast.success(`Followed ${user.name}`);
        }
      } catch (err) {
        toast.error("Something went wrong!");
        console.error(err);
      } finally {
        setLoadingIds((prev) => {
          const n = new Set(prev);
          n.delete(userId);
          return n;
        });
      }
    },
    [following, loadingIds]
  );

  const visibleUsers = users.slice(0, visible);
  const hasMore = visible < users.length;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.h1}>{title}</h1>
          <p className={styles.sub}>{subtitle}</p>
        </div>

        <div className={styles.grid}>
          {visibleUsers.map((user) => (
            <UserCard
              key={user._id || user.id}
              user={user}
              isFollowing={following.has(user._id || user.id)}
              onToggle={toggleFollow}
            />
          ))}
        </div>

        {hasMore && (
          <div className={`${styles.loadMoreWrap} space-bottom`}>
            <button
              className={styles.loadMoreBtn}
              onClick={() =>
                setVisible((v) => Math.min(v + pageSizeNext, users.length))
              }>
              আরও দেখুন ({users.length - visible})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
