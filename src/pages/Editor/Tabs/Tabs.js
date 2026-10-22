import React from "react";
import './Tabs.css';

export default function Tabs({ 
    tabs,  
    onAddTab 
}) {
    if (!tabs || !Array.isArray(tabs)) {
        return (
            <button className="btn-dashed" onClick={onAddTab}>
                + tab
            </button>
        );
    }
}