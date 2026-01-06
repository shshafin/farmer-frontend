import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductBackHeader from "./ProductBackHeader";
import SlideGallery from "./SlideGallery";
import { fetchProductById, fetchAllProducts } from "@/api/authApi";
import "@/assets/styles/ProductDetails.css";
import { baseApi } from "../../../api";

export default function ProductDetails() {
  const location = useLocation();
  // productId সরাসরি useParams থেকে নেওয়া ভালো, অথবা তোমার logic ঠিক আছে
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
        // ১. কারেন্ট প্রোডাক্ট ফেচ করা
        const res = await fetchProductById(productId);
        const currentProduct = res.data;
        setProduct(currentProduct);

        // ২. সব প্রোডাক্ট ফেচ করা রিলেটেড গ্যালারির জন্য
        const allRes = await fetchAllProducts();
        const allProducts = allRes.data || [];

        // ৩. ফিল্টারিং লজিক (নিখুঁত করার জন্য)
        const filtered = allProducts.filter((p) => {
          // IDs extract করা (Object হোক বা String)
          const pCompanyId = p.company?._id || p.company;
          const currCompanyId =
            currentProduct.company?._id || currentProduct.company;

          const pCategoryId = p.category?._id || p.category;
          const currCategoryId =
            currentProduct.category?._id || currentProduct.category;

          return (
            p._id !== productId &&
            pCompanyId === currCompanyId &&
            pCategoryId === currCategoryId
          );
        });

        // ৪. গ্যালারি ডেটা ম্যাপ করা
        const galleryData = filtered.map((p) => ({
          id: p._id,
          name: p.productName,
          img: p.productImage,
        }));

        setGalleryItems(galleryData);
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]); // productId চেঞ্জ হলেই আবার রান হবে

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "5rem", color: "white" }}>
        লোড হচ্ছে...
      </p>
    );
  if (!product)
    return (
      <p style={{ textAlign: "center", marginTop: "5rem", color: "white" }}>
        প্রোডাক্ট পাওয়া যায়নি
      </p>
    );

  // ডিস্ট্রাকচারিং (সেফটি চেক সহ)
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

  // টেবিল ডেটা পার্সিং
  const safeParse = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data || [];
    } catch {
      return [];
    }
  };

  const tableData = [
    {
      crop: safeParse(foshol).join(", "),
      pest: safeParse(balai).join(", "),
      dose: safeParse(matra).join(", "),
      method: safeParse(beboharBidhi).join(", "),
    },
  ];

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
          <div className="product-details-cardgrid">
            {tableData.map((item, i) => (
              <article
                key={i}
                className="product-details-container">
                {/* Crops, Pest, Dose, Method Card Rendering */}
                {[item.crop, item.pest, item.dose, item.method].map(
                  (list, idx) => (
                    <div
                      key={idx}
                      className="product-details-infocard">
                      <div className="product-details-crops">
                        {list.split(",").map((val, vIdx) => (
                          <div
                            key={vIdx}
                            className="product-details-cropcard">
                            {val.trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </article>
            ))}
          </div>
        </div>
      </div>

      <ProductBackHeader
        companyName={company?.banglaName}
        companySlug={companySlug}
      />

      {/* গ্যালারি আইটেম থাকলে দেখাবে */}
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
