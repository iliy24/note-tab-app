import React from "react";
import "./My.css";
import Share from "../../../assets/share.png";
import Satting from "../../../assets/satting.png";

export default function My({ onNavigate, profile }) {
  // Берем имя из профиля или ставим заглушку
  const displayName = profile?.display_name || profile?.username || "Пользователь";
  
    // Бэкенд уже отдаёт полный URL (или null)
  const avatarUrl = profile?.avatar || null;

  return (
    <div className="all_playses">
      <div className="ava">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="avatar" 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
          />
        ) : null}
      </div>

      <div className="playses">
        <div className="name_playses">
          <div className="name">
            {displayName}
          </div>
        </div>

        <div className="btm-playses">
          <button className="btm_profil">
            <img src={Share} alt="Поделиться" className="img" />
          </button>
          <button className="btm_profil" onClick={() => onNavigate && onNavigate('settings')}>
            <img src={Satting} alt="Настройки" className="img" />
          </button>
        </div>
      </div>
    </div>
  );
}