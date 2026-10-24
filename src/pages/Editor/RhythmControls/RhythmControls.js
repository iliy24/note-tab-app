import React from "react";
import './RhythmControls.css';
import Play from '../../../assets/play.png';

export default function RhythmControls({
  bpm,
  onBpmChange,
  capo,
  onCapoChange,
  isPlaying,
  onTogglePlay,
}) {
  return (
    <div className="control-unit">
      <div className="controls-box">
        {/* BPM */}
        <button className="plus-minus" onClick={() => onBpmChange(bpm + 5)}>
          +
        </button>
        <div className="display-box">
          {bpm}
        </div>
        <button className="plus-minus" onClick={() => onBpmChange(bpm - 5)}>
          -
        </button>
        <small className="c-b-style">bpm</small>

        <div className="divider"></div>

        {/* Capo */}
        <button className="plus-minus" onClick={() => onCapoChange(capo + 1)}>
          +
        </button>
        <div className="display-box">
          {capo}
        </div>
        <button className="plus-minus" onClick={() => onCapoChange(capo - 1)}>
          -
        </button>
        <small className="c-b-style">capo</small>
      </div>

      {/* Play / Stop */}
      <button 
        className={`play ${isPlaying ? 'playing' : ''}`}
        onClick={onTogglePlay}
      >
        <img
          src={Play}
          alt="play" 
          className="play-img"
        />
      </button>
    </div>
  );
}