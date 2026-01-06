import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "../styles/adminScoped.css";
import TrashIcon from "@/assets/IconComponents/Trash";
import EditBadgeIcon from "@/assets/IconComponents/EditBadgeIcon";
import {
  fetchAllProducts,
  deleteProduct as deleteProductApi,
} from "@/api/authApi";

export default function ManageProductDetailsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [removing, setRemoving] = useState({});
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await fetchAllProducts();
        if (res?.success) {
          setProducts(res.data);
        } else {
          toast.error("Failed to load products");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching products");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // ✅ Filtered products
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [
        product.productName,
        product.materialName,
        product.category,
        product.company?.englishName,
        product.company?.banglaName,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  // ✅ Delete product
  const handleDelete = (product) => setConfirmProduct(product);

  const handleConfirmDelete = async () => {
    if (!confirmProduct) return;
    const product = confirmProduct;
    setRemoving((prev) => ({ ...prev, [product._id]: true }));
    try {
      const res = await deleteProductApi(product._id);
      if (res?.success) {
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
        toast.success(`"${product.productName}" removed successfully.`);
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting product");
    } finally {
      setRemoving((prev) => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
      setConfirmProduct(null);
    }
  };

  const handleCancelDelete = () => setConfirmProduct(null);

  // ✅ Expand/collapse summary
  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="content-wrapper _scoped_admin">
        <div className="p-5 text-center text-muted">Loading products...</div>
      </div>
    );
  }

  return (
    <div
      className="content-wrapper _scoped_admin manage-crop-details-page"
      style={{ minHeight: "839px" }}>
      <Toaster position="top-right" />

      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Manage Product Details</h1>
              <p className="text-muted mt-1 mb-0">
                Review product highlights, usage summaries, and delete outdated
                entries.
              </p>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
                </li>
                <li className="breadcrumb-item">
                  <NavLink to="/admin/products/add">Add Product</NavLink>
                </li>
                <li className="breadcrumb-item active">
                  Manage Product Details
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="crop-details-shell">
            <div className="crop-details-toolbar">
              <div className="crop-details-stats">
                <span className="crop-details-total">
                  Total Products: {products.length}
                </span>
                <span className="crop-details-visible">
                  Showing: {filteredProducts.length}
                </span>
              </div>
              <div className="crop-details-controls">
                <div className="crop-details-search">
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by company, product, or category..."
                  />
                </div>
              </div>
            </div>

            <div className="crop-details-grid">
              {filteredProducts.map((product) => {
                const isExpanded = expandedIds.has(product._id);
                const asString = (val) => {
                  if (!val) return "";
                  if (Array.isArray(val)) return val.join(", ");
                  return val;
                };

                const summaryEntries = [
                  {
                    key: "beboharerShubidha",
                    label: "উপকারিতা ও ব্যবহার সংক্ষেপ",
                    value: asString(product.beboharerShubidha),
                  },
                  {
                    key: "foshol",
                    label: "ফসল",
                    value: asString(product.foshol),
                  },
                  {
                    key: "balai",
                    label: "বালাই",
                    value: asString(product.balai),
                  },
                  {
                    key: "matra",
                    label: "মাত্রা",
                    value: asString(product.matra),
                  },
                  {
                    key: "beboharBidhi",
                    label: "ব্যবহারবিধি",
                    value: asString(product.beboharBidhi),
                  },
                ].filter((item) => item.value); // খালি value থাকলে remove করবে

                const hasHidden = summaryEntries.length > 2;
                const visibleEntries =
                  isExpanded || !hasHidden
                    ? summaryEntries
                    : summaryEntries.slice(0, 2);

                return (
                  <article
                    key={product._id}
                    className={`crop-detail-card ${removing[product._id] ? "is-removing" : ""
                      }`}>
                    {/* Action buttons */}
                    <div className="crop-detail-actions">
                      <button
                        type="button"
                        className="crop-detail-edit-icon"
                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                        title="Edit">
                        <EditBadgeIcon
                          width={20}
                          height={20}
                          strokeWidth={1.8}
                        />
                      </button>
                      <button
                        type="button"
                        className="crop-detail-delete-icon"
                        onClick={() => handleDelete(product)}
                        disabled={Boolean(removing[product._id])}
                        title="Delete this product">
                        <TrashIcon
                          width={20}
                          height={20}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>

                    <div className="crop-detail-media">
                      <img
                        src={product.productImage}
                        alt={product.productName}
                      />
                      <span className="crop-detail-category badge-info">
                        {product.category}
                      </span>
                    </div>

                    <div className="crop-detail-body">
                      <div className="crop-detail-header">
                        <div>
                          <h3 className="crop-detail-title">
                            {product.productName}
                          </h3>
                          <p className="crop-detail-meta">
                            <span>
                              {product.company?.englishName ||
                                "Unknown Company"}
                            </span>
                            <span
                              className="divider"
                              aria-hidden="true">
                              |
                            </span>
                            <span>{product.materialName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="crop-detail-summary">
                        <div
                          className={`crop-detail-summary-inner ${!isExpanded && hasHidden ? "is-collapsed" : ""
                            }`}>
                          {visibleEntries.map(({ key, label, value }) => (
                            <div
                              key={key}
                              className="crop-detail-summary-item">
                              <span className="summary-label">{label}</span>
                              <p className="summary-value">{value}</p>
                            </div>
                          ))}
                        </div>
                        {hasHidden && (
                          <button
                            type="button"
                            className="crop-detail-toggle"
                            onClick={() => toggleExpanded(product._id)}
                            aria-expanded={isExpanded}>
                            {isExpanded
                              ? "Show less"
                              : `View more (${summaryEntries.length - visibleEntries.length
                              })`}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {!filteredProducts.length && (
              <div className="crop-details-empty">
                <h4>No products found</h4>
                <p>
                  Try adjusting your filters or search terms to locate the
                  product details you are looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Confirm Delete Modal */}
      {confirmProduct && (
        <div
          className="admin-modal-backdrop"
          role="presentation">
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true">
            <div className="admin-modal-header">
              <h5 className="mb-0">Delete product detail?</h5>
            </div>
            <div className="admin-modal-body">
              <p className="mb-2">
                Are you sure you want to delete{" "}
                <strong>{confirmProduct.productName}</strong>?
              </p>
              <p className="text-muted mb-0">This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleCancelDelete}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Removed */}
    </div>
  );
}
