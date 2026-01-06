import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import useEmblaCarousel from "embla-carousel-react";
import { NavLink } from "react-router-dom";
import SeedModal from "./SeedModal";
import "@/features/bizzShorts/styles/BizzShorts.css";
import { dummyShorts } from "../data/dummyShorts";
import { baseApi } from "../../../api";

export default function BizzShortsCarousel({
  items,
  initialItems = dummyShorts,
  title = "বীজ গ্যালেরি",
  description = "সর্বশেষ বীজ তালিকা দেখতে সোয়াইপ করুন",
  allowDelete = true,
  showMeta = true,
  linkBase, // when provided, each card becomes a NavLink to `${linkBase}/${id}`
  openSeedModalOnClick = false,
  onDelete,
  loadMore,
  hasMore = false,
  loadMoreOffset = 2,
  className = "",
}) {
  const [localShorts, setLocalShorts] = useState(initialItems);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    skipSnaps: false,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [selectedShort, setSelectedShort] = useState(null);

  const usingControlledItems = Array.isArray(items);

  useEffect(() => {
    if (!usingControlledItems) {
      setLocalShorts(initialItems);
    }
  }, [initialItems, usingControlledItems]);

  const displayedShorts = useMemo(
    () => (usingControlledItems ? items ?? [] : localShorts ?? []),
    [items, localShorts, usingControlledItems]
  );

  const displayedShortsLength = displayedShorts.length;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const updateScrollState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const requestMore = useCallback(async () => {
    if (!loadMore || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      await Promise.resolve(loadMore());
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const maybeLoadMore = useCallback(() => {
    if (!emblaApi || !loadMore || !hasMore || isLoadingMore) return;
    if (!displayedShortsLength) return;

    const selectedIndex = emblaApi.selectedScrollSnap();
    const threshold = Math.max(
      0,
      displayedShortsLength - Math.max(1, loadMoreOffset)
    );

    if (selectedIndex >= threshold) {
      requestMore();
    }
  }, [
    emblaApi,
    displayedShortsLength,
    hasMore,
    isLoadingMore,
    loadMore,
    loadMoreOffset,
    requestMore,
  ]);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollState();
    maybeLoadMore();

    const handleSelect = () => {
      updateScrollState();
      maybeLoadMore();
    };

    emblaApi.on("select", handleSelect);
    emblaApi.on("reInit", handleSelect);

    return () => {
      emblaApi.off("select", handleSelect);
      emblaApi.off("reInit", handleSelect);
    };
  }, [emblaApi, maybeLoadMore, updateScrollState]);

  useEffect(() => {
    emblaApi?.reInit();
    updateScrollState();
  }, [displayedShortsLength, emblaApi, updateScrollState]);

  useEffect(() => {
    maybeLoadMore();
  }, [maybeLoadMore, displayedShortsLength]);

  const handleDelete = useCallback(
    (id) => {
      if (!allowDelete) return;
      if (onDelete) {
        onDelete(id);
        return;
      }
      if (!usingControlledItems) {
        setLocalShorts((prev) => prev.filter((item) => item.id !== id));
      }
    },
    [allowDelete, onDelete, usingControlledItems]
  );

  if (!displayedShortsLength) return null;

  const composedClassName = ["bizz-shorts", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={composedClassName}>
      <header className="bizz-shorts__header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="bizz-shorts__controls">
          <button
            className="bizz-shorts__nav"
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <polyline
                points="15 18 9 12 15 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="bizz-shorts__nav"
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <polyline
                points="9 6 15 12 9 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <div
        className="bizz-shorts__viewport"
        ref={emblaRef}>
        <div className="bizz-shorts__container">
          {displayedShorts.map((short) => (
            <article
              key={short.id}
              className="bizz-shorts__slide">
              <div
                className="bizz-shorts__card"
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (openSeedModalOnClick) {
                    setSelectedShort(short);
                    setSeedModalOpen(true);
                    return;
                  }
                  if (linkBase) {
                    // allow NavLink navigation by programmatic push
                    window.location.href = `${linkBase}/${short.id}`;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (openSeedModalOnClick) {
                      setSelectedShort(short);
                      setSeedModalOpen(true);
                    } else if (linkBase) {
                      window.location.href = `${linkBase}/${short.id}`;
                    }
                  }
                }}>
                <img
                  src={`${baseApi}${short.mediaUrl}`}
                  alt={short.title}
                  loading="lazy"
                  className="bizz-shorts__image"
                />
                {showMeta && (
                  <div className="bizz-shorts__meta">
                    <span className="bizz-shorts__title">{short.title}</span>
                    <span className="bizz-shorts__credit">
                      {short.photographer}
                    </span>
                  </div>
                )}
                {allowDelete && (
                  <button
                    type="button"
                    className="bizz-shorts__delete"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDelete(short.id);
                    }}
                    aria-label={`Remove ${short.title}`}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      aria-hidden="true">
                      <polyline
                        points="3 6 5 6 21 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="10"
                        y1="11"
                        x2="10"
                        y2="17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="14"
                        y1="11"
                        x2="14"
                        y2="17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <SeedModal
        open={seedModalOpen}
        short={selectedShort}
        onClose={() => setSeedModalOpen(false)}
      />
      {isLoadingMore && (
        <div
          className="bizz-shorts__loading"
          aria-live="polite">
          আরও বীজ লোড হচ্ছে...
        </div>
      )}
    </section>
  );
}

BizzShortsCarousel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      mediaUrl: PropTypes.string.isRequired,
      photographer: PropTypes.string,
    })
  ),
  initialItems: PropTypes.array,
  title: PropTypes.string,
  description: PropTypes.string,
  allowDelete: PropTypes.bool,
  showMeta: PropTypes.bool,
  onDelete: PropTypes.func,
  loadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  loadMoreOffset: PropTypes.number,
  className: PropTypes.string,
  linkBase: PropTypes.string,
};

BizzShortsCarousel.defaultProps = {
  items: undefined,
  initialItems: dummyShorts,
  title: "বীজ গ্যালেরি",
  description: "সর্বশেষ বীজ তালিকা দেখতে সোয়াইপ করুন",
  allowDelete: true,
  showMeta: true,
  onDelete: undefined,
  loadMore: undefined,
  hasMore: false,
  loadMoreOffset: 2,
  className: "",
  linkBase: undefined,
  openSeedModalOnClick: false,
};
