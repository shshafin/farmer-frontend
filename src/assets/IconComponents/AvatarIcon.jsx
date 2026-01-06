import React from "react";

const AvatarIcon = ({ size = 128 }) => (
  <img
    src="https://api.dicebear.com/7.x/avataaars/svg?seed=profile"
    alt="avatar"
    width={size}
    height={size}
    style={{ borderRadius: "50%" }}
  />
);

export default AvatarIcon;