import React from "react";
import './TabArea.css';

export default function TabArea(){
    return(
        <div className="tab-area">
            <div className="strings-label-area">
                <div className="strings-label">
                    <span>E</span>
                    <span>B</span>
                    <span>G</span>
                    <span>D</span>
                    <span>A</span>
                    <span>E</span> 
                </div>
            </div>
            

            <div className="strings-lines">
                {[...Array(6)].map((_, i) => (<div key={i} className="line"></div>))}
            </div>

        </div>  
    
    )
}