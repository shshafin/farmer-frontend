import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { fetchMe, createPost } from "../../../api/authApi";

import "@/assets/styles/Home.css";

import FollowerSuggest from "@/components/layout/FollowerSuggest";
import CreatePost from "@/components/layout/CreatePost";
import InfiniteFeed from "../../feed/pages/InfiniteFeed";
import PostComposerModal from "@/features/profile/components/PostComposerModal";
import { LiquedLoader } from "@/components/loaders";

export default function Home() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("text"); // "text" | "media" | "video"

  const openComposer = (mode = "text") => {
    setComposerMode(mode);
    setComposerOpen(true);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setComposerMode("text");
  };

  const [users, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMe()
      .then((data) => setUser(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const user = users?.data;

  const userContext = useMemo(() => {
    if (!user) {
      return {
        firstName: "You",
        profileImage: undefined,
        username: "You",
        name: "You",
      };
    }

    const fallbackName = user.name ?? user.username ?? "You";
    const firstName =
      (user.name ?? user.username ?? "You").split(" ")[0] ?? "You";

    return {
      firstName,
      profileImage: user.profileImage,
      username: user.username ?? fallbackName,
      name: fallbackName,
    };
  }, [user]);

  const handleComposerSubmit = async ({ text, attachments }) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (text) formData.append("text", text);

      attachments.forEach(({ file, type }) => {
        if (type === "image") {
          formData.append("images", file);
        } else if (type === "video") {
          formData.append("videos", file);
        }
      });

      await createPost(formData);
      toast.success("Post created successfully!");
      closeComposer();
    } catch (error) {
      console.error("Failed to create post", error);
      const message = error?.message ?? error?.error ?? "Failed to create post.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <LiquedLoader label="Loading feed..." />
      </div>
    );
  }

  return (
    <>
      <section className="flex FY-center">
        <FollowerSuggest />
        <section className="fake-follow-section"></section>

        <section className="feed-area">
          <section className="limit-width">
            <CreatePost
              user={userContext.firstName}
              profile={userContext.profileImage}
              onTextClick={() => openComposer("text")}
              onPhotoVideoClick={(type) =>
                openComposer(type === "video" ? "video" : "media")
              }
              onFellingClick={() => openComposer("text")}
            />

            <InfiniteFeed />
          </section>
        </section>
      </section>

      <PostComposerModal
        open={composerOpen}
        mode={composerMode}
        onClose={closeComposer}
        onSubmit={handleComposerSubmit}
        viewer={{
          name: userContext.name,
          username: userContext.username,
          avatar: userContext.profileImage,
        }}
      />
    </>
  );
}
