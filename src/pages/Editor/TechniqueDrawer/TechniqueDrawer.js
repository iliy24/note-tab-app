import React, { useRef, useEffect } from "react";
import { TECHNIQUES } from "../../../data/guitarData";
import './TechniqueDrawer.css';

export default function TechniqueDrawer({
  isOpen,
  onToggle,
  onClose,
  onTechniqueSelect,
  activeTechnique,
}) {
  const drawerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="td">
      <div
        ref={drawerRef}
        className={`tech-drawer ${isOpen ? 'open' : ''}`}
      >
        <div className="tech-drawer-header">
          <button
            className="btn-dashed tech-btn-center"
            onClick={onToggle}
          >
            tech
          </button>
        </div>

        {isOpen && (
          <div className="technique-buttons">
            {TECHNIQUES.map((technique, i) => (
              <button
                key={i}
                className={`tech-btn ${activeTechnique === technique ? 'active' : ''}`}
                onClick={() => onTechniqueSelect(technique)}
              >
                {technique}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="dtn-l-r-cont">
        <button className="btn-l-r">{'<'}</button>
        <button className="btn-l-r">{'-'}</button>
        <button className="btn-l-r">{'>'}</button>
      </div>
    </div>
  );
}