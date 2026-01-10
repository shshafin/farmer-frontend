import { useState, useEffect, useCallback } from "react";
import MarketCard from "@/components/ui/MarketCard";
import MarketModal from "@/components/ui/MarketModal";
import MarketCreateModal from "@/components/ui/MarketCreateModal";
import AddPost from "@/assets/icons/add.png";
import { createMarketPrice, fetchMe } from "@/api/authApi";
import { fetchAllMarketPrices } from "@/api/authApi";
import { formatTimeAgo } from "@/utils/timeAgo";

export default function MarcketPricePage() {
  const [items, setItems] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);

  // 🟢 Fetch current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetchMe();
        if (res?.success && res?.data) setUser(res.data);
      } catch (err) {
        console.error("User fetch failed:", err);
      }
    };
    loadUser();
  }, []);

  // 🟢 Fetch existing market prices
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAllMarketPrices();
        if (res?.success && Array.isArray(res.data)) {
          const formatted = res.data.map((item) => ({
            id: item._id,
            state: item.user?.state,
            profileImage: item.user?.profileImage,
            name: item?.user?.name,
            image: item?.image,
            title: item.user?.name || "অজানা ব্যবহারকারী",
            description: item?.description || "কোনো বিবরণ নেই",
            timeText: formatTimeAgo(item?.createdAt),
          }));
          setItems(formatted);
        }
      } catch (err) {
        console.error("Market price fetch failed:", err);
      }
    };
    loadData();
  }, []);

  // 🟢 Modal open handler
  const openCard = useCallback(
    (id) => {
      const found = items.find((i) => i.id === id);
      setSelected(found);
      setOpenModal(true);
    },
    [items]
  );

  return (
    <div className="daily_bxp45">
      <div className="photo-body-box">
        <h4>প্রতিদিনের বাজার মূল্যের তালিকা দেখুন</h4>
      </div>

      <div className="dxKXr_mboX74">
        {/* Create Button */}
        <button
          className="cbtn_minx_dbpx58"
          onClick={() => setCreateOpen(true)}>
          <div className="cbtn_dixbp_xr5">
            <div className="cbtn_minxi_imgsesalesx45x">
              <img
                src={AddPost}
                alt="Add items"
              />
            </div>
            <div className="cbtn_minxd_imagxds46">
              <h4>বাজার দর যোগ করুন</h4>
            </div>
          </div>
        </button>

        {/* Market Items */}
        {items.length > 0 ? (
          items.map((it) => (
            <MarketCard
              key={it.id}
              {...it}
              onClick={openCard}
            />
          ))
        ) : (
          <p className="text-center mt-5 text-gray-500">
            কোনো বাজার তথ্য পাওয়া যায়নি।
          </p>
        )}
      </div>

      {/* View Modal */}
      <MarketModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        name={selected?.title}
        profileImage={selected?.profileImage}
        location={selected?.state || "অজানা এলাকা"}
        priceImage={selected?.image}
        timeText={selected?.timeText || "সময় তথ্য নেই"}
        description={selected?.description || "No description"}
        showContact={false}
      />

      {/* Create Modal */}
      <MarketCreateModal
        title="বাজার দর যোগ করুন"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        user={user}
        onSubmitApi={async (formData) => {
          const res = await createMarketPrice(formData);

          if (res?.success && res.data) {
            // 🔥 নতুন item instant list-এ add করা
            setItems((prev) => [
              {
                id: res.data._id,
                state: user?.state || "অজানা এলাকা",
                profileImage: user?.profileImage || "",
                name: user?.name || "অজানা ব্যবহারকারী",
                image: res.data.image,
                title: user?.name || "অজানা ব্যবহারকারী",
                description: res.data.description || "কোনো বিবরণ নেই",
                timeText: formatTimeAgo(res.data.createdAt),
              },
              ...prev,
            ]);
          }

          return res;
        }}
      />
    </div>
  );
}
