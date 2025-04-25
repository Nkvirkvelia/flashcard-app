// frontend/src/App.tsx

import React from "react";
import PracticeView from "./components/PracticeView";
import "./App.css"; // Optional: import your global CSS if you have any

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Flashcard Learner</h1>
      <PracticeView />
    </div>
  );
};

export default App;
