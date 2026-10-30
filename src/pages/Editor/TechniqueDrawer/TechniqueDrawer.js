import React, { useRef, useEffect } from "react";
import { TECHNIQUES } from "../../../data/guitarData";
import './TechniqueDrawer.css';

export default function TechniqueDrawer({
  isOpen,             // Булево: открыто ли окно с техниками
  onToggle,           // Функция: открыть/закрыть окно по кнопке "tech"
  onClose,            // Функция: принудительно закрыть окно (при клике вне его)
  onTechniqueSelect,  // Функция: применить выбранную технику
  activeTechnique,    // Строка: какая техника сейчас активна (для подсветки кнопки)
  onMoveCursor,       // Функция: сдвинуть курсор (-1 влево, +1 вправо)
  onInsertSpace,      // Функция: вставить пустой столбец (пробел)
  onUndo,             // Функция: отменить последнее действие
  canUndo,            // Булево: есть ли что отменять (блокирует кнопку, если false)
}) {
  // Ссылка на DOM-элемент дровера (нужна, чтобы понять, куда кликнул пользователь)
  const drawerRef = useRef(null);

  // Эффект для закрытия дровера при клике вне его
  useEffect(() => {
    // Функция, которая срабатывает при клике
    function handleClickOutside(event) {
      // Если дровер существует, и клик был НЕ внутри него
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose(); // Закрываем
      }
    }

    // Если дровер открыт, вешаем слушатели на клики мышкой и тапом
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    // Очистка: когда дровер закрывается или компонент исчезает — убираем слушатели
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]); // Эффект перезапускается, если isOpen или onClose меняются

  return (
    <div className="td">
      {/* Сам выезжающий блок */}
      <div
        ref={drawerRef}
        className={`tech-drawer ${isOpen ? 'open' : ''}`}
      >
        {/* Шапка с кнопкой "tech" */}
        <div className="tech-drawer-header">
          <button
            className="btn-dashed tech-btn-center"
            onClick={onToggle}
          >
            tech
          </button>
        </div>

        {/* Сами кнопки с техниками (показываются только если открыто) */}
        {isOpen && (
          <div className="technique-buttons">
            {TECHNIQUES.map((technique, i) => (
              <button
                key={i}
                // Если текущая техника совпадает с activeTechnique — вешаем класс active (для подсветки)
                className={`tech-btn ${activeTechnique === technique ? 'active' : ''}`}
                // При клике передаем технику наверх в Editor
                onClick={() => onTechniqueSelect(technique)}
              >
                {technique}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Нижняя панель с кнопками управления */}
      <div className="dtn-l-r-cont">
        
        {/* 1. Кнопка ОТМЕНЫ (Undo) */}
        <button 
          className="btn-l-r" 
          onClick={onUndo} 
          disabled={!canUndo} // Если истории нет (canUndo === false), кнопка неактивна
          title="Отменить последнее действие"
        >
          ↺
        </button>

        {/* 2. Кнопка ВЛЕВО */}
        <button 
          className="btn-l-r" 
          onClick={() => onMoveCursor(-1)} // Передаем -1 (сдвиг влево)
        >
          {'<'}
        </button>

        {/* 3. Кнопка ПРОБЕЛ (вставка пустого столбца) */}
        <button 
          className="btn-l-r" 
          onClick={onInsertSpace} 
        >
          _
        </button>

        {/* 4. Кнопка ВПРАВО */}
        <button 
          className="btn-l-r" 
          onClick={() => onMoveCursor(1)} // Передаем 1 (сдвиг вправо)
        >
          {'>'}
        </button>
      </div>
    </div>
  );
}