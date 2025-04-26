// frontend/src/App.tsx

import React, { useState } from "react";
import PracticeView from "./components/PracticeView";
import FlashcardList from "./components/FlashcardList";
import TagDropdown from "./components/TagDropdown";
import "./App.css";

const App: React.FC = () => {
  const [showFlashcardList, setShowFlashcardList] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  return (
    <div className="App">
      <h1>Flashcard Learner</h1>
      <PracticeView />

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setShowFlashcardList(!showFlashcardList)}
          style={{ marginRight: "10px" }}
        >
          {showFlashcardList ? "Hide Flashcard List" : "Show Flashcard List"}
        </button>
        <button onClick={() => setShowTagDropdown(!showTagDropdown)}>
          {showTagDropdown ? "Hide Tag Dropdown" : "Show Tag Dropdown"}
        </button>
      </div>

      {showFlashcardList && <FlashcardList />}
      {showTagDropdown && <TagDropdown />}
    </div>
  );
};

export default App;
