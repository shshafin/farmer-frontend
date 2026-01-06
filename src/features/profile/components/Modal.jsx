import { useEffect } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  header,
  footer,
  size = "md",
  children,
  className = "",
  backdropZIndex,
  backdropStyle,
  bodyClassName,
  disableBodyPadding = false,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const combinedBackdropStyle = {
    ...(backdropZIndex ? { zIndex: backdropZIndex } : {}),
    ...(backdropStyle || {}),
  };

  const bodyClass = [
    "ka-modal-body",
    disableBodyPadding ? null : bodyClassName || "padding-space",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div
      className="ka-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={Object.keys(combinedBackdropStyle).length ? combinedBackdropStyle : undefined}
    >
      <div
        className={`ka-modal ka-modal-${size} ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        {header ?? (
          <div className="ka-modal-header">
            {title ? <h5>{title}</h5> : <span />}
            <button
              type="button"
              className="ka-modal-close"
              aria-label="Close"
              onClick={onClose}
            >
              x
            </button>
          </div>
        )}

        <div className={bodyClass}>{children}</div>

        {footer && <div className="ka-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

Modal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  header: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  children: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  disableBodyPadding: PropTypes.bool,
};
