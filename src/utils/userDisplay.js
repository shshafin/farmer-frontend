const FALLBACK_NAME = "অজানা ব্যবহারকারী";

const normalizeText = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

export const getUserDistrict = (user, fallback = "") => {
  if (!user || typeof user !== "object") return fallback;
  const district =
    normalizeText(user.state) ||
    normalizeText(user.district) ||
    normalizeText(user.address) ||
    normalizeText(user.division) ||
    normalizeText(user.location);
  return district || fallback;
};

export const getUserName = (user, fallback = FALLBACK_NAME) => {
  if (!user || typeof user !== "object") return fallback;
  const name =
    normalizeText(user.name) ||
    normalizeText(user.fullName) ||
    normalizeText(user.fullname);
  if (name) return name;

  const displayName = normalizeText(user.displayName);
  const username = normalizeText(user.username);
  if (displayName && displayName !== username) return displayName;

  return fallback;
};

export const formatUserDisplayName = (user, fallback = FALLBACK_NAME) => {
  const name = getUserName(user, fallback);
  const district = getUserDistrict(user);
  if (district) return `${name} (${district})`;
  return name;
};
