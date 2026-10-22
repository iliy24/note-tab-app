import React, { useState } from "react";
import "./SerchSort.css";
import Lupa from "../../assets/lupa.png";
import SortDropdown from "./SortDropdown/SortDropdown";

export default function SerchSort() {

    const[sortBy, setSortBy] = useState("date");

  return (
    <div className="search-sort">
      <div className="serch">
        <input
          type="text"
          placeholder="поиск"
          className="inputText"
        />
        <img
          src={Lupa}
          alt="лупа"
          className="img"
        />
      </div>

         <SortDropdown value={sortBy} onChange={setSortBy} />
      
    </div>
  );
}