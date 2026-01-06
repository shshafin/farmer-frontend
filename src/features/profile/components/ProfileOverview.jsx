import PropTypes from "prop-types";
import { baseApi } from "../../../api";

const COUNT_LABELS = {
  posts: "টি পোস্ট",
  followers: "জন অনুসারী",
  following: "জনকে অনুসরণ করছেন",
};

const TEXT_EDIT_PROFILE = "প্রোফাইল সম্পাদনা";
const TEXT_FOLLOW = "অনুসরণ করুন";
const TEXT_FOLLOWING = "অনুসরণ করছেন";

function formatCount(type, count) {
  const suffix = COUNT_LABELS[type];
  if (!suffix) return String(count);
  return `${count} ${suffix}`;
}

function resolveAvatarUrl(profile) {
  const raw = profile?.profileImage ?? profile?.avatar ?? null;
  if (!raw) {
    return `https://i.pravatar.cc/120?u=${profile?._id || profile?.id || profile?.username || profile?.name || "user"}`;
  }
  if (typeof raw === "string" && (raw.startsWith("http://") || raw.startsWith("https://"))) {
    return raw;
  }
  const normalized = typeof raw === "string" && raw.startsWith("/") ? raw : `/${raw}`;
  return `${baseApi}${normalized}`;
}

export default function ProfileOverview({
  profile,
  stats,
  isOwner,
  isFollowing,
  showPrimaryAction,
  onPrimaryAction,
  onOpenAllPosts,
  onOpenFollowers,
  onOpenFollowing,
}) {
  const primaryButtonClasses = [
    "profile-primary-button",
    isOwner ? "owner" : "",
    !isOwner && isFollowing ? "following" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const primaryButtonLabel = isOwner
    ? TEXT_EDIT_PROFILE
    : isFollowing
    ? TEXT_FOLLOWING
    : TEXT_FOLLOW;

  console.log(profile);

  return (
    <section className="profile-overview">
      <img
        src={resolveAvatarUrl(profile)}
        alt={`${profile.name} avatar`}
        className="profile-overview-avatar"
      />

      <div className="profile-overview-main">
        <h1 className="profile-overview-name">{profile.name}</h1>
        <div className="profile-overview-username">@{profile.username}</div>
        {profile.bio && (
          <p style={{ marginTop: "0.5rem", color: "#cbd5f5" }}>{profile.bio}</p>
        )}
      </div>

      <div className="profile-quick-actions">
        <div className="profile-stat-buttons">
          <button
            type="button"
            onClick={onOpenAllPosts}>
            {formatCount("posts", stats.posts)}
          </button>
          <button
            type="button"
            onClick={onOpenFollowers}>
            {formatCount("followers", stats.followers)}
          </button>
          <button
            type="button"
            onClick={onOpenFollowing}>
            {formatCount("following", stats.following)}
          </button>
        </div>

        {showPrimaryAction && (
          <button
            type="button"
            className={primaryButtonClasses}
            onClick={onPrimaryAction}
            aria-pressed={isOwner ? undefined : isFollowing}>
            {primaryButtonLabel}
          </button>
        )}
      </div>
    </section>
  );
}

ProfileOverview.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    profileImage: PropTypes.string,
    avatar: PropTypes.string,
    bio: PropTypes.string,
  }).isRequired,
  stats: PropTypes.shape({
    posts: PropTypes.number,
    followers: PropTypes.number,
    following: PropTypes.number,
  }),
  isOwner: PropTypes.bool,
  isFollowing: PropTypes.bool,
  showPrimaryAction: PropTypes.bool,
  onPrimaryAction: PropTypes.func,
  onOpenAllPosts: PropTypes.func,
  onOpenFollowers: PropTypes.func,
  onOpenFollowing: PropTypes.func,
};

ProfileOverview.defaultProps = {
  stats: { posts: 0, followers: 0, following: 0 },
  isOwner: false,
  isFollowing: false,
  showPrimaryAction: true,
  onPrimaryAction: undefined,
  onOpenAllPosts: undefined,
  onOpenFollowers: undefined,
  onOpenFollowing: undefined,
};
