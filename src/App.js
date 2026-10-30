import React, { useState, useRef } from "react";
import Header from "./components/Header/Header";
import Editor from "./pages/Editor/Editor";
import MyTabs from "./pages/MyTabs/MyTabs";
import Library from "./pages/Library/Library";
import Settings from "./pages/Settings/Settings";
import AuthModal from "./components/AuthModal/AuthModal"; // <-- Импортируем модалку
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('editor');
  const [editingTabId, setEditingTabId] = useState(null);
  
const [newCompositionId, setNewCompositionId] = useState(0);
 
  
  // --- СОСТОЯНИЯ АВТОРИЗАЦИИ ---
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // Запоминаем, что хотели сделать до входа

  const editorSaveRef = useRef(null);

const editorQuickSaveRef = useRef(null);

  // --- ФУНКЦИИ АВТОРИЗАЦИИ ---
  
  // Проверка: если вошел — делаем действие, если нет — открываем модалку
  const requireAuth = (action) => {
    if (isAuthenticated) {
      action();
    } else {
      setPendingAction(() => action); // Сохраняем действие в памяти
      setIsAuthOpen(true);            // Открываем окно
    }
  };

  // Срабатывает, когда пользователь успешно ввел логин/пароль в модалке
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setIsAuthOpen(false);
    if (pendingAction) {
      pendingAction(); // Выполняем то, что хотели сделать (например, перейти в Мои табы)
      setPendingAction(null);
    }
  };

  // --- ОБРАБОТЧИКИ ---
  const handleSaveAsClick = () => {
    requireAuth(() => {
      if (currentView === 'editor' && editorSaveRef.current) {
        editorSaveRef.current();
      } else {
        alert("Сохранение доступно только в редакторе!");
      }
    });
  };

  // Переход по вкладкам (если в Мои табы — требуем авторизацию)
  const handleNavigate = (view) => {
    if (view === 'myTabs') {
      requireAuth(() => setCurrentView(view));
    } else {
      setCurrentView(view);
    }
  };

  const handleEditTab = (tabId) => {
    setEditingTabId(tabId);
    setCurrentView('editor');
  };
  
const handleCreateTab = () => {
    setEditingTabId(null);
    setNewCompositionId(prev => prev + 1);
    setCurrentView('editor');
};


  
const handleSaveClick = () => {
    requireAuth(() => {
        if (currentView === 'editor' && editorQuickSaveRef.current) {
            editorQuickSaveRef.current();
        } else {
            alert("Сохранение доступно только в редакторе!");
        }
    });
};


  return (
    <div className="app-wrapper">
      <div className="phone-frame">
        <div className="grid-background"></div>
        <div className="app-container">

          
          <Header
              currentView={currentView}
              onNavigate={handleNavigate}
              onSave={handleSaveClick}
              onSaveAs={handleSaveAsClick}
          />


          {currentView === 'editor' && (
            <Editor 
              openSaveModalRef={editorSaveRef} 
              quickSaveRef={editorQuickSaveRef}
              editingTabId={editingTabId} 
              onDoneEditing={() => setEditingTabId(null)}
              newCompositionId={newCompositionId}
            />
          )}
          
          {currentView === 'myTabs' && (
           
          <MyTabs
              onBack={() => setCurrentView('editor')}
              onNavigate={handleNavigate}
              onEditTab={handleEditTab}
              onCreateTab={handleCreateTab}
          />

          )}
          
          {currentView === 'library' && (
            <Library 
              onBack={() => setCurrentView('editor')} 
              onNavigate={handleNavigate} 
            />
          )}

          {currentView === 'settings' && (
            <Settings 
              onBack={() => setCurrentView('myTabs')} 
              onNavigate={handleNavigate}
            />
          )}

          {/* --- ВСТРАИВАЕМ МОДАЛКУ АВТОРИЗАЦИИ --- */}
          <AuthModal 
            isOpen={isAuthOpen} 
            onClose={() => {
              setIsAuthOpen(false);
              setPendingAction(null); // Если передумал — забываем действие
            }} 
            onAuthSuccess={handleAuthSuccess} 
          />

        </div>
      </div>
    </div>
  );
}

export default App;