import React, { useState, useRef, useCallback, useEffect } from "react";

const StarRating = ({
  value,                  // if provided => controlled
  defaultValue = 0,       // used only when uncontrolled
  onChange,
  max = 5,
  step = 0.5,
  allowZero = true,
  disabled,
  diable,                 // alias
  size = 24,
  activeColor = "#ffc107",
  inactiveColor = "#e4e5e9",
  showHint = true,
}) => {
  const isDisabled = Boolean(disabled ?? diable);
  const isControlled = value !== undefined && value !== null;

  // Uncontrolled internal value
  const [internal, setInternal] = useState(defaultValue);

  const currentBase = isControlled ? Number(value) : Number(internal);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactiveValue, setInteractiveValue] = useState(currentBase);

  const containerRef = useRef(null);

  // keep interactiveValue in sync when external value changes (controlled)
  useEffect(() => {
    if (isControlled) setInteractiveValue(Number(value));
    // NOTE: no sync on interaction end; avoids "snap back"
  }, [isControlled, value]);

  const minVal = allowZero ? 0 : step;

  const clampQuantize = useCallback(
    (n) => {
      const q = Math.round(n / step) * step;
      return Math.max(minVal, Math.min(max, q));
    },
    [step, minVal, max]
  );

  const calcFromClientX = useCallback(
    (clientX) => {
      if (!containerRef.current) return minVal;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const pct = rect.width ? x / rect.width : 0;
      return clampQuantize(pct * max);
    },
    [clampQuantize, max, minVal]
  );

  const commit = useCallback(
    (finalVal) => {
      if (!isControlled) setInternal(finalVal);
      onChange?.(finalVal);
    },
    [isControlled, onChange]
  );

  // Pointer lifecycle
  const startAt = useCallback(
    (clientX) => {
      if (isDisabled) return;
      setIsInteracting(true);
      setInteractiveValue(calcFromClientX(clientX));
    },
    [isDisabled, calcFromClientX]
  );

  const moveAt = useCallback(
    (clientX) => {
      if (isDisabled || !isInteracting) return;
      setInteractiveValue(calcFromClientX(clientX));
    },
    [isDisabled, isInteracting, calcFromClientX]
  );

  const endAt = useCallback(
    (clientX) => {
      if (isDisabled || !isInteracting) return;
      const v = calcFromClientX(clientX);
      setIsInteracting(false);
      setInteractiveValue(v);
      commit(v); // <-- persist selection (no reset)
    },
    [isDisabled, isInteracting, calcFromClientX, commit]
  );

  // Global listeners so dragging outside still works
  useEffect(() => {
    if (!isInteracting) return;
    const onMouseMove = (e) => moveAt(e.clientX);
    const onMouseUp   = (e) => endAt(e.clientX);
    const onTouchMove = (e) => { if (e.touches[0]) { e.preventDefault(); moveAt(e.touches[0].clientX); } };
    const onTouchEnd  = (e) => { if (e.changedTouches[0]) endAt(e.changedTouches[0].clientX); };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isInteracting, moveAt, endAt]);

  // Handlers for initial down inside the control
  const onMouseDown = (e) => startAt(e.clientX);
  const onTouchStart = (e) => e.touches[0] && startAt(e.touches[0].clientX);

  const displayValue = isInteracting ? interactiveValue : currentBase;

  // Render one star (supports half overlay)
  const renderStar = (i) => {
    const index = i + 1; // star # (1..max)
    const isFull = displayValue >= index;
    const isHalf = !isFull && displayValue >= index - 0.5;

    const wrap = {
      position: "relative",
      display: "inline-block",
      width: `${size}px`,
      height: `${size}px`,
      margin: "0 2px",
      lineHeight: `${size}px`,
      fontSize: `${size}px`,
    };

    return (
      <div key={index} style={wrap} aria-hidden="true">
        <span
          style={{
            position: "absolute",
            inset: 0,
            color: inactiveColor,
            textAlign: "center",
            userSelect: "none",
          }}
        >
          ★
        </span>
        <span
          style={{
            position: "absolute",
            inset: 0,
            width: isFull ? "100%" : isHalf ? "50%" : "0%",
            overflow: "hidden",
            color: activeColor,
            textAlign: "left",
            userSelect: "none",
          }}
        >
          ★
        </span>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "fit-content",
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
        position: "relative",
        cursor: isDisabled ? "default" : "pointer",
        userSelect: "none",
        padding: "8px 4px",
        touchAction: "none",
        opacity: isDisabled ? 0.6 : 1,
        background: "transparent",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      role="slider"
      aria-valuemin={allowZero ? 0 : step}
      aria-valuemax={max}
      aria-valuenow={displayValue}
      aria-disabled={isDisabled}
    >
      {Array.from({ length: max }).map((_, i) => renderStar(i))}

      {showHint && !isDisabled && isInteracting && (
        <div
          style={{
            position: "absolute",
            top: `-${Math.max(28, size)}px`,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "12px",
            fontWeight: "bold",
            color: "#1f2937",
            background: "#fff",
            padding: "2px 8px",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,.15)",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {displayValue.toFixed(1)}
        </div>
      )}
    </div>
  );
};

export default StarRating;