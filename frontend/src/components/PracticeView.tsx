/**
 * PracticeView Component
 * ----------------------
 * This component manages the flashcard practice session. It fetches practice cards,
 * displays them one by one, and allows the user to rate their difficulty using buttons
 * or gestures. It also handles advancing to the next day and error handling.
 */

import React, { useState, useEffect } from "react";
import { Flashcard, AnswerDifficulty } from "../types";
import { fetchPracticeCards, submitAnswer, advanceDay } from "../services/api";
import FlashcardDisplay from "./FlashcardDisplay";
import WebcamOverlay from "./WebcamOverlay";

const PracticeView: React.FC = () => {
  // State variables
  const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [showBack, setShowBack] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState<number>(0);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);

  /**
   * Fetches the practice cards for the current day.
   * Resets the session state and handles errors.
   */
  const loadPracticeCards = async () => {
    setIsLoading(true);
    setError(null);
    setSessionFinished(false);
    try {
      const response = await fetchPracticeCards();
      setPracticeCards(response.cards);
      setDay(response.day);
      setCurrentCardIndex(0);
      if (response.cards.length === 0) {
        setSessionFinished(true);
      }
    } catch (err) {
      setError("Failed to load practice cards.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPracticeCards();
  }, []);

  /**
   * Shows the back of the current flashcard.
   */
  const handleShowBack = () => {
    setShowBack(true);
  };

  /**
   * Submits the user's answer for the current flashcard.
   * @param difficulty - The difficulty level selected by the user.
   */
  const handleAnswer = async (difficulty: AnswerDifficulty) => {
    const currentCard = practiceCards[currentCardIndex];
    try {
      await submitAnswer(currentCard.front, currentCard.back, difficulty);
      const isLastCard = currentCardIndex === practiceCards.length - 1;
      if (isLastCard) {
        setSessionFinished(true);
      } else {
        setCurrentCardIndex(currentCardIndex + 1);
      }
      setShowBack(false);
    } catch (err) {
      setError("Failed to submit answer.");
    }
  };

  /**
   * Advances to the next day and fetches new practice cards.
   */
  const handleNextDay = async () => {
    try {
      await advanceDay();
      loadPracticeCards();
    } catch (err) {
      setError("Failed to advance to the next day.");
    }
  };

  /**
   * Handles gesture recognition and maps gestures to difficulty levels.
   * @param gesture - The recognized gesture ("easy", "hard", or "wrong").
   */
  const handleGestureRecognized = (gesture: "easy" | "hard" | "wrong") => {
    if (!showBack) return;

    const difficultyMap = {
      easy: AnswerDifficulty.Easy,
      hard: AnswerDifficulty.Hard,
      wrong: AnswerDifficulty.Wrong,
    };

    handleAnswer(difficultyMap[gesture]);
  };

  // Render logic
  if (isLoading) {
    return <div>Loading practice cards...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (sessionFinished) {
    return (
      <div>
        <h2>Session Complete</h2>
        <p>You've finished all your cards for today.</p>
        <button onClick={handleNextDay}>Go to Next Day</button>
      </div>
    );
  }

  const currentCard = practiceCards[currentCardIndex];

  return (
    <div>
      <h2>Practice - Day {day}</h2>
      <p>
        Card {currentCardIndex + 1} of {practiceCards.length}
      </p>

      <FlashcardDisplay card={currentCard} showBack={showBack} />

      {!showBack ? (
        <button className="show-answer" onClick={handleShowBack}>
          Show Answer
        </button>
      ) : (
        <div>
          <p>How difficult was it?</p>
          <button onClick={() => handleAnswer(AnswerDifficulty.Wrong)}>
            Wrong
          </button>
          <button onClick={() => handleAnswer(AnswerDifficulty.Hard)}>
            Hard
          </button>
          <button onClick={() => handleAnswer(AnswerDifficulty.Easy)}>
            Easy
          </button>
        </div>
      )}

      <WebcamOverlay
        onGestureRecognized={handleGestureRecognized}
        active={showBack}
      />
    </div>
  );
};

export default PracticeView;
