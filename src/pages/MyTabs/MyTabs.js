import React, { useState } from "react";
import My from './My/My'


export default function MyTabs({ onBack }) {
  return (
    <div className="content">
      <div className="my_content">
        <My/>
      </div>
      
      <div style={{ padding: 20 }}>
      <button onClick={onBack}>← Назад</button>
      </div>
    </div>
    
  );
}