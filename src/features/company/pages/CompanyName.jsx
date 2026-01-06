import { useState, useEffect } from "react";
import ProductGrid from "../components/ProductGrid";
import CompanyHeader from "../components/CompanyHeader";
import SlideGallery from "../components/SlideGallery";
import { fetchAllProducts } from "@/api/authApi"; // adjust path
import { NavLink, useLocation } from "react-router-dom";
import { fetchAllCompanies } from "../../../api/authApi";

export default function CompanyName() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const companyId = pathParts[pathParts.length - 1] || "";

  const [companyName, setCompanyName] = useState(""); // <-- company name state

  useEffect(() => {
    // 1. fetch all companies
    fetchAllCompanies().then((res) => {
      const company = res.data.find((c) => c._id === companyId);
      setCompanyName(company?.banglaName || "কোম্পানী নাম পাওয়া যায়নি");
    });

    // 2. fetch all products
    fetchAllProducts().then((res) => {
      const merged = res.data
        .filter((p) => p.company?._id === companyId)
        .map((p) => ({
          id: p._id,
          name: p.productName,
          category: p.category,
          material: p.materialName,
          img: p.productImage,
          slug: p.productName?.toLowerCase().replace(/\s+/g, "-"),
        }));
      setProducts(merged);
      setLoading(false);
    });
  }, [companyId]);

  if (loading) return <div>Loading products...</div>;

  return (
    <>
      <CompanyHeader name={companyName} /> {/* <-- name pathano holo */}
      {products.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
            padding: "2rem",
          }}>
          <div
            style={{
              background: "linear-gradient(135deg, #f0f0f5, #d9e0ff)",
              padding: "2rem 3rem",
              borderRadius: "16px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              textAlign: "center",
              fontSize: "1.3rem",
              color: "#333",
              maxWidth: "500px",
            }}>
            <p>😔 এই কোম্পানির কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
            <p>অনুগ্রহ করে অন্য কোম্পানি দেখুন বা পরে আবার চেষ্টা করুন।</p>
          </div>
        </div>
      ) : (
        <>
          <ProductGrid
            items={products}
            initialCount={20}
            step={10}
          />
          <SlideGallery items={products} />
        </>
      )}
    </>
  );
}
