import React from "react";
import './Dropdown.css';

export default function Dropdown({ isOpen, onClose, onNavigate }) {
    if (!isOpen) return null;

    const handleNavigate = (view) => {
        onNavigate(view);
        onClose();
    };

    return(
        <>
            <div className="dropdown-overlay" onClick={onClose} />
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button 
                    className="dropdown-item" 
                    onClick={() => handleNavigate('myTabs')}
                >
                    Мои табы
                </button>
                <button 
                    className="dropdown-item" 
                    onClick={() => handleNavigate('library')}
                >
                    Библиотека
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={onClose}>
                    Сохранить 
                </button>
                <button className="dropdown-item" onClick={onClose}>
                    Новый лист
                </button>
            </div>
        </>
    );
}