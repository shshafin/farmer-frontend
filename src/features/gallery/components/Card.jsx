import { NavLink } from "react-router-dom";
import { baseApi } from "../../../api";

const Card = ({ id, img, alt = "media", title, path = "gallery" }) => {
  return (
    <div className="mibkk30">
      <div className="iandtkk30">
        <NavLink
          to={`/${path}/${id}`}
          state={{ id, img, title }}>
          <img
            className="gallery-img"
            src={`${baseApi}${img}`}
            alt={alt}
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

export default Card;
