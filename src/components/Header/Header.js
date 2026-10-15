import React, { useState } from "react";
import './Header.css';
import Dropdown from '../Dropdown/Dropdown';
import logoImage from '../../assets/logo.png';

export default function Header({ onNavigate }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo-box">
        <img src={logoImage} alt="Logo" className="logo-icon-box" />
        <span className="logo-text">NoteTab</span>
      </div>

      <div className="header-btn-group">
        <button className="btn-rounded">AI</button>

        {/* Обёртка для кнопки и меню — якорь для dropdown */}
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
          />
        </div>
      </div>
    </header>
  );
}