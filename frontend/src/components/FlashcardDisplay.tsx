/**
 * FlashcardDisplay Component
 * ---------------------------
 * Displays the front and back of a flashcard. Allows the user to request a hint
 * for the current flashcard.
 */

import React, { useState, useEffect } from "react";
import { Flashcard } from "../types";
import { fetchHint } from "../services/api";

interface FlashcardDisplayProps {
  card?: Flashcard; // The flashcard to display
  showBack: boolean; // Whether to show the back of the card
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  card,
  showBack,
}) => {
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);
  const [hintError, setHintError] = useState<string | null>(null);

  // Reset hint state whenever the card changes
  useEffect(() => {
    setHint(null);
    setHintError(null);
    setLoadingHint(false);
  }, [card]);

  /**
   * Fetches a hint for the current flashcard.
   */
  const handleGetHint = async () => {
    setLoadingHint(true);
    setHintError(null);
    setHint(null);

    try {
      const fetchedHint = await fetchHint(card!);
      setHint(fetchedHint);
    } catch (error) {
      setHintError("Failed to load hint. Please try again.");
    } finally {
      setLoadingHint(false);
    }
  };

  // Prevent rendering if card is not yet available
  if (!card) {
    return <div>Loading card...</div>;
  }

  return (
    <div
      className="flashcard-display"
      style={{
        textAlign: "center",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h3>{card.front}</h3>
      <p>{showBack ? card.back : "???"}</p>

      {!showBack && (
        <div>
          <button
            onClick={handleGetHint}
            disabled={loadingHint}
            style={{ margin: "10px", padding: "8px 16px", cursor: "pointer" }}
          >
            {loadingHint ? "Loading..." : "Get Hint"}
          </button>

          {hint && (
            <p>
              <strong>Hint:</strong> {hint}
            </p>
          )}
          {hintError && (
            <p style={{ color: "red" }}>
              <strong>{hintError}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardDisplay;
