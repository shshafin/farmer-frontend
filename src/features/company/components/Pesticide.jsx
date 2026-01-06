import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import SearchIcon from "@/assets/IconComponents/SearchIcon";

import PesticideList from "./PesticideList";

import styles from "../styles/Pesticide.module.css";

/**
 * @param {Object} props
 * @param {Array<{title:string, name:string, rating:number, location:string}>} props.items
 */

export default function Pesticide({ items = [] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const onSearch = useCallback((e) => setQuery(e.target.value), []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((it) =>
      [it.banglaName, it.englishName, it.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        el.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.page}>
      {/* Page header */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          বাংলাদেশের কীটনাশক আমদানী, বাজারজাতকারী ও পরিবেশক কোম্পানীর তালিকাসমূহ
        </h1>

        {/* Replace hero subtext with the search control */}
        <div className={styles.heroSearch}>
          <div className={styles.searchWrap}>
            <SearchIcon className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={onSearch}
              placeholder="খুঁজুন...  (Press ⌘/Ctrl + K)"
              className={styles.searchInput}
            />
          </div>
        </div>
      </section>

      {/* List */}
      <section className={styles.section}>
        <PesticideList items={filtered} />
      </section>
    </div>
  );
}
