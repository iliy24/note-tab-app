import React, { useState } from "react";
import "./SortDropdown.css";

const OPTIONS = [
  { value: "date1",  label: "Новые" },
  { value: "date2",  label: "Старые" },
  { value: "alpha", label: "По алфавиту" },
];

export default function SortDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = OPTIONS.find(option => option.value === value);
  const currentLabel = currentOption ? currentOption.label : "Сортировка";

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="sort-overlay" onClick={() => setIsOpen(false)} />
      )}

      <div className="sort-anchor">
        <button
          className="sort-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {currentLabel} ▾
        </button>

        {isOpen && (
          <div className="sort-menu">
            {OPTIONS.map(option => (
              <button
                key={option.value}
                className={`sort-item ${option.value === value ? "active" : ""}`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}