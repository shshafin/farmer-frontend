import RelatedBlogPosts from "../components/RelatedBlogPosts";
import BlogPost from "../components/BlogPost";
import "@/assets/styles/oldUI.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCropDetailsByCropId } from "@/api/authApi";

export default function BlogPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await fetchCropDetailsByCropId(id);
        console.log(res);
        if (res?.success && res.data) {
          setPost(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  console.log(post);

  if (loading) return <p style={{ color: "white" }}>লোড হচ্ছে...</p>;
  if (!post) return <p style={{ color: "white" }}>পোস্ট পাওয়া যায়নি।</p>;

  return (
    <>
      <BlogPost />

      {/* এখানে পাঠাও post টা */}
      <RelatedBlogPosts
        cropLabel={post.cropName}
        topicLabel={post.category}
        currentPost={post} // এখানেই পাঠানো হচ্ছে
        basePath="blog"
      />
    </>
  );
}
