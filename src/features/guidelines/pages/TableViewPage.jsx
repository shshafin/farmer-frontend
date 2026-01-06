import { useEffect, useState } from "react";
import InsectsSection from "../components/InsectsSection";
import { fetchAllCrops } from "@/api/authApi";

export default function TableViewPage() {
  const [sectionsData, setSectionsData] = useState([]);

  useEffect(() => {
    const loadCrops = async () => {
      try {
        const res = await fetchAllCrops();
        if (res?.success && Array.isArray(res.data)) {
          // 🔹 Group crops by category
          const grouped = res.data.reduce((acc, crop) => {
            if (!acc[crop.category]) acc[crop.category] = [];
            acc[crop.category].push({
              id: crop._id,
              name: crop.banglaName,
              image: crop.image,
            });
            return acc;
          }, {});

          // 🔹 Convert grouped data into sectionsData format
          const formatted = Object.keys(grouped).map((category) => ({
            title: category,
            items: grouped[category],
          }));

          setSectionsData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch crops:", err);
      }
    };

    loadCrops();
  }, []);

  return (
    <div className="guidelines-page">
      <header className="guidelines-hero">
        <div className="nir-body">
          <h4 style={{ color: "rgb(211, 211, 211)" }}>
            ক্ষতিকর পোকামাকড় ও রোগবালাই থেকে
          </h4>
          <h1 className="boboo">ফসল সুরক্ষার নির্দেশিকা</h1>
        </div>
      </header>

      <section className="guidelines-content">
        {sectionsData.length > 0 ? (
          <InsectsSection sections={sectionsData} />
        ) : (
          <p className="text-center mt-5 text-gray-400">
            ফসলের তথ্য লোড হচ্ছে...
          </p>
        )}
      </section>
    </div>
  );
}
