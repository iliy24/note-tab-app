import React from "react";
import My from './My/My';
import SerchSort from "../../components/SerchSort/SerchSort";
import Tab from "../../components/Tab/Tab";
import { MOCK_TABS } from "../../data/mockTabs";
import './MyTabs.css'; // Убедись, что стили подключены

export default function MyTabs({ onBack, onNavigate }) {
  
  const handlePlay = (tab) => console.log("Play", tab.title);
  const handleShare = (tab) => console.log("Share", tab.title);
  const handleEdit = (tab) => console.log("Edit", tab.title);
  const handleDelete = (tab) => console.log("Delete", tab.title);

  return (
    <div className="content">
      <div className="my_content">
        <My/>
      </div>
      
      <div className="serch_sort">
        <SerchSort/>
      </div>

      <div className="tabs-list">
        {MOCK_TABS.map(tab => (
          <Tab 
            key={tab.id} 
            tab={tab} 
            onPlay={handlePlay}
            onShare={handleShare}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Плавающая кнопка "+" */}
      <button 
        className="fab-btn" 
        onClick={() => onNavigate('editor')}
        title="Создать новый таб"
      >
        +
      </button>

    </div>
  );
}