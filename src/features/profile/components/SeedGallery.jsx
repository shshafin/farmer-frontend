import PropTypes from "prop-types";

export default function SeedGallery({ seeds, onDelete }) {
  if (!seeds?.length) {
    return <div className="empty-state">বর্তমানে কোনো বীজ বাজার আইটেম নেই</div>;
  }

  return (
    <div className="seed-gallery">
      {seeds.map((seed) => (
        <div className="seed-gallery-item" key={seed.id}>
          <img src={seed.image || seed.mediaUrl} alt={seed.title || "Seed item"} />
          {onDelete && (
            <button
              type="button"
              className="seed-delete-btn"
              onClick={() => onDelete(seed.id)}
              aria-label="Delete seed item"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

SeedGallery.propTypes = {
  seeds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      image: PropTypes.string,
      mediaUrl: PropTypes.string,
      title: PropTypes.string,
    })
  ),
  onDelete: PropTypes.func,
};

SeedGallery.defaultProps = {
  seeds: [],
  onDelete: undefined,
};
