import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAllVideos } from "@/api/authApi";
import "../styles/VideoDetailPage.css";

// Helper to extract YouTube video ID
const getYoutubeVideoId = (url) => {
    const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
    );
    return match ? match[1] : null;
};

// Format date in Bengali style
const formatDate = (isoString) => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";

    const months = [
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return `প্রকাশ: ${day} ${month} ${year}, ${time}`;
};

const VideoDetailPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadVideo = async () => {
            try {
                const res = await fetchAllVideos();
                const videoList = Array.isArray(res?.data) ? res.data : [];
                const foundVideo = videoList.find((v) => v._id === videoId);

                if (foundVideo) {
                    setVideo(foundVideo);
                } else {
                    navigate("/gallery");
                }
            } catch (err) {
                console.error(err);
                navigate("/gallery");
            } finally {
                setLoading(false);
            }
        };

        loadVideo();
    }, [videoId, navigate]);

    if (loading) {
        return (
            <div className="video-detail-container">
                <div className="video-detail-loading">লোড হচ্ছে...</div>
            </div>
        );
    }

    if (!video) {
        return null;
    }

    const youtubeId = getYoutubeVideoId(video.videoUrl);

    return (
        <div className="video-detail-container">
            <div className="video-detail-wrapper">
                {/* Video Player */}
                <div className="video-player-section">
                    {youtubeId ? (
                        <div className="video-embed-container">
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title={video.title || video.description || "Video"}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="video-iframe"
                            />
                        </div>
                    ) : (
                        <div className="video-error">
                            <p>ভিডিও লোড করা যায়নি</p>
                        </div>
                    )}
                </div>

                {/* Video Info */}
                <div className="video-info-section">
                    <h1 className="video-detail-title">
                        {video.title || video.description || "শিরোনাম নেই"}
                    </h1>

                    <div className="video-meta">
                        <span className="video-date">
                            {video.createdAt && formatDate(video.createdAt)}
                        </span>
                    </div>

                    {video.description && (
                        <div className="video-description">
                            <h3 className="description-heading">বিস্তারিত</h3>
                            <p className="description-text">{video.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoDetailPage;
