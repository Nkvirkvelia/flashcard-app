import React, { useEffect, useState } from "react";
import { fetchAllFlashcards } from "../services/api";
import { Flashcard } from "../types";
import "./FlashcardList.css"; // Import the CSS file for styling

const FlashcardList: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const loadFlashcards = async () => {
    try {
      const cards = await fetchAllFlashcards();
      setFlashcards(cards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    }
  };

  useEffect(() => {
    loadFlashcards();
  }, []);

  return (
    <div className="flashcard-list">
      <h1>Flashcards</h1>
      <div className="flashcard-container">
        {flashcards.map((card, index) => (
          <div className="flashcard" key={index}>
            <div className="flashcard-front">
              <h3>Question</h3>
              <p>{card.front}</p>
            </div>
            <div className="flashcard-back">
              <h3>Answer</h3>
              <p>{card.back}</p>
            </div>
            {card.hint && (
              <div className="flashcard-hint">
                <h4>Hint</h4>
                <p>{card.hint}</p>
              </div>
            )}
            {card.tags && card.tags.length > 0 && (
              <div className="flashcard-tags">
                <h4>Tags</h4>
                <p>{card.tags.join(", ")}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardList;