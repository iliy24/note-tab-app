import React from "react";
import { STRINGS } from '../../../data/guitarData';
import './Fretboard.css';

export default function Fretboard({onNoteClick}){
    return(
        <div className="fretboard-container">
            <div className="fret-zero-box">
                <div className="fret-zero-grid">
                    {/* Номер лада */}
                    <span className="fret-number">0</span>

                    {/* Ноты открытых струн */}
                    {STRINGS.map((string, i) => (
                        <button 
                        key={`0-${i}`} 
                        className="note"
                        onClick={() => onNoteClick(i, 0, string.notes[0])}
                        >
                            {string.notes[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="fret-others-box">
                <div className="fret-scroll">
                    <div className="fret-grid">
                        {/* Первая строка — номера ладов */}
                        {[...Array(28)].map((_, i) => (
                            <span key={`fret-number-${i}`} className="fret-number">
                                {i + 1}
                            </span>
                        ))}

                        {/* Остальные 6 строк — ноты */}
                        {STRINGS.map((string, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                                {string.notes.slice(1).map((note, colIndex) => (
                                    <button 
                                        key={`${rowIndex}-${colIndex}`} 
                                        className="note"
                                        onClick={() => onNoteClick(rowIndex,colIndex +1, note)}
                                    >
                                        {note}
                                    </button>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>    
    )
}