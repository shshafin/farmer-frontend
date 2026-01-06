import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { NavLink } from "react-router-dom";
import { fetchAllVideos } from "@/api/authApi";

// Generate YouTube Thumbnail
const getYoutubeThumbnail = (url) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  );
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : "/placeholder.jpg";
};

const VideoGallerySlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: "center",
      dragFree: false,
      containScroll: "trimSnaps",
    },
    [
      Autoplay({
        delay: 3500,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      }),
    ]
  );

  const [videos, setVideos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await fetchAllVideos();
        const videoList = Array.isArray(res?.data) ? res.data : [];

        const formatted = videoList.map((v) => ({
          id: v._id,
          title: v.title || v.description || "Untitled",
          thumbnail: v.thumbnail || getYoutubeThumbnail(v.videoUrl),
          videoUrl: v.videoUrl,
        }));

        setVideos(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    loadVideos();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <div className="video-gallery-container">
      <h2 className="gallery-title">বৈশিষ্ট্যযুক্ত ভিডিও</h2>

      <div
        className="embla"
        ref={emblaRef}>
        <div className="embla__container">
          {videos.map((video) => (
            <div
              key={video.id}
              className="embla__slide">
              <NavLink
                to={`/video/${video.id}`}
                className="video-card-link">
                <div className="video-card">
                  <div className="thumbnail-container cursor-pointer">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="video-thumbnail w-full h-48 object-cover"
                    />
                  </div>
                  <div className="video-info mt-2">
                    <h3 className="video-title text-sm font-medium">
                      {video.title}
                    </h3>
                  </div>
                </div>
              </NavLink>
            </div>
          ))}
        </div>
      </div>

      {/* Dot Pagination */}
      {videos.length > 0 && (
        <div className="embla__dots">
          {videos.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`embla__dot ${index === selectedIndex ? "embla__dot--active" : ""
                }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGallerySlider;
