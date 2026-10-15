import React from "react";
import './RhythmControls.css';
import Play from '../../../assets/play.png'

export default function RhythmControls(){
    return(
        <div className="control-unit">
            <div className="controls-box ">
            <button className="plus-minus">+</button>
            <div className="display-box">
                120
            </div>

            <button className="plus-minus">-</button>
            <small className="c-b-style">bpm</small>
            <div className="divider"></div>

            <button className="plus-minus">+</button>
            <div className="display-box">
                0
            </div>
            <button className="plus-minus">-</button>
            <small className="c-b-style">capo</small>

            
        </div>
        <button className="play">
            
                <img
                    src={Play}
                    alt="play" 
                    className="play-img"
                />
            
        </button>
    </div>



    )
}