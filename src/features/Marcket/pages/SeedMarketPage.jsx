import { useState, useEffect, useCallback } from "react";
import MarketCard from "@/components/ui/MarketCard";
import MarketModal from "@/components/ui/MarketModal";
import MarketCreateModal from "@/components/ui/MarketCreateModal";
import AddPost from "@/assets/icons/add.png";
import { fetchMe, createSeedPrice, fetchAllSeedPrices } from "@/api/authApi"; // fetch current user
import { formatTimeAgo } from "@/utils/timeAgo";

export default function SeedMarketPage() {
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

  // 🟢 Fetch all biz bazar data
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAllSeedPrices();
        if (res?.success && Array.isArray(res.data)) {
          const formatted = res.data.map((item) => ({
            id: item._id,
            name: item.user?.name || "অজানা ব্যবহারকারী",
            profileImage: item.user?.profileImage || "",
            location: item.user?.state || "অজানা এলাকা",
            image: item.image,
            contact: item.user?.phone,
            description: item.description || "কোনো বিবরণ নেই",
            timeText: formatTimeAgo(item.createdAt),
          }));
          setItems(formatted);
        }
      } catch (err) {
        console.error("Seed market fetch failed:", err);
      }
    };
    loadData();
  }, []);

  console.log(items);

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
        <h4>আপনার স্বপ্ন ফলানো বীজ ক্রয়-বিক্রয় করুন</h4>
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
              <h4>বীজ বাজার যোগ করুন</h4>
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
        name={selected?.name}
        profileImage={selected?.profileImage}
        location={selected?.location}
        priceImage={selected?.image}
        contact={selected?.contact}
        description={selected?.description}
        timeText={selected?.timeText}
        showContact={true}
      />
      {/* Create Modal */}
      <MarketCreateModal
        title="বীজ যোগ করুন"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        user={user} // 🟢  fetchMe user
        onSubmitApi={async (formData) => {
          const res = await createSeedPrice(formData);

          if (res?.success && res.data) {
            // new item parent state এ add করা
            setItems((prev) => [
              {
                id: res.data._id,
                name: user?.name || "অজানা ব্যবহারকারী",
                profileImage: user?.profileImage || "",
                location: user?.state || "অজানা এলাকা",
                image: res.data.image,
                contact: user?.phone,
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
