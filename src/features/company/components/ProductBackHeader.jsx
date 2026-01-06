import { NavLink, useLocation, useNavigate } from "react-router-dom";

export default function ProductBackHeader({
  companyName = "এ সি আই ক্রপ কেয়ার 101", // dynamic title
  companySlug = "aci-crop-care-101", // used for the /company URL
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get the previous URL from sessionStorage (you can set it when navigating)
  const previousUrl = sessionStorage.getItem("previousUrl");

  // When user clicks "History" link, go back or to previous stored URL
  const handleBack = () => {
    if (previousUrl) navigate(previousUrl);
    else navigate(-1);
  };

  return (
    <>
      {/* ==== BACK SECTION ==== */}
      <div className="back">
        <NavLink to="/companyes" title="কোম্পানীসমূহতে ফিরে যান">
          <span>⇦</span> কোম্পানীসমূহতে ফিরে যান
        </NavLink>

        <p></p>

        <button
          onClick={handleBack}
          className="link-btn"
          title={companyName || "ইতিহাসে ফিরে যান"}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            font: "inherit",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <a><span>⇦</span> {companyName + " ফিরে যান"}</a>
        </button>
      </div>

      {/* ==== RELATED HEADER ==== */}
      <div className="related-product-header">
        <h2 className="m-a">{companyName}</h2>
      </div>
    </>
  );
}
