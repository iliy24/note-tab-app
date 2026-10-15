import React, { useRef, useEffect } from "react";
import { TECHNIQUES } from "../../../data/guitarData";
import './TechniqueDrawer.css';

export default function TechniqueDrawer({isOpen, onToggle, onClose}){
    const drawerRef = useRef(null);

    useEffect(() => {
        // Обработчик клика вне блока
        function handleClickOutside(event) {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                onClose();
            }
        }

        // Добавляем слушатель только когда открыто
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        // Убираем слушатель при размонтировании или закрытии
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return(
        <div className="td">
            <div 
                ref={drawerRef}
                className={`tech-drawer ${isOpen ? 'open' : ''}`}
                onClick={onToggle}  // КЛИК ПО БЛОКУ ОТКРЫВАЕТ/ЗАКРЫВАЕТ
            >
                <div className="tech-drawer-header">
                    <button className="btn-dashed tech-btn-center" onClick={(e) => {
                        e.stopPropagation();  // ОСТАНАВЛИВАЕМ ВСПЛЫТИЕ
                        onToggle();
                    }}>
                        tech
                    </button>
                </div>

                {isOpen && (  // ПОКАЗЫВАЕМ ТЕХНИКИ ТОЛЬКО КОГДА ОТКРЫТО
                    <div className="technique-buttons">
                        {TECHNIQUES.map((technique, i) => (
                            <button 
                                key={i} 
                                className="tech-btn"
                                onClick={(e) => e.stopPropagation()}  // НЕ ЗАКРЫВАЕМ ПРИ КЛИКЕ НА ТЕХНИКУ
                            >
                                {technique}
                            </button>
                        ))}
                    </div>
                )}
            </div> 
        
            <div className="dtn-l-r-cont">
                <button className="btn-l-r">
                    {'<'}
                </button>
                <button className="btn-l-r">
                    {'-'}
                </button>
                <button className="btn-l-r">
                    {'>'}
                </button>
            </div>
        </div>
    )
}