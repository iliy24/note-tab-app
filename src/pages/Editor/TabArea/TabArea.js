import React from "react";
import './TabArea.css';
import Copy from '../../../assets/copy.png';
import Paste from '../../../assets/paste.png';
import Tresh from '../../../assets/tresh.png';

function renderCell(cell) {
  if (!cell) return '';
  if (cell.dead) return 'X';
  const { fret, tech } = cell;
  if (tech === '<>') return `<${fret}>`;
  if (tech === '~')  return `~${fret}`;
  if (tech)          return `${fret}${tech}`;
  return `${fret}`;
}

export default function TabArea({
  tab,
  index,
  isActive,
  onSelect,
  onDelete,
  onCopy,
  onPaste,
  hasClipboard,
  onChangeTitle, // Принимаем функцию
}) {
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
          value={tab.title || ""}
          onChange={(e) => {
            if (onChangeTitle) {
              onChangeTitle(tab.id, e.target.value);
            }
          }}
          onClick={(e) => e.stopPropagation()} 
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
          <div className="strings-lines-inner">
            <div className="strings-rows">
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

            <div className="tab-actions-col">
              <button className="icon-btn1" onClick={(e) => { e.stopPropagation(); onDelete?.(tab.id); }} title="Удалить">
                <img src={Tresh} alt="Удалить" className="img-style-tresh" />
              </button>
              <button className="icon-btn1" onClick={(e) => { e.stopPropagation(); onPaste?.(tab.id); }} disabled={!hasClipboard} title="Вставить">
                <img src={Paste} alt="Вставить" className="img-style-paste" />
              </button>
              <button className="icon-btn1" onClick={(e) => { e.stopPropagation(); onCopy?.(tab.id); }} title="Копировать">
                <img src={Copy} alt="Копировать" className="img-style-copy" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}