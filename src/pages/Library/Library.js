import React from "react";

export default function Library({ onBack }) {
  return (
    <div style={{ padding: 20 }}>
      <button onClick={onBack}>← Назад</button>
      <h2>Библиотека</h2>
      <p>Скоро здесь будут публичные табы.</p>
    </div>
  );
}