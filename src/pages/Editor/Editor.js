import React, { useState, useRef, useEffect } from "react";
import TabInput from "./TabInput/TabInput";
import TabArea from "./TabArea/TabArea";
import RhythmControls from "./RhythmControls/RhythmControls";
import Tabs from "./Tabs/Tabs";
import Fretboard from "./Fretboard/Fretboard";
import TechniqueDrawer from "./TechniqueDrawer/TechniqueDrawer";
import "./Editor.css";

// Создание пустого таба (BPM теперь общий, поэтому его тут нет)
const createEmptyTab = (id) => ({
  id,
  data: Array.from({ length: 10 }, () => Array(6).fill(null)),
  cursorCol: 0,
});

export default function Editor() {
  // --- СТЕЙТЫ ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tabs, setTabs] = useState([createEmptyTab(1)]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [lastNote, setLastNote] = useState(null); // { col, string } | null
  const nextIdRef = useRef(2);

  // --- СТЕЙТЫ РИТМА ---
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // --- ЗАПИСЬ НОТ ---
  const handleNoteClick = (stringIndex, fretNumber) => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;

    // Запоминаем, куда сейчас запишется нота (до сдвига курсора)
    setLastNote({ col: activeTab.cursorCol, string: stringIndex });

    setTabs(prev =>
      prev.map(tab => {
        if (tab.id !== activeTabId) return tab;

        const newData = tab.data.map(col => [...col]);
        // Ячейка теперь объект: { fret, tech }
        newData[tab.cursorCol][stringIndex] = { fret: fretNumber, tech: null };

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

  // --- ПРИМЕНЕНИЕ ТЕХНИК ---
  const applyTechnique = (tech) => {
    setTabs(prev =>
      prev.map(tab => {
        if (tab.id !== activeTabId) return tab;
        const newData = tab.data.map(col => [...col]);

        if (tech === 'X') {
          // Заливаем весь столбец cursorCol мёртвыми нотами
          for (let s = 0; s < 6; s++) {
            newData[tab.cursorCol][s] = { dead: true };
          }
          return { ...tab, data: newData };
        }

        // Иначе ставим технику к lastNote
        if (!lastNote) return tab;
        const cell = newData[lastNote.col][lastNote.string];
        if (!cell || cell.dead) return tab; // Пусто или X — не трогаем
        
        newData[lastNote.col][lastNote.string] = { ...cell, tech };
        return { ...tab, data: newData };
      })
    );
  };

  // --- РАБОТА С ТАБАМИ ---
  const handleSelectTab = (tabId, colIndex) => {
    setTabs(prev =>
      prev.map(tab =>
        tab.id === tabId ? { ...tab, cursorCol: colIndex ?? tab.cursorCol } : tab
      )
    );
    setActiveTabId(tabId);
  };

  const handleAddTab = () => {
    const newTab = createEmptyTab(nextIdRef.current);
    nextIdRef.current += 1;
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // --- УПРАВЛЕНИЕ РИТМОМ (BPM И PLAY) ---
  const stopPlayback = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const startPlayback = () => {
    // Сбрасываем курсор активного таба в начало
    setTabs(prev =>
      prev.map(tab =>
        tab.id === activeTabId ? { ...tab, cursorCol: 0 } : tab
      )
    );

    setIsPlaying(true);

    // Запускаем таймер (60000 мс / bpm = скорость шага)
    intervalRef.current = setInterval(() => {
      setTabs(prev =>
        prev.map(tab => {
          if (tab.id !== activeTabId) return tab;

          const lastCol = tab.data.length - 1;

          // Остановка в конце таба
          if (tab.cursorCol >= lastCol) {
            stopPlayback();
            return tab;
          }

          return { ...tab, cursorCol: tab.cursorCol + 1 };
        })
      );
    }, 60000 / bpm);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      // Остановка + сброс в начало
      stopPlayback();
      setTabs(prev =>
        prev.map(tab =>
          tab.id === activeTabId ? { ...tab, cursorCol: 0 } : tab
        )
      );
    } else {
      startPlayback();
    }
  };

  const handleBpmChange = (nextBpm) => {
    const clamped = Math.max(40, Math.min(240, nextBpm));
    if (isPlaying) stopPlayback(); // Останавливаем при смене BPM
    setBpm(clamped);
  };

  // Очистка таймера при уходе со страницы
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);


  // --- РЕНДЕР ---
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

        {/* 3. Ритм-контроллер */}
        <div className="rhythm-absolute-wrapper">
          <RhythmControls
            bpm={bpm}
            onBpmChange={handleBpmChange}
            capo={0}                  
            onCapoChange={() => {}} // Заглушка
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
          />
        </div>
      </div>

      <div className="fretboard-slot">
        <Fretboard onNoteClick={handleNoteClick} />
      </div>

      <TechniqueDrawer
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onTechniqueSelect={applyTechnique}
        activeTechnique={
          lastNote
            ? tabs.find(t => t.id === activeTabId)?.data[lastNote.col]?.[lastNote.string]?.tech
            : null
        }
      />
    </>
  );
}