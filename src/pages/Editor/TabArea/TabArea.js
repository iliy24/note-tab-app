import React from "react";
import './TabArea.css';

// Превращаем объект ячейки в строку для отображения
function renderCell(cell) {
  if (!cell) return '';
  if (cell.dead) return 'X';
  const { fret, tech } = cell;
  if (tech === '<>') return `<${fret}>`;
  if (tech === '~')  return `~${fret}`;
  if (tech)          return `${fret}${tech}`;
  return `${fret}`;
}

export default function TabArea({ tab, index, isActive, onSelect }) {
  const { data: tabData, cursorCol } = tab;

  return (
    <div
      className={`tab-area-wrapper ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(tab.id)}
    >
      <div className="personality-tab-name">
        <input
          type="text"
          placeholder={`Таб ${index + 1}`}
          className="tab-area-label"
        />
      </div>

      <div className="tab-area">
        <div className="strings-label-area">
          <div className="strings-label">
            <span>E</span>
            <span>B</span>
            <span>G</span>
            <span>D</span>
            <span>A</span>
            <span>E</span>
          </div>
        </div>

        <div className="strings-lines">
          {[...Array(6)].map((_, stringIndex) => (
            <div key={stringIndex} className="string-row">
              {tabData.map((col, colIndex) => {
                const cell = col[stringIndex];
                const isCursorHere = isActive && cursorCol === colIndex;

                return (
                  <div
                    key={colIndex}
                    className={`tab-cell ${isCursorHere ? 'active-cursor' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(tab.id, colIndex);
                    }}
                  >
                    {renderCell(cell)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}