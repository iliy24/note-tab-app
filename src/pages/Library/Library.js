import React, { useState, useEffect } from "react";
import SerchSort from "../../components/SerchSort/SerchSort";
import Tab from "../../components/Tab/Tab";
import './Library.css';

export default function Library({ onBack, onNavigate }) {
  const [publicTabs, setPublicTabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8001/api/tabs/?scope=library')
      .then(res => res.json())
      .then(data => {
        setPublicTabs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки библиотеки:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="library-page">
      <div className="serch_sort">
        <SerchSort />
      </div>

      <div className="tabs-list">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#3b82f6' }}>Загрузка...</div>
        ) : publicTabs.length > 0 ? (
          publicTabs.map(tab => (
            <Tab
              key={tab.id}
              tab={{
                ...tab,
                author: tab.author_name || "Неизвестный автор",
                date: new Date(tab.created_at).toLocaleDateString(),
                avatar: tab.avatar_file || "https://i.pravatar.cc/80?img=12",
                hasAudio: !!tab.audio_file,
              }}
              isOwner={false}
              onView={(t) => console.log("Просмотр", t.title)}
              onPlay={(t) => console.log("Play", t.title)}
              onShare={(t) => console.log("Share", t.title)}
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