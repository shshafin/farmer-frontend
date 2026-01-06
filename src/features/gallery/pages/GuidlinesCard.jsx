/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import "@/assets/styles/oldUI.css";
import Card from "@/features/gallery/components/Card.jsx";
import { fetchAllCrops, fetchCropById } from "@/api/authApi";

export default function CropGalleryPage() {
  const location = useLocation();
  const url = decodeURIComponent(location.pathname);
  const parts = url.split("/").filter(Boolean);
  const cropNameFromPath = parts[parts.length - 1] || "";

  const [allCrops, setAllCrops] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropId, setCropId] = useState(null);

  // Step 1: fetch all crops to get cropId
  useEffect(() => {
    const loadCrops = async () => {
      try {
        const res = await fetchAllCrops();
        if (res?.success && Array.isArray(res.data)) {
          setAllCrops(res.data);

          // find cropId by banglaName
          const found = res.data.find((c) => c.banglaName === cropNameFromPath);
          if (found) setCropId(found._id);
        }
      } catch (err) {
        console.error("Failed to fetch all crops:", err);
      }
    };
    loadCrops();
  }, [cropNameFromPath]);

  // Step 2: fetch crop details by cropId
  useEffect(() => {
    if (!cropId) return;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await fetchCropById(cropId);

        if (res?.success && Array.isArray(res.data)) {
          setDetails(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch crop details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [cropId]);

  return (
    <>
      <div className="header-back">
        <div className="mainback">
          <div className="backlink">
            <NavLink to="/guidelines">
              <span>⇦</span>
            </NavLink>
          </div>
          <div className="crop-header">
            <h4>{cropNameFromPath}</h4>
          </div>
        </div>

        <div className="companyprosearchbox">
          <div className="allcompanyprosearchbox text-end rounded pb-3 paddingbox mt-5">
            <div
              id="onecompanyproduct"
              className="text-start">
              <p
                title="পণ্য খোজ করুন"
                className="text-center text-white font-semibold">
                পণ্য খোজ করুন
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 📸 Gallery Cards */}
      <div
        className="cards"
        style={{ marginTop: "1rem" }}>
        {loading ? (
          <p
            className="text-center"
            style={{ color: "white" }}>
            লোড হচ্ছে...
          </p>
        ) : details.length === 0 ? (
          <p
            className="text-center"
            style={{ color: "white" }}>
            কোনো তথ্য নেই।
          </p>
        ) : (
          details.map((it, idx) => (
            <Card
              key={it._id || idx}
              id={it._id}
              img={it.cropImage ? `${it.cropImage}` : ""}
              title={it.cropTitle || "বিস্তারিত নেই"}
              type="image"
              path="blog"
            />
          ))
        )}
      </div>
    </>
  );
}
