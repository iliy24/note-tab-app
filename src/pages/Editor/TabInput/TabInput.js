import React from "react";
import './TabInput.css';
import Copy from '../../../assets/copy.png'
import Paste from '../../../assets/paste.png'
import Tresh from '../../../assets/tresh.png'

export default function TabInput() {
    return(
       <div className="input-group">
            <div className="input-and-icons">
                <input
                    type="text"
                    placeholder="Name"
                    className="input-castom"
                />
                <div className="group-icons">
                    
                    <button className="icon-btn1">
                        <img
                            src={Tresh}
                            alt="Tresh"
                            className="img-style-tresh" 
                        />
                    </button> 
                  
                    <button className="icon-btn1">
                        <img
                            src={Paste}
                            alt="Paste"
                            className="img-style-paste" 
                        />
                    </button>
                    
                    <button className="icon-btn1">
                        <img
                            src={Copy}
                            alt="Copy"
                            className="img-style-copy" 
                        />
                    </button>


                </div>
                                   
            </div>
            
        </div>

    )
}