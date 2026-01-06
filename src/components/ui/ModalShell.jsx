import CloseIcon from "@/assets/IconComponents/Close";

export default function ModalShell({
  children,
  onClose,
  header,
  className = "",
}) {
  return (
    <section className="model-container">
      <section className={`model ${className}`}>
        {header && (
          <header className="model-header flex FY-center F-space">
            <span className="title">{header}</span>
            <button className="close-model" onClick={onClose}>
              <CloseIcon />
            </button>
          </header>
        )}
        {children}
      </section>
    </section>
  );
}