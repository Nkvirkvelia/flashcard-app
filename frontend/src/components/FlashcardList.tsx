import React, { useEffect, useState } from "react";
import { fetchAllFlashcards } from "../services/api";
import { Flashcard } from "../types";

const FlashcardList: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const cards = await fetchAllFlashcards();
        setFlashcards(cards);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
    };

    loadFlashcards();
  }, []);

  return (
    <div>
      <h1>Flashcards</h1>
      <ul>
        {flashcards.map((card, index) => (
          <li key={index}>
            <strong>{card.front}</strong>: {card.back}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FlashcardList;