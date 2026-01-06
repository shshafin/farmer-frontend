// src/api/authApi.js
import { request } from "./index";

// Register user
export const registerUser = (data) => {
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Login user
export const loginUser = (data) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// fetch notifications
export const fetchNotifications = () =>
  request("/notifications", { method: "GET" });

// NEW: Delete single notification
export const deleteNotification = (id) => {
  return request(`/notifications/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// NEW: Clear all notifications
export const clearAllNotifications = () => {
  return request(`/notifications/clear-all`, {
    method: "DELETE",
    credentials: "include",
  });
};

// Get me
export const fetchMe = () => request("/users/me", { method: "GET" });

// Update Profile
export const updateProfile = (formData) => {
  return request("/users/profile", {
    method: "PUT",
    body: formData,
    credentials: "include",
  });
};

// password change
export const changePassword = (data) => {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

// Logout user
export const logoutUser = () => {
  return request("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
};

// delete user
export const deleteUser = (userId) => {
  return request(`/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// total followers
export const totalFollowers = (userId) => {
  return request(`/users/followers/${userId}`, { method: "GET" });
};

// total following
export const totalFollowing = (userId) => {
  return request(`/users/following/${userId}`, { method: "GET" });
};

// all users
export const fetchAllUsers = () => {
  return request("/users/all", { method: "GET" });
};
// fetch single user
export const fetchSingleUser = (userId) => {
  return request(`/users/${userId}`, { method: "GET" });
};

// follow user
export const followUser = (userId) => {
  return request(`/users/follow/${userId}`, {
    method: "POST",
    credentials: "include",
  });
};
// unfollow user
export const unfollowUser = (userId) => {
  return request(`/users/unfollow/${userId}`, {
    method: "POST",
    credentials: "include",
  });
};

// fetch user posts (profile posts)
export const fetchUserPosts = (userId) => {
  return request(`/posts/profile/${userId}/posts`, {
    method: "GET",
    credentials: "include",
  });
};

// create post
export const createPost = (formData) => {
  return request("/posts/create", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
};

// delete post
export const deletePost = (postId) => {
  return request(`/posts/${postId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// fetch posts
export const fetchPosts = () => {
  return request("/posts/", { method: "GET" });
};

// like/unlike toggle post
export const likePost = (postId) => {
  return request(`/posts/${postId}/like`, {
    method: "PUT",
    credentials: "include",
  });
};

// comment on post
export const commentOnPost = (postId, comment) => {
  return request(`/posts/${postId}/comment`, {
    method: "POST",
    body: JSON.stringify({ text: comment }),
    credentials: "include",
  });
};

// delete comment
export const deleteComment = (postId, commentId) => {
  return request(`/posts/${postId}/comment/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// fetch single post
export const fetchSinglePost = (postId) => {
  return request(`/posts/${postId}`, { method: "GET" });
};

// add galleries
export const addGalleries = (formData) => {
  return request("/galleries/create", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
};

// crops create
export const addCrops = (formData) => {
  return request("/crops/create", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
};

// fetch all crops
export const fetchAllCrops = () => {
  return request("/crops/all", { method: "GET" });
};

// edit crop
export const editCrop = (cropId, data) => {
  return request(`/crops/${cropId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

// delete crop
export const deleteCrop = (cropId) => {
  return request(`/crops/${cropId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// create crop details
export const addCropDetails = (formData) => {
  return request("/crop-details/create", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
};

// fetch all crop details
export const fetchAllCropDetails = () => {
  return request("/crop-details/all", { method: "GET" });
};

// edit crop details
export const editCropDetails = (cropDetailsId, data) => {
  return request(`/crop-details/${cropDetailsId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include",
  });
};
// delete crop details
export const deleteCropDetails = (cropDetailsId) => {
  return request(`/crop-details/${cropDetailsId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// fetch single crop details by crop id
export const fetchCropDetailsByCropId = (cropId) => {
  return request(`/crop-details/${cropId}`, { method: "GET" });
};

// fetch single crop by id
export const fetchCropById = (cropId) => {
  return request(`/crop-details/crop/${cropId}/details`, { method: "GET" });
};

// add company
export const addCompany = (data) => {
  return request("/companies/create", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

// fetch all companies
export const fetchAllCompanies = () => {
  return request("/companies/all", { method: "GET" });
};

// edit company
export const editCompany = (companyId, data) => {
  return request(`/companies/${companyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include",
  });
};
// delete company
export const deleteCompany = (companyId) => {
  return request(`/companies/${companyId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// search company by name
export const searchCompanyByName = (name) => {
  return request(`/companies/search/${name}`, { method: "GET" });
};

// add product
export const addProduct = (formData) => {
  return request("/products/create", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
};

// fetch all products
export const fetchAllProducts = () => {
  return request("/products/all", { method: "GET" });
};

// edit product
export const editProduct = (productId, data) => {
  const isFormData = data instanceof FormData;
  return request(`/products/${productId}`, {
    method: "PUT",
    body: isFormData ? data : JSON.stringify(data),
    credentials: "include",
  });
};
// delete product
export const deleteProduct = (productId) => {
  return request(`/products/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// get single product by id
export const fetchProductById = (productId) => {
  return request(`/products/${productId}`, { method: "GET" });
};

// fetch all galleries
export const fetchAllGalleries = () => {
  return request("/galleries/all", { method: "GET" });
};

// fetch single gallery by id
export const fetchGalleryById = (galleryId) => {
  return request(`/galleries/${galleryId}`, { method: "GET" });
};

// edit gallery
export const editGallery = (galleryId, data) => {
  const isFormData = data instanceof FormData;
  return request(`/galleries/${galleryId}`, {
    method: "PUT",
    body: isFormData ? data : JSON.stringify(data),
    credentials: "include",
  });
};

// delete gallery
export const deleteGallery = (galleryId) => {
  return request(`/galleries/${galleryId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// create market price
export const createMarketPrice = (data) => {
  console.log(data);
  return request("/bazar-dors/create", {
    method: "POST",
    body: data,
    credentials: "include",
  });
};
// fetch all market prices
export const fetchAllMarketPrices = () => {
  return request("/bazar-dors/all", { method: "GET" });
};
// delete market price
export const deleteMarketPrice = (priceId) => {
  return request(`/bazar-dors/${priceId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

// create seed price
export const createSeedPrice = (data) => {
  return request("/biz-bazars/create", {
    method: "POST",
    body: data,
    credentials: "include",
  });
};
// fetch all seed prices
export const fetchAllSeedPrices = () => {
  return request("/biz-bazars/all", { method: "GET" });
};

// get my seed prices
export const fetchMySeedPrices = () => {
  return request("/biz-bazars/my", { method: "GET" });
};

// delete seed price
export const deleteSeedPrice = (priceId) => {
  return request(`/biz-bazars/${priceId}`, {
    method: "DELETE",
    credentials: "include",
  });
};
// add video
export const addVideo = (data) => {
  return request("/videos/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
};

// fetch all videos
export const fetchAllVideos = () => {
  return request("/videos/all", { method: "GET" });
};

// edit video
export const editVideo = (videoId, data) => {
  return request(`/videos/${videoId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

// delete video
export const deleteVideo = (videoId) => {
  return request(`/videos/${videoId}`, {
    method: "DELETE",
    credentials: "include",
  });
};
