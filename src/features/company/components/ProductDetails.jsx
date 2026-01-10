import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductBackHeader from "./ProductBackHeader";
import SlideGallery from "./SlideGallery";
import { fetchProductById, fetchAllProducts } from "@/api/authApi";
import "@/assets/styles/ProductDetails.css";
import { baseApi } from "../../../api";

export default function ProductDetails() {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const productId = pathParts[pathParts.length - 1] || "";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    if (!productId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchProductById(productId);
        const currentProduct = res.data;
        setProduct(currentProduct);

        const allRes = await fetchAllProducts();
        const allProducts = allRes.data || [];

        const filtered = allProducts.filter((p) => {
          const pCompanyId = p.company?._id || p.company;
          const currCompanyId =
            currentProduct.company?._id || currentProduct.company;
          return p._id !== productId && pCompanyId === currCompanyId;
        });

        const galleryData = filtered.map((p) => ({
          id: p._id,
          name: p.productName,
          img: p.productImage,
        }));

        setGalleryItems(galleryData);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "5rem", color: "white" }}>
        লোড হচ্ছে...
      </p>
    );
  if (!product)
    return (
      <p style={{ textAlign: "center", marginTop: "5rem", color: "white" }}>
        প্রোডাক্ট পাওয়া যায়নি
      </p>
    );

  const {
    productImage,
    category,
    productName,
    materialName,
    beboharerShubidha,
    company,
    companySlug,
    foshol,
    balai,
    matra,
    beboharBidhi,
  } = product;

  const safeParse = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data || [];
    } catch {
      return [];
    }
  };

  const crops = safeParse(foshol);
  const pests = safeParse(balai);
  const doses = safeParse(matra);
  const methods = safeParse(beboharBidhi);

  const maxLength = Math.max(
    crops.length,
    pests.length,
    doses.length,
    methods.length
  );
  const groupedData = Array.from({ length: maxLength }).map((_, i) => [
    crops[i] || "",
    pests[i] || "",
    doses[i] || "",
    methods[i] || "",
  ]);

  return (
    <div style={{ marginTop: "5rem" }}>
      <div className="product-details-boxsize">
        <div className="product-details-image">
          <img
            src={`${baseApi}${productImage}`}
            alt={productName}
            onError={(e) => (e.target.src = "https://placehold.co/300x400")}
          />
        </div>
        <div className="product-details-text">
          <p className="newproduct-ctg">
            {typeof category === "object" ? category.category : category}
          </p>
          <h2 style={{ color: "white" }}>{productName}</h2>
          <p className="promatname">{materialName}</p>
          <h4>ব্যবহারের সুবিধা -:</h4>
          <p>{beboharerShubidha}</p>
        </div>
      </div>

      <div className="product-details-tablesize">
        <div className="product-details-tabletitle">
          <h2>প্রয়োগ ক্ষেত্র ও মাত্রা</h2>
          {/* এখানে style={{ display: "block" }} দিয়ে গ্রিড বন্ধ করা হলো যাতে ১টা কলামে থাকে */}
          <div
            className="product-details-cardgrid"
            style={{ display: "block" }}>
            {groupedData.map((group, i) => (
              <article
                key={i}
                className="product-details-container"
                style={{ marginBottom: "30px", width: "100%" }}>
                <div className="product-details-infocard">
                  <div className="product-details-crops">
                    {group.map(
                      (val, vIdx) =>
                        val && (
                          <div
                            key={vIdx}
                            className="product-details-cropcard">
                            {val}
                          </div>
                        )
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <ProductBackHeader
        companyName={company?.banglaName}
        companySlug={companySlug}
      />

      {galleryItems.length > 0 ? (
        <SlideGallery items={galleryItems} />
      ) : (
        <p style={{ textAlign: "center", color: "gray", margin: "2rem 0" }}>
          সম্পর্কিত অন্য কোনো প্রোডাক্ট নেই
        </p>
      )}
    </div>
  );
}
