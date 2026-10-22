import React from "react";
import SerchSort from "../../components/SerchSort/SerchSort";
import Tab from "../../components/Tab/Tab";
import { MOCK_TABS } from "../../data/mockTabs";
import './Library.css';

export default function Library({ onBack, onNavigate }) {
  const publicTabs = MOCK_TABS.filter(tab => tab.isPublic === true);

  const handlePlay = (tab) => console.log("Play", tab.title);
  const handleShare = (tab) => console.log("Share", tab.title);
  
  // Заглушка для просмотра
  const handleView = (tab) => {
    console.log("Открываем таб:", tab.title);
    // Здесь позже будет: onNavigate('viewTab') и передача ID таба
  };

  return (
    <div className="library-page">

      <div className="serch_sort">
        <SerchSort />
      </div>

      <div className="tabs-list">
        {publicTabs.length > 0 ? (
          publicTabs.map(tab => (
            <Tab
              key={tab.id}
              tab={tab}
              isOwner={false}
              onView={handleView} // <-- Передаем функцию просмотра
              onPlay={handlePlay}
              onShare={handleShare}
            />
          ))
        ) : (
          <div className="library-empty">
            <span className="library-empty-icon">🎸</span>
            <span className="library-empty-text">Здесь пока пусто</span>
          </div>
        )}
      </div>
    </div>
  );
}