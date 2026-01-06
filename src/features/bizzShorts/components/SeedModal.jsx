import PropTypes from "prop-types";
import Modal from "@/features/profile/components/Modal";
import { baseApi } from "../../../api";

export default function SeedModal({ open, short, onClose }) {
  if (!short) return null;
  console.log(short, "short");

  const phone = short.phone || short.contact || null;
  const image = short.mediaUrl || short.img || null;
  const author = short.author || {
    username: short.photographer || "username",
    location: short.location || "",
  };
  const timeText = short.timeText || short.time || "";

  // Show location in Bengali if present (example: রাজশাহী). The value comes from author.location
  const locationText = author.location || short.location || "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      className="seed-modal">
      <div className="seed-modal-inner">
        <div className="seed-header">
          <a
            href={`?krishokarea_user=${author.photographer}`}
            onClick={(e) => e.preventDefault()}
            className="seed-author">
            <img
              className="seed-author-avatar"
              alt="author avatar"
              src={`${baseApi}${short.user.profileImage}`}
            />

            <div className="seed-author-meta">
              <div className="seed-author-name">{author.username}</div>
              {(locationText || timeText) && (
                <div className="seed-author-submeta">
                  {locationText && (
                    <span className="seed-author-location">{locationText}</span>
                  )}
                  {timeText && <span className="seed-time">{timeText}</span>}
                </div>
              )}
            </div>
          </a>
        </div>

        <div className="seed-media-wrap">
          {image ? (
            <img
              className="seed-media"
              alt={short.title || "seed image"}
              src={`${baseApi}${short.image}`}
            />
          ) : (
            <div className="seed-media placeholder">No image</div>
          )}
        </div>

        <div className="seed-body">
          <div className="seed-contact">
            {short.user.phone} এই নম্বরে যোগাযোগ করুন
          </div>

          {short.description && (
            <h6 className="seed-title">{short.description}</h6>
          )}
        </div>
      </div>
    </Modal>
  );
}

SeedModal.propTypes = {
  open: PropTypes.bool,
  short: PropTypes.object,
  onClose: PropTypes.func,
};

SeedModal.defaultProps = {
  open: false,
  short: null,
  onClose: undefined,
};
