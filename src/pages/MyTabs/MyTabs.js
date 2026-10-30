
import { apiFetch } from "../../api";
import React, { useState, useEffect } from "react";
import My from './My/My';
import SerchSort from "../../components/SerchSort/SerchSort";
import Tab from "../../components/Tab/Tab";
import './MyTabs.css';


export default function MyTabs({
    onBack,
    onNavigate,
    onEditTab,
    onCreateTab
}) {

  const [myTabs, setMyTabs] = useState([]);
  const [profile, setProfile] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tabsRes, profileRes] = await Promise.all([
          apiFetch('/tabs/?scope=my'),
          apiFetch('/profile/')
        ]);

        if (tabsRes.ok) {
          const tabsData = await tabsRes.json();
          setMyTabs(tabsData);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlay = (tab) => console.log("Play", tab.title);
  const handleShare = (tab) => console.log("Share", tab.title);

  const handleEdit = (tab) => {
    if (onEditTab) onEditTab(tab.id);
  };

  const handleDelete = async (tab) => {
    if (window.confirm(`Вы уверены, что хотите удалить таб "${tab.title || 'Без названия'}"?`)) {
      try {
        const response = await fetch(`/tabs/${tab.id}/`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMyTabs(prev => prev.filter(t => t.id !== tab.id));
        } else {
          alert("Ошибка при удалении с сервера");
        }
      } catch (error) {
        console.error("Ошибка сети:", error);
        alert("Сервер недоступен");
      }
    }
  };

  return (
    <div className="content">
      <div className="my_content">
        <My 
          onNavigate={onNavigate} 
          profile={profile} 
        />
      </div>
      
      <div className="serch_sort">
        <SerchSort/>
      </div>
      <div className="tabs-scroll">
        <div className="tabs-list">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#3b82f6' }}>Загрузка...</div>
        ) : myTabs.length > 0 ? (
          myTabs.map(tab => (
            <Tab 
              key={tab.id} 
              tab={{
                ...tab,
                author: tab.author_name || "Неизвестный автор",
                date: new Date(tab.created_at).toLocaleDateString(),
                avatar: tab.avatar_file || "https://i.pravatar.cc/80?img=12",
                hasAudio: !!tab.audio_file,
              }} 
              isOwner={true}
              onPlay={handlePlay}
              onShare={handleShare}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleEdit}
            />
          ))
        ) : (
          <div className="empty-tabs" style={{ textAlign: 'center', marginTop: '20px', color: '#3b82f6' }}>
            У вас пока нет сохраненных табов
          </div>
        )}
      </div>

        
      </div>
      

      
<button
    className="fab-btn"
    onClick={onCreateTab}
    title="Создать новую композицию"
>
    +
</button>

    </div>
  );
}