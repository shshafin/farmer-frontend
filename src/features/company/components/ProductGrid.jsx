import { useMemo, useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { baseApi } from "../../../api";
import ProductDetails from "./ProductDetails";

/** Helper: safe slug from Bangla/English names */

/** Category → heading CSS class map */
const categoryHeadingClass = {
  কীটনাশক: "kitnacxc_7x",
  ছত্রাকনাশক: "chotrcxc_7x",
  অনুখাদ্য: "unuxc_7x",
  আগাছানাশক: "agacxc_7x",
};

/** Category header component */
function CategorySection({ title, isExpanded, onToggle }) {
  const cls = categoryHeadingClass[title] || "";
  return (
    <div className={`product-section ${cls}`}>
      <div
        className="product-section__header"
        onClick={onToggle}>
        <div className="product-section__title">{title}</div>
        <div className={`product-section__icon ${isExpanded ? "is-open" : ""}`}>
          <svg
            className="product-section__icon-svg"
            viewBox="0 0 24 24"
            aria-hidden="true">
            <path d="M7 14l5-5 5 5z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Helper: filter products by category & company */
const filterProducts = (products, categoryFilter, companyFilter) =>
  products.filter((p) => {
    const matchesCategory = categoryFilter
      ? p.category === categoryFilter
      : true;
    const matchesCompany = companyFilter ? p.company === companyFilter : true;
    return matchesCategory && matchesCompany;
  });

export default function ProductGrid({
  items = [],
  initialCount = 20,
  step = 10,
  categoryFilter = null,
  companyFilter = null,
}) {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [visible, setVisible] = useState(initialCount);
  const sentinelRef = useRef(null);

  console.log("item", items);

  /** Filtered products */
  const filteredItems = useMemo(
    () => filterProducts(items, categoryFilter, companyFilter),
    [items, categoryFilter, companyFilter]
  );

  /** Group by category and order */
  const grouped = useMemo(() => {
    const byCat = new Map();
    filteredItems.forEach((it) => {
      const cat = it.category || "অন্যান্য";
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat).push(it);
    });

    // sort items by id
    for (const arr of byCat.values())
      arr.sort((a, b) => String(a.id).localeCompare(String(b.id), "en"));

    // return array sorted by preferred order
    const preferredOrder = ["কীটনাশক", "ছত্রাকনাশক", "আগাছানাশক", "অনুখাদ্য"];
    return Array.from(byCat.entries()).sort((a, b) => {
      const ia = preferredOrder.indexOf(a[0]);
      const ib = preferredOrder.indexOf(b[0]);
      if (ia === -1 && ib === -1) return a[0].localeCompare(b[0], "bn");
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [filteredItems]);

  /** Initialize expanded categories */
  useEffect(() => {
    const allCategories = new Set(grouped.map(([cat]) => cat));
    setExpandedCategories(allCategories);
  }, [grouped]);

  /** Reset visible count on items change */
  useEffect(() => setVisible(initialCount), [initialCount, items]);

  /** Infinite scroll observer */
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            setVisible((v) => Math.min(v + step, filteredItems.length));
        });
      },
      { rootMargin: "400px 0px", threshold: 0.01 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [filteredItems.length, step]);

  /** Toggle category expansion */
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };

  /** Render */
  return (
    <div className="product-align">
      {grouped.map(([cat, arr]) => {
        const isExpanded = expandedCategories.has(cat);
        return (
          <div
            key={cat}
            className="category-block">
            <CategorySection
              title={cat}
              isExpanded={isExpanded}
              onToggle={() => toggleCategory(cat)}
            />
            {isExpanded && (
              <div className="category-row">
                {arr
                  .slice(0, Math.max(0, Math.min(arr.length, visible)))
                  .map((item) => {
                    const { id, name, category, img } = item;
                    const url = `/productdetails/${id}`;
                    const categoryClass =
                      cat === "কীটনাশক"
                        ? "colorboxk"
                        : cat === "ছত্রাকনাশক"
                        ? "colorboxc"
                        : cat === "আগাছানাশক"
                        ? "colorboxw"
                        : cat === "অনুখাদ্য"
                        ? "colorboxf"
                        : "";
                    return (
                      <div
                        className="si"
                        key={`item-${id}`}>
                        <NavLink
                          to={url}
                          className="co product-card"
                          title={name}
                          aria-label={`${name} - ${category}`}>
                          <div className="product-card__media">
                            <img
                              src={`${baseApi}${img}`}
                              alt={name}
                              loading="lazy"
                            />
                          </div>
                          <div className="product-card__body">
                            <p
                              className={`product-card__category ${categoryClass}`}>
                              <span className="product-card__title">
                                {name}
                              </span>
                              <br />
                              {category}
                            </p>
                          </div>
                        </NavLink>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
      <div ref={sentinelRef} />
    </div>
  );
}
