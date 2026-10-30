import React from "react";
import './TabInput.css';

export default function TabInput({ value, onChange }) {
    return(
       <div className="input-group">
            <div className="input-and-icons">
                <input
                    type="text"
                    placeholder="Название таба..."
                    className="input-castom"
                    value={value || ""}
                    onChange={onChange}
                />
            </div>
        </div>
    )
}