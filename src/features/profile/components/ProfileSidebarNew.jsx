import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import BizzShortsCarousel from "@/features/bizzShorts/components/BizzShortsCarousel";
import { fetchMe } from "@/api/authApi";

const FALLBACK_INFO = "তথ্য পাওয়া যায়নি";

export default function ProfileSidebarNew({
  profile,
  isOwner,
  seeds,
  hasMoreSeeds,
  onDeleteSeed,
  onLoadMoreSeeds,
}) {
  const [showSeedGallery, setShowSeedGallery] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res = await fetchMe();
        // API response structure onujayi data set kora
        setCurrentUser(res?.data ?? res ?? null);
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    };
    loadCurrentUser();
  }, []);

  // --- FAILS_SAFE LOGIC ---
  const shouldShowContactInfo = useMemo(() => {
    // ১. যদি parent থেকে সরাসরি isOwner true আসে
    if (isOwner) return true;

    // ২. যদি currentUser এর ID আর প্রোফাইলের ID মিলে যায় (নিজে নিজের প্রোফাইলে থাকলে)
    const currentUserId = currentUser?._id || currentUser?.id;
    const profileId = profile?._id || profile?.id;

    if (currentUserId && profileId && currentUserId === profileId) {
      return true;
    }

    // ৩. বাকি সবার জন্য (Publicly) বন্ধ থাকবে
    return false;
  }, [isOwner, currentUser, profile]);

  const carouselItems = useMemo(
    () =>
      (seeds || []).map((seed) => ({
        ...seed,
        id: seed._id,
        mediaUrl: seed.mediaUrl ?? seed.image,
        photographer:
          seed.photographer || seed.supplier || profile?.name || "অজানা তথ্য",
      })),
    [profile?.name, seeds]
  );

  return (
    <aside className="profile-sidebar">
      <div className="profile-sidebar-card">
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>প্রাথমিক তথ্য</h3>

        {/* Contact Info: Only for Owner */}
        {shouldShowContactInfo && (
          <>
            <div className="sidebar-info-row">
              ইমেইল : <span>{profile.email || FALLBACK_INFO}</span>
            </div>
            <div className="sidebar-info-row">
              ফোন : <span>{profile.phone || FALLBACK_INFO}</span>
            </div>
          </>
        )}

        <div className="sidebar-info-row">
          বিভাগ :{" "}
          <span>{profile.state || profile.division || FALLBACK_INFO}</span>
        </div>
        <div className="sidebar-info-row">
          ঠিকানা : <span>{profile.address || FALLBACK_INFO}</span>
        </div>
      </div>

      <div className="profile-sidebar-card seed-carousel-card">
        <div className="seed-carousel-card__header">
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>বীজ সংগ্রহ</h3>
          <button
            type="button"
            className="profile-primary-button seed-carousel-card__toggle"
            onClick={() => setShowSeedGallery((prev) => !prev)}>
            {showSeedGallery ? "লুকান" : "দেখুন"}
          </button>
        </div>

        {showSeedGallery ? (
          carouselItems.length ? (
            <BizzShortsCarousel
              items={carouselItems}
              className="profile-seed-carousel"
              title="বীজ গ্যালেরি"
              description="পছন্দের বীজগুলো এখানে দেখুন"
              allowDelete={isOwner}
              showMeta={false}
              openSeedModalOnClick={true}
              onDelete={isOwner ? onDeleteSeed : undefined}
              loadMore={onLoadMoreSeeds}
              hasMore={hasMoreSeeds}
              loadMoreOffset={1}
            />
          ) : (
            <div className="empty-state seed-carousel-card__empty">
              এখনও কোনও বীজ যোগ করা হয়নি
            </div>
          )
        ) : (
          <div className="empty-state seed-carousel-card__empty">
            সংগ্রহ দেখতে আবার দেখুন বোতামে চাপ দিন
          </div>
        )}
      </div>
    </aside>
  );
}

ProfileSidebarNew.propTypes = {
  profile: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    state: PropTypes.string,
    division: PropTypes.string,
    address: PropTypes.string,
    gender: PropTypes.string,
  }).isRequired,
  isOwner: PropTypes.bool,
  seeds: PropTypes.array,
  hasMoreSeeds: PropTypes.bool,
  onDeleteSeed: PropTypes.func,
  onLoadMoreSeeds: PropTypes.func,
};
