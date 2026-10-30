import React, { useState } from "react";
import './Header.css';
import Dropdown from '../Dropdown/Dropdown';
import logoImage from '../../assets/logo.png';
import HomeIcon from '../../assets/glav.png'; 

// Добавили onSaveAs в пропсы

export default function Header({
    currentView,
    onNavigate,
    onSave,
    onSaveAs
}) {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo-box">
        <img src={logoImage} alt="Logo" className="logo-icon-box" />
        <span className="logo-text">NoteTab</span>
      </div>

      <div className="header-btn-group">
        
        {currentView === 'editor' ? (
          <button className="btn-rounded">AI</button>
        ) : (
          <button 
            className="btn-rounded btn-home" 
            onClick={() => onNavigate('editor')}
            title="На главную"
          >
            <img src={HomeIcon} alt="Главная" className="home-icon" />
          </button>
        )}

        <div className="dropdown-anchor">
          <button 
            className="icon-btn-more"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            ...
          </button>

          
            <Dropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                onNavigate={onNavigate}
                onSave={onSave}
                onSaveAs={onSaveAs}
            />

        </div>
      </div>
    </header>
  );
}