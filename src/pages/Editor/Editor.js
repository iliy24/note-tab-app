import React, { useState, useRef } from "react";
import TabInput from "./TabInput/TabInput";
import TabArea from "./TabArea/TabArea";
import RhythmControls from "./RhythmControls/RhythmControls";
import Tabs from "./Tabs/Tabs";
import Fretboard from "./Fretboard/Fretboard";
import TechniqueDrawer from "./TechniqueDrawer/TechniqueDrawer";
import "./Editor.css";

const createEmptyTab = (id) => ({
  id,
  data: Array.from({ length: 10 }, () => Array(6).fill(null)),
  cursorCol: 0,
});

export default function Editor() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tabs, setTabs] = useState([createEmptyTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const nextIdRef = useRef(2);

  // Запись ноты в активный таб
  const handleNoteClick = (stringIndex, fretNumber) => {
    setTabs(prev =>
      prev.map(tab => {
        if (tab.id !== activeTabId) return tab;

        const newData = tab.data.map(col => [...col]);
        newData[tab.cursorCol][stringIndex] = fretNumber;

        let newCursorCol = tab.cursorCol;
        let finalData = newData;

        if (newCursorCol < newData.length - 1) {
          newCursorCol += 1;
        } else {
          finalData = [...newData, Array(6).fill(null)];
          newCursorCol += 1;
        }

        return { ...tab, data: finalData, cursorCol: newCursorCol };
      })
    );
  };

  // Клик по табу (выбор активного и/или позиционирование курсора)
  const handleSelectTab = (tabId, colIndex) => {
    setTabs(prev =>
      prev.map(tab =>
        tab.id === tabId ? { ...tab, cursorCol: colIndex ?? tab.cursorCol } : tab
      )
    );
    setActiveTabId(tabId);
  };

  // Добавление нового пустого таба
  const handleAddTab = () => {
    const newTab = createEmptyTab(nextIdRef.current);
    nextIdRef.current += 1;
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  return (
    <>
      <div className="top-content">
        {/* 1. Верхний блок: Инпут */}
        <div className="editor-top-bar">
          <TabInput />
        </div>

        {/* 2. Зона скролла: Табы и кнопка + tab */}
        <div className="tabs-scroll-area">
          <div className="tabs-list-container">
            {tabs.map((tab, index) => (
              <TabArea
                key={tab.id}
                tab={tab}
                index={index}
                isActive={tab.id === activeTabId}
                onSelect={handleSelectTab}
              />
            ))}
          </div>

          <div className="tabs-add-btn">
            <Tabs onAddTab={handleAddTab} />
          </div>
        </div>

        {/* 3. Ритм-контроллер вынесен из скролла и висит поверх */}
        <div className="rhythm-absolute-wrapper">
          <RhythmControls />
        </div>
      </div>

      <div className="fretboard-slot">
        <Fretboard onNoteClick={handleNoteClick} />
      </div>

      <TechniqueDrawer
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}