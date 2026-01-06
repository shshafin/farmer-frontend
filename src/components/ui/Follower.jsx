import { NavLink } from "react-router-dom";
import "@/assets/styles/Followers.css";
import { useState } from "react";
import { baseApi } from "../../api";

function Follower({
  userid,
  userprofile,
  userProfile,
  username,
  email,
  isFollowing: initialFollow = false,
  onFollow,
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollow);
  const profileImage =
    userProfile ??
    userprofile ??
    "https://i.postimg.cc/fRVdFSbg/e1ef6545-86db-4c0b-af84-36a726924e74.png";

  const handleFollowClick = (e) => {
    e.preventDefault();
    setIsFollowing((prev) => !prev);
    if (onFollow) onFollow(userid, !isFollowing);
  };

  return (
    <NavLink
      to={`/user/${userid}`}
      className="follower">
      <section>
        <div className="profile">
          <img
            src={
              profileImage.startsWith("http") || profileImage.startsWith("blob:")
                ? profileImage
                : `${baseApi}${profileImage}`
            }
            alt={username + " Profile"}
          />
        </div>
        <div className="info">
          <div className="name">{username}</div>
          <div className="username">{email}</div>
        </div>
      </section>
      <button onClick={handleFollowClick}>
        {isFollowing ? "আনফলো" : "ফলো"}
      </button>
    </NavLink>
  );
}

export default Follower;
