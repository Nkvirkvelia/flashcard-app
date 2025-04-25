import React, { useState } from "react";
import { Flashcard } from "../types";
import { fetchHint } from "../services/api";

interface FlashcardDisplayProps {
  card: Flashcard;
  showBack: boolean;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  card,
  showBack,
}) => {
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);
  const [hintError, setHintError] = useState<string | null>(null);

  // Function to fetch the hint when the "Get Hint" button is clicked
  const handleGetHint = async () => {
    setLoadingHint(true);
    setHintError(null);
    setHint(null); // Clear any previous hint

    try {
      const fetchedHint = await fetchHint(card);
      setHint(fetchedHint);
    } catch (error) {
      setHintError("Failed to load hint. Please try again.");
    } finally {
      setLoadingHint(false);
    }
  };

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
      {/* Display front of card */}
      <h3>{card.front}</h3>

      {/* Conditionally display the back of the card or "???" */}
      <p>{showBack ? card.back : "???"}</p>

      {/* Conditionally show "Get Hint" button */}
      {!showBack && (
        <div>
          <button
            onClick={handleGetHint}
            disabled={loadingHint}
            style={{ margin: "10px", padding: "8px 16px", cursor: "pointer" }}
          >
            {loadingHint ? "Loading..." : "Get Hint"}
          </button>

          {/* Display hint or error message */}
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
