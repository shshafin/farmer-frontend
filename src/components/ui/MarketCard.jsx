import { baseApi } from "../../api";


export default function MarketCard({
  id,
  image,
  timeTitle,
  timeText,
  description,
  onClick,
}) {
  console.log(image, description, "market card");
  return (
    <button
      className="minx_dbpx58 minx_dbpx14"
      disid={id}
      onClick={() => onClick(id)}>
      <span
        hidden
        className="obj">
        {id}
      </span>
      <div className="dixbp_xr5">
        <div className="minxi_imgseslesx45x">
          <img
            src={`${baseApi}${image}`}
            alt=""
          />
        </div>
        <div className="minxd_imagxds46">
          <h4>
            <p title={timeTitle}>
              <time
                style={{ fontSize: "small" }}
                className="timeago">
                {timeText}
              </time>
            </p>
            {description}
          </h4>
        </div>
      </div>
    </button>
  );
}
