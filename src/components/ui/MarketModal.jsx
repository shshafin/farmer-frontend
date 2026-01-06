import { baseApi } from "../../api";

export default function MarketModal({
  open,
  onClose,
  name,
  profileImage,
  location,
  priceImage,
  contact,
  description,
  timeText,
  showContact = false, // নতুন prop
}) {
  if (!open) return null;

  return (
    <div
      id="distirctmodal"
      style={{ display: "block" }}>
      <div id="distirct-modal-box">
        <div className="bazar_data seed_data">
          <div className="baxuse4x">
            <a href={`?krishokarea_user=${name}`}>
              <img
                className="distirct-img"
                src={`${baseApi}${profileImage}`}
                alt="bazar user image"
              />
              <h4>
                {(() => {
                  if (!name) return "";
                  const parts = name.trim().split(/\s+/);
                  if (parts.length > 1) {
                    return `${parts[0]} ${parts[1].slice(0, 2)}..`;
                  }
                  return name;
                })()}
                <span>{location}</span>
              </h4>
            </a>
            <span className="ubzx_timex">{timeText}</span>
          </div>

          <div className="bazar-img-details">
            <div className="bazar-main-img">
              <img
                className="distirct-img"
                src={`${baseApi}${priceImage}`}
                alt="bazar price image"
              />
            </div>
            <div className="bazar_xrx4">
              <div className="addtoobuy">
                {showContact && (
                  <span className="addtoocard">
                    {contact} এই নাম্বারে যোগাযোগ করুন
                  </span>
                )}
              </div>
              <h6 dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          </div>
        </div>
        <div
          id="disclose"
          onClick={onClose}>
          X
        </div>
      </div>
    </div>
  );
}
