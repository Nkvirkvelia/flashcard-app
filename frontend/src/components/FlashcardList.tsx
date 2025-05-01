/**
 * FlashcardList Component
 * ------------------------
 * Displays a list of flashcards. Each flashcard is rendered as a card
 * with its front and back content.
 */

import React from "react";
import "./FlashcardList.css";

interface Flashcard {
  front: string; // Front text of the flashcard
  back: string; // Back text of the flashcard
}

interface FlashcardListProps {
  flashcards: Flashcard[]; // Array of flashcards to display
}

const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards }) => {
  return (
    <div className="flashcard-list">
      {flashcards.map((flashcard, index) => (
        <div key={index} className="flashcard-container">
          <h3>{flashcard.front}</h3>
          <p>{flashcard.back}</p>
        </div>
      ))}
    </div>
  );
};

export default FlashcardList;