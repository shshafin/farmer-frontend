import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { baseApi } from "../../../api";

const buildInitialState = (sections) =>
  sections.reduce((acc, sec) => {
    acc[sec.title] = true;
    return acc;
  }, {});

const ToggleArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    className="guidelines-section__icon-svg">
    <path
      d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18"
      stroke="#141B34"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function InsectsSection({ sections = [] }) {
  const [expanded, setExpanded] = useState(() => buildInitialState(sections));

  useEffect(() => {
    setExpanded(buildInitialState(sections));
  }, [sections]);

  const sectionBasePaths = useMemo(
    () => sections.map((_, index) => (index === 0 ? "insects" : "disease")),
    [sections]
  );

  const toggleSection = (title) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="guidelines-sections">
      {sections.map((sec, index) => {
        const basePath = sectionBasePaths[index] ?? "insects";
        const isOpen = expanded[sec.title] ?? true;
        const sectionId = `guidelines-section-${index}`;

        return (
          <section
            key={sec.title}
            className={`guidelines-section${isOpen ? " is-expanded" : ""}`}>
            <button
              type="button"
              className="guidelines-section__header"
              onClick={() => toggleSection(sec.title)}
              aria-expanded={isOpen}
              aria-controls={sectionId}>
              <span className="guidelines-section__title">{sec.title}</span>
              <span
                className={`guidelines-section__icon${
                  isOpen ? " is-open" : ""
                }`}>
                <ToggleArrowIcon />
              </span>
            </button>

            <div
              id={sectionId}
              className={`guidelines-section__body${isOpen ? " is-open" : ""}`}>
              <div className="guidelines-card-grid">
                {sec.items?.map((item) => (
                  <NavLink
                    key={item.id}
                    className="guidelines-card"
                    to={`/${basePath}/${item.name}`}>
                    <div className="guidelines-card__preview">
                      <img
                        src={`${baseApi}${item.image}`}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="guidelines-card__caption">
                      <h3 className="guidelines-card__name">{item.name}</h3>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
