import React, { useEffect, useRef, useState } from "react";
import SearchIcon from "@/assets/IconComponents/SearchIcon";

const DEFAULT_PLACEHOLDER = "\u0995\u09c0\u099f\u09a8\u09be\u09b6\u0995\u0020\u09aa\u09a3\u09cd\u09af\u0020\u0996\u09cb\u099c\u0020\u0995\u09b0\u09c1\u09a8";
const RESULT_LABEL = "\u09aa\u09a3\u09cd\u09af\u0020\u0996\u09cb\u099c\u0020\u0995\u09b0\u09c1\u09a8";

export default function SearchBar({ placeholder = DEFAULT_PLACEHOLDER, onChange, debounceMs = 300 }) {
  const [value, setValue] = useState("");
  const timerRef = useRef();

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange?.(value);
    }, debounceMs);
    return () => clearTimeout(timerRef.current);
  }, [value, debounceMs, onChange]);

  return (
    <form action="" className="companyprosearch" id="searchform" onSubmit={(e) => e.preventDefault()}>
      <div className="companyprosearch__field">
        <SearchIcon size={20} color="#9b9b9b" className="companyprosearch__icon" />
        <input
          type="search"
          id="companyprosearch"
          name="companyprosearch"
          placeholder={placeholder}
          className="companyprosearch__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div
        className="allcompanyprosearchbox text-end rounded pb-3 paddingbox mt-5"
        id="searchcompanypro_result"
        data-bs-auto-close="true"
        style={{ display: "none" }}
      >
        <button type="button" className="btn-close" aria-label="Close" id="closecompanypro_search"></button>
        <div id="onecompanyproduct" className="text-start">
          <p title={RESULT_LABEL} className="text-center text-white">
            {RESULT_LABEL}
          </p>
        </div>
      </div>
    </form>
  );
}
