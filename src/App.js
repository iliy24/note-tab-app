import React, { useState } from "react";
import Header from "./components/Header/Header";
import Editor from "./pages/Editor/Editor";
import MyTabs from "./pages/MyTabs/MyTabs";
import Library from "./pages/Library/Library";
import './App.css';

function App() {
  // Какая страница сейчас показана: 'editor' | 'myTabs' | 'library'
  const [currentView, setCurrentView] = useState('editor');

  return (
    <div className="app-wrapper">
      <div className="phone-frame">
        <div className="grid-background"></div>
        <div className="app-container">

          {/* Передаем текущую страницу и функцию навигации в хедер */}
          <Header 
            currentView={currentView} 
            onNavigate={setCurrentView} 
          />

          {/* Условный рендер страниц */}
          {currentView === 'editor' && <Editor />}
          
          {currentView === 'myTabs' && (
            <MyTabs 
              onBack={() => setCurrentView('editor')} 
              onNavigate={setCurrentView} 
            />
          )}
          
          {currentView === 'library' && (
            <Library 
              onBack={() => setCurrentView('editor')} 
              onNavigate={setCurrentView} 
            />
          )}

        </div>
      </div>
    </div>
  );
}

export default App;