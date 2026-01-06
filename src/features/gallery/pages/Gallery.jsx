/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import Card from "@/features/gallery/components/Card.jsx";
import VideoGallerySlider from "@/features/gallery/components/VideoGallerySlider";
import { fetchAllGalleries } from "@/api/authApi";
import "@/assets/styles/oldUI.css";
import "@/features/gallery/styles/VideoGallerySlider.css";
import { NavLink } from "react-router-dom";

export default function Gallery() {
  const [query, setQuery] = useState("");
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGallery, setSelectedGallery] = useState(null);

  useEffect(() => {
    const loadGalleries = async () => {
      try {
        const res = await fetchAllGalleries();
        const data = Array.isArray(res?.data) ? res.data : [];
        const formatted = data.map((item) => ({
          id: item._id,
          type: "image",
          img: item.image || "/placeholder.jpg",
          title: item.description || "No description",
          description: item.description || "No description",
        }));
        setGalleryItems(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadGalleries();
  }, []);

  const filteredCards = useMemo(() => {
    if (!query.trim()) return galleryItems;
    const q = query.toLowerCase();
    return galleryItems.filter(({ title }) => title.toLowerCase().includes(q));
  }, [galleryItems, query]);

  return (
    <>
      <div className="photo-body-box">
        <h4>কমিউনিটির শেয়ার করা অনুপ্রেরণাদায়ক ছবি আবিষ্কার করুন</h4>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <VideoGallerySlider />
      </div>

      <h2
        className="gallery-title"
        style={{ marginTop: "3rem" }}>
        বৈশিষ্ট্যযুক্ত ছবি
      </h2>
      <div
        className="cards"
        style={{ marginTop: "1rem", margin: "auto 3rem" }}>
        {loading ? (
          <div className="text-center text-white w-100 py-4">
            Loading galleries...
          </div>
        ) : filteredCards.length > 0 ? (
          filteredCards.map((it, idx) => (
            <Card
              key={it.id || idx}
              {...it}
              path="gallery"
              onOpen={() => setSelectedGallery(it)}
            />
          ))
        ) : (
          <div className="text-center text-white w-100 py-4">
            কোনও ছবি খুঁজে পাওয়া যায়নি
          </div>
        )}
      </div>

      {selectedGallery && (
        <NavLink
          to={`/gallery/${selectedGallery.id}`}
          state={selectedGallery}>
          <GallerySection
            post={selectedGallery}
            suggest={[]}
            galleryId={selectedGallery.id}
          />
        </NavLink>
      )}
    </>
  );
}
