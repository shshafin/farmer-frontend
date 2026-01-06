import styles from "@/features/follow/styles/Follow.module.css";
import UsersIcon from "@/assets/IconComponents/UsersIcon";
import UserPlusIcon from "@/assets/IconComponents/UserPlusIcon";

export default function UserCard({
  user,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onOpen, // optional
}) {
  const handleCardClick = () => onOpen?.(user);

  const handleFollowClick = (e) => {
    e.stopPropagation();
    if (isFollowing) onUnfollow?.(user);
    else onFollow?.(user);
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.cardTop}>
        <img src={user.avatar} alt={user.name} className={styles.avatar} />
        <div className={styles.topText}>
          <h3 className={styles.name} title={user.name}>
            {user.name}
          </h3>
          <p className={styles.bio} title={user.bio}>
            {user.bio || "No bio available"}
          </p>
        </div>
      </div>

      <div className={styles.cardBottom}>
        <div className={styles.followsLeft}>
          <UsersIcon className={styles.usersIcon} />
          <span className={styles.followers}>{user.followers} followers</span>
        </div>

        <button
          className={`${styles.followBtn} ${
            isFollowing ? styles.following : styles.follow
          }`}
          onClick={handleFollowClick}
        >
          <UserPlusIcon className={styles.followIcon} />
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
}