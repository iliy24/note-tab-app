import React from "react";
import "./My.css";
import Share from "../../../assets/share.png"
import Satting from "../../../assets/satting.png"


export default function My() {
  return (
    <div className="all_playses">
      <div className="ava"></div>

      <div className="playses">
        <div className="name_playses">
          <div className="name">
            имя
          </div>
        </div>

        <div className="btm-playses">
          <button className="btm_profil">
            <img 
            src = {Share}
            alt="<"
            className="img"
            />
          </button>
          <button className="btm_profil">
            <img 
            src = {Satting}
            alt="<"
            className="img"
            />
          </button>
        </div>
      </div>
    </div>
  );
}