import React, { useState } from "react";
import "./Tab.css";
import PlayIcon from "../../assets/play.png";
import ShareIcon from "../../assets/share.png";
import EditIcon from "../../assets/red.png"; 
import DeleteIcon from "../../assets/tresh.png";
import LookIcon from "../../assets/look.png";

export default function Tab({ tab, onPlay, onShare, onEdit, onDelete, onView, isOwner = true }) {
  const { title, author, avatar, date, comment, is_public, hasAudio } = tab;
  const isPublic = is_public;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);

  return (
    <div className="tab-card">
      
      <div className="tab-card-left">
        <img src={avatar} alt={author} className="tab-avatar" />
      </div>

      <div className="tab-card-center">
        <div className="tab-header">
          <span className="tab-title">{title ? title : "Без названия"}</span>
          {isOwner && (
            <span className={`tab-status ${isPublic ? "public" : "private"}`}>
              {isPublic ? "Публичный" : "Приватный"}
            </span>
          )}
        </div>
        
        <div className="tab-meta">
          <span>{author}</span>
          <span className="separator">·</span>
          <span>{date}</span>
        </div>

        {comment && (
          <div 
            className={`tab-comment ${isCommentExpanded ? "expanded" : ""}`}
            onClick={() => setIsCommentExpanded(!isCommentExpanded)}
          >
            {comment}
          </div>
        )}
      </div>

      <div className="tab-card-actions">
        {isOwner ? (
          <>
            {hasAudio && (
              <button className="action-btn" onClick={() => onPlay(tab)} title="Слушать">
                <img src={PlayIcon} alt="play" />
              </button>
            )}
            <button className="action-btn" onClick={() => onEdit(tab)} title="Редактировать">
              <img src={EditIcon} alt="edit" />
            </button>
            <div className="mobile-menu-anchor">
              <button 
                className="action-btn" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                ⋮
              </button>

              {isMenuOpen && (
                <>
                  <div className="tab-menu-overlay" onClick={() => setIsMenuOpen(false)} />
                  <div className="tab-dropdown-menu">
                    <button onClick={() => { onView(tab); setIsMenuOpen(false); }}>
                      <img src={LookIcon} alt="" /> Посмотреть
                    </button>
                    <button onClick={() => { onShare(tab); setIsMenuOpen(false); }}>
                      <img src={ShareIcon} alt="" /> Поделиться
                    </button>
                    <button className="danger" onClick={() => { onDelete(tab); setIsMenuOpen(false); }}>
                      <img src={DeleteIcon} alt="" /> Удалить
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <button className="action-btn" onClick={() => onView(tab)} title="Посмотреть">
              <img src={LookIcon} alt="view" />
            </button>
            <button className="action-btn" onClick={() => onShare(tab)} title="Поделиться">
              <img src={ShareIcon} alt="share" />
            </button>
            {hasAudio && (
              <button className="action-btn" onClick={() => onPlay(tab)} title="Слушать">
                <img src={PlayIcon} alt="play" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}