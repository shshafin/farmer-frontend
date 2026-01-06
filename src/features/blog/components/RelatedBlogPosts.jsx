import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { baseApi } from "../../../api";
import { fetchAllCropDetails } from "@/api/authApi"; // সব crop/post fetch করার API

export default function RelatedBlogPosts({
  currentPost = {}, // 👉 এইটা আসবে parent থেকে (Blog details page)
  basePath = "post",
  titleMaxLen = 52,
  fallbackTo = "/guidelines",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelated = async () => {
      try {
        const res = await fetchAllCropDetails();
        console.log("res", res);
        if (res?.success && Array.isArray(res.data)) {
          // Filter kore same category er gulake rakha
          const matched = res.data.filter(
            (item) =>
              item.category.category === currentPost.category.category &&
              item._id !== currentPost._id
          );
          setRelatedItems(matched);
        }
      } catch (err) {
        console.error("Failed to fetch related posts:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentPost?.category) loadRelated();
  }, [currentPost]);

  const handleBack = (e) => {
    e.preventDefault();
    const from = location.state?.from;
    if (from) navigate(from);
    else if (window.history.length > 1) navigate(-1);
    else navigate(fallbackTo);
  };

  console.log("releted items", relatedItems);
  const clampTitle = (t = "", max = 52) =>
    t.length > max ? t.slice(0, max - 1) + "…" : t;

  if (loading)
    return <p style={{ color: "white", textAlign: "center" }}>লোড হচ্ছে...</p>;

  if (relatedItems.length === 0)
    return (
      <p style={{ color: "white", textAlign: "center" }}>
        কোনও সম্পর্কিত পোস্ট পাওয়া যায়নি।
      </p>
    );

  return (
    <section aria-labelledby="related-blog-header">
      <div className="back">
        <a
          href="#"
          onClick={handleBack}>
          <span>⇦</span> নির্দেশীকায় ফিরে যান
        </a>
      </div>

      <div className="related-crop-main-header">
        <h2
          id="related-blog-header"
          className="m-a">
          <p className="corpndpbmr">{currentPost.cropTitle}</p>এর&nbsp;
          <span>{currentPost.category.category}</span> সম্পর্কিত অন্যান্য
          রোগসমূহ
        </h2>
      </div>

      <div className="main-related-crop">
        <div className="related-crop-list">
          {relatedItems.map((it) => (
            <div
              className="related-item"
              key={it._id}>
              <div className="crop-card">
                <NavLink
                  to={`/${basePath}/${it._id}`}
                  state={{ from: location.pathname }}>
                  <img
                    className="gallery-img"
                    src={`${baseApi}${it.cropImage}`}
                    alt={it.cropTitle || "crop image"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/fallbacks/placeholder-related.jpg";
                    }}
                  />
                </NavLink>
                <p
                  title={it.cropTitle}
                  className="related-slide-crop-title">
                  {clampTitle(it.cropTitle, titleMaxLen)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
