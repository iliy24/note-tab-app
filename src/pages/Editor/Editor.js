import React, { useState } from "react";
import TabInput from "./TabInput/TabInput";
import TabArea from "./TabArea/TabArea";
import RhythmControls from "./RhythmControls/RhythmControls";
import Tabs from "./Tabs/Tabs";
import Fretboard from "./Fretboard/Fretboard";
import TechniqueDrawer from "./TechniqueDrawer/TechniqueDrawer";
import "./Editor.css";

export default function Editor() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="top-content">
        <TabInput />
        <div className="tab-controls-row">
          <TabArea />
          <RhythmControls />
        </div>
        <div className="tabs">
          <Tabs />
        </div>
      </div>

      <div className="fretboard-slot">
        <Fretboard />
      </div>

      <TechniqueDrawer
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}