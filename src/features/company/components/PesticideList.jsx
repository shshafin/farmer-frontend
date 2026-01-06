import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import PesticideCard from "./PesticideCard";
import styles from "../styles/Pesticide.module.css";

/**
 * Infinite grid capped at 60 total.
 * Loads in chunks (default 12) as you scroll.
 */
const CHUNK = 12;
const MAX_ITEMS = 60;

export default function PesticideList({ items = [] }) {
  const [count, setCount] = useState(0);
  const sentinelRef = useRef(null);

  const total = Math.min(items.length, MAX_ITEMS);

  // Reset when items change
  useEffect(() => {
    setCount(Math.min(total, CHUNK));
  }, [total, items]);

  const visible = useMemo(() => items.slice(0, count), [items, count]);

  const loadMore = useCallback(() => {
    setCount((c) => Math.min(total, c + CHUNK));
  }, [total]);

  useEffect(() => {
    if (count >= total) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) loadMore();
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [count, total, loadMore]);

  return (
    <>
      <div className={styles.grid}>
        {visible.map((it, idx) => (
          <PesticideCard
            key={`${it.name ?? it.title}-${idx}`}
            title={it.banglaName}
            name={it.englishName}
            rating={Number(it.rating) || 0}
            location={it.location}
            url={it._id}
          />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      {count < total && (
        <div
          ref={sentinelRef}
          className={styles.sentinel}
        />
      )}
      {items.length === 0 && <div className={styles.empty}>কোন ফলাফল নেই</div>}
    </>
  );
}
