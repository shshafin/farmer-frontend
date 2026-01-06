import { memo } from "react";
import MenuIcon from "@/assets/icons/Menu.svg";

function Menu({ menuHandler, isOpen = false }) {
  return (
    <button
      type="button"
      className={`menuIcon${isOpen ? " active" : ""}`}
      title="Menu"
      aria-haspopup="dialog"
      aria-expanded={isOpen ? "true" : "false"}
      onClick={menuHandler}
    >
      <img src={MenuIcon} alt="Menu" />
    </button>
  );
}

export default memo(Menu);