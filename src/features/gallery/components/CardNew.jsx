// CardNew.jsx
import { NavLink } from "react-router-dom";

const CardNew = ({ id, img, title, path = "gallery" }) => {
  return (
    <div className="mibkk30">
      <div className="iandtkk30">
        <NavLink
          to={`/${path}/${id}`}
          state={{
            id,
            img, // already has baseApi from GallerySection
            title,
            description: title, // fallback
          }}>
          <img
            className="gallery-img"
            src={img}
            alt={title}
          />
        </NavLink>
        <p
          className="itkk30"
          title={title}>
          {title}
        </p>
      </div>
    </div>
  );
};

export default CardNew;
