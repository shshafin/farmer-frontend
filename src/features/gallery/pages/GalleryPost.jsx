import { useEffect, useState } from "react";
import GallerySection from "../components/GallerySection";
import { fetchAllGalleries } from "@/api/authApi";

export default function GalleryPost() {
  const [post, setPost] = useState(null);
  const [suggest, setSuggest] = useState([]);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const res = await fetchAllGalleries();
        const data = Array.isArray(res?.data) ? res.data : [];

        if (data.length > 0) {
          // Latest gallery as main post
          const main = data[0];
          setPost({
            id: main._id,
            img: main.imageUrl || "/placeholder.jpg",
            title: main.description || "No description",
            description: main.description || "No description",
            datetime: main.createdAt,
            timeText: "just now", // optional, format if you want
            timeTitle: new Date(main.createdAt).toLocaleString(),
          });

          // Rest as suggestions
          const suggestions = data.slice(1, 5).map((item) => ({
            id: item._id,
            type: "image",
            img: item.imageUrl || "/placeholder.jpg",
            title: item.description || "No description",
            datetime: item.createdAt,
            timeText: "just now",
            timeTitle: new Date(item.createdAt).toLocaleString(),
          }));
          setSuggest(suggestions);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadGallery();
  }, []);

  if (!post)
    return <div className="text-center text-white py-5">Loading...</div>;

  return (
    // <GallerySection
    //   post={post}
    //   suggest={suggest}
    // />
    <></>
  );
}
