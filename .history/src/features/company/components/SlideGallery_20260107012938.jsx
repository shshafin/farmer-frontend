import { useCallback, useRef } from "react";
import { NavLink } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"; // ← named import
import "../styles/Slide.css";
import nextBtn from "@/assets/icons/nextBtn.png";
import PrevBtn from "@/assets/icons/backBtn.png";
import { baseApi } from "../../../api";

export default function SlideGallery({ items = [] }) {
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      dragFree: true, // momentum + “follow speed”
      containScroll: "trimSnaps",
      skipSnaps: false,
      speed: 25,
      inViewThreshold: 0.5,
    },
    [
      autoplay.current,
      WheelGesturesPlugin(), // ← no target; plugin will attach to viewport
    ]
  );

  const onPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const onNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const data = items.map((p) => ({
    ...p,
    slug:
      p.slug ||
      p.name
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
  }));

  return (
    <div className="progallery-wrap relative">
      <button
        type="button"
        onClick={onPrev}
        className="pro-back left absolute top-1/2 -translate-y-1/2 z-10">
        <img
          src={PrevBtn}
          alt="Prev"
        />
      </button>

      <div
        className="embla"
        ref={emblaRef}>
        <div className="embla__container">
          {data.map((p) => (
            <div
              className="embla__slide"
              key={p.id}>
              <NavLink
                to={`/productdetails/${p.id}`}
                title={p.name}
                className="block">
                <img
                  className="sizeprocut50k"
                  src={`${baseApi}${p.img}`}
                  alt={p.name}
                />
              </NavLink>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="pro-back right absolute top-1/2 -translate-y-1/2 z-10">
        <img
          src={nextBtn}
          alt="Next"
        />
      </button>
    </div>
  );
}
