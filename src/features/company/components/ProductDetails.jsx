import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductBackHeader from "./ProductBackHeader";
import SlideGallery from "./SlideGallery";
import { fetchProductById } from "@/api/authApi";
import { fetchAllProducts } from "@/api/authApi"; // assume API to fetch all products
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

    setLoading(true);
    fetchProductById(productId)
      .then((res) => {
        console.log("single product", res.data);
        setProduct(res.data);
        return res.data;
      })
      .then(async (currentProduct) => {
        console.log("currentProduct", currentProduct);
        // Fetch all products
        const allRes = await fetchAllProducts();
        console.log("allRes", allRes.data);
        const allProducts = allRes.data || [];

        // Filter products with same company._id and category
        const filtered = allProducts.filter(
          (p) =>
            p._id !== productId && // exclude current product itself
            p.company?._id === currentProduct.company?._id &&
            p.category === currentProduct.category
        );

        // Map for gallery
        const galleryData = filtered.map((p) => ({
          id: p._id,
          name: p.productName,
          slug:
            p._id ||
            p.productName
              .toString()
              .trim()
              .toLowerCase()
              .normalize("NFKD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-"),
          img: p.productImage,
        }));

        setGalleryItems(galleryData);
      })
      .catch((err) => console.error("Error fetching product:", err))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  if (!product)
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Product not found
      </p>
    );

  const {
    productImage,
    category,
    name: productName,
    materialName,
    beboharerShubidha,
    company,
    companySlug,
    foshol = "[]",
    balai = "[]",
    matra = "[]",
    beboharBidhi = "[]",
  } = product;

  console.log("gallery", galleryItems);

  // Table data
  const tableData = [
    {
      crop: JSON.parse(foshol || "[]").join(", "),
      pest: JSON.parse(balai || "[]").join(", "),
      dose: JSON.parse(matra || "[]").join(", "),
      method: JSON.parse(beboharBidhi || "[]").join(", "),
    },
  ];

  return (
    <div style={{ marginTop: "5rem" }}>
      <div className="product-details-boxsize">
        <div className="product-details-image">
          <img
            src={`${baseApi}${productImage}`}
            alt={productName || "product image"}
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/300x400?text=No+Image";
            }}
          />
        </div>

        <div className="product-details-text">
          <p className="newproduct-ctg">{category}</p>
          <h2 style={{ color: "white" }}>{productName}</h2>
          <p className="promatname">{materialName}</p>
          <h4>ব্যবহারের সুবিধা -:</h4>
          <p>{beboharerShubidha}</p>
        </div>
      </div>

      <div className="product-details-tablesize">
        <div className="product-details-tabletitle">
          <h2>প্রয়োগ ক্ষেত্র ও মাত্রা</h2>
          <div className="product-details-cardgrid">
            {tableData.map((item, i) => (
              <article
                key={i}
                className="product-details-container">
                <div className="product-details-infocard">
                  <div className="product-details-crops">
                    {item.crop.split(",").map((crop, index) => (
                      <div
                        key={index}
                        className="product-details-cropcard">
                        {crop.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="product-details-infocard">
                  <div className="product-details-crops">
                    {item.pest.split(",").map((pest, index) => (
                      <div
                        key={index}
                        className="product-details-cropcard">
                        {pest.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="product-details-infocard">
                  <div className="product-details-crops">
                    {item.dose.split(",").map((dose, index) => (
                      <div
                        key={index}
                        className="product-details-cropcard">
                        {dose.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="product-details-infocard">
                  <div className="product-details-crops">
                    {item.method.split(",").map((method, index) => (
                      <div
                        key={index}
                        className="product-details-cropcard">
                        {method.trim()}
                      </div>
                    ))}
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

      {galleryItems.length > 0 && <SlideGallery items={galleryItems} />}
    </div>
  );
}
