import { useEffect, useState } from "react";
import { LiquedLoader } from "@/components/loaders";
import { fetchGalleryById, fetchAllGalleries } from "@/api/authApi";
import { baseApi } from "../../../api";
import Card from "./Card";
import CardNew from "./CardNew";

export default function GallerySection({ post: initialPost, galleryId }) {
  const id = galleryId || initialPost?.id;
  const [post, setPost] = useState(initialPost ?? null);
  const [suggest, setSuggest] = useState([]);
  const [status, setStatus] = useState(initialPost ? "done" : "idle");
  const [suggestStatus, setSuggestStatus] = useState("idle");

  // Fetch main gallery post by id
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setStatus("loading");

    fetchGalleryById(id)
      .then((fetchedPost) => {
        if (!alive) return;
        setPost({
          id: fetchedPost._id,
          img: `${baseApi}${fetchedPost.image}`,
          title: fetchedPost.description,
          description: fetchedPost.description,
          datetime: fetchedPost.createdAt,
          timeText: "just now",
          timeTitle: new Date(fetchedPost.createdAt).toLocaleString(),
          user: fetchedPost.user
            ? {
                id: fetchedPost.user._id,
                name: fetchedPost.user.name,
                username: fetchedPost.user.username,
                profileImage: `${baseApi}${fetchedPost.user.profileImage}`,
              }
            : null,
        });
        setStatus("done");
      })
      .catch((err) => {
        console.error(err);
        if (!alive) return;
        setStatus("error");
      });

    return () => {
      alive = false;
    };
  }, [id]);

  // Fetch all galleries for "related/suggested" section
  useEffect(() => {
    let alive = true;
    setSuggestStatus("loading");

    fetchAllGalleries()
      .then((res) => {
        if (!alive) return;
        const data = Array.isArray(res?.data) ? res.data : [];
        const filtered = data
          .filter((item) => item._id !== id)
          .map((item) => ({
            id: item._id,
            img: `${baseApi}${item.image}`, // Keep this
            title: item.description || "No description",
          }));
        setSuggest(filtered);
        setSuggestStatus("done");
      })
      .catch((err) => {
        console.error(err);
        if (!alive) return;
        setSuggestStatus("error");
      });

    return () => {
      alive = false;
    };
  }, [id]);

  // Loading state
  if ((status === "loading" || status === "idle") && !post) {
    return <LiquedLoader label="গ্যালারি পোস্ট লোড হচ্ছে..." />;
  }

  // Error state
  if (status === "error" || !post) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl mb-2">Unable to load gallery post</h2>
        <p className="text-gray-600">
          Please check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="midkkk11">
      {/* Main Gallery Post */}
      <div className="ittdkkk11">
        <div className="itkkk11">
          <img
            src={post.img}
            alt={post.title || "photo gallery"}
          />
          <h5>{post.title}</h5>
        </div>

        <div className="tdkkk11">
          <span
            title={post.timeTitle}
            className="times">
            <time
              style={{ fontSize: "small" }}
              className="timeago"
              dateTime={post.datetime}>
              {post.timeText}
            </time>
          </span>
          {post.description && (
            <p className="description">{post.description}</p>
          )}
        </div>
      </div>

      {/* Suggested Galleries */}
      <div className="ailkkk11">
        {suggestStatus === "loading" ? (
          <LiquedLoader label="Related galleries loading..." />
        ) : (
          suggest
            .slice(0, 4)
            .reverse()
            .map((item) => (
              <CardNew
                key={item.id}
                id={item.id}
                img={item.img}
                title={item.title}
                path="gallery"
              />
            ))
        )}
      </div>
    </div>
  );
}
