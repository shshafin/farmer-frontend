import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import GallerySection from "@/features/gallery/components/GallerySection.jsx";
import { fetchGalleryById } from "@/api/authApi";

export default function GalleryDetail() {
  // const { id } = useParams();
  const location = useLocation();
  const url = decodeURIComponent(location.pathname);
  const parts = url.split("/").filter(Boolean);
  const id = parts[parts.length - 1] || "";
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset state when id changes
    setPost(null);
    setLoading(true);

    const fetchPost = async () => {
      try {
        const res = await fetchGalleryById(id);
        setPost({
          id: res._id,
          img: res.image,
          title: res.description,
          description: res.description,
          user: res.user,
          createdAt: res.createdAt,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]); // Dependency on id ensures re-fetch on navigation

  if (loading) return <div>Loading gallery...</div>;
  if (!post) return <div>Gallery not found!</div>;

  return (
    <GallerySection
      post={post}
      suggest={[]}
      galleryId={post.id}
    />
  );
}
