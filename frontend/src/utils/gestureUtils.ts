/**
 * Gesture Utilities
 * -----------------
 * Provides functions to classify hand gestures for flashcard interaction.
 */

export interface Landmark {
  x: number; // X-coordinate of the landmark
  y: number; // Y-coordinate of the landmark
  z: number; // Z-coordinate of the landmark (depth)
}

export interface HandData {
  keypoints: Landmark[]; // Array of landmarks representing the hand
}

/**
 * Determines if the hand gesture is a thumbs-up.
 * @param hand - The hand data to analyze.
 * @returns True if the gesture is a thumbs-up, false otherwise.
 */
export function isThumbsUp(hand: HandData): boolean {
  const thumbTip = hand.keypoints[4]; //Thumb tip
  const thumbMcp = hand.keypoints[1]; // Thumb base
  const indexTip = hand.keypoints[8]; // Index finger tip
  const middleTip = hand.keypoints[12]; // Middle finger tip
  const ringTip = hand.keypoints[16]; // Ring finger tip
  const pinkyTip = hand.keypoints[20]; // Pinky finger tip

  // Get finger knuckles (proximal phalanges)
  const indexPip = hand.keypoints[6];
  const middlePip = hand.keypoints[10];
  const ringPip = hand.keypoints[14];
  const pinkyPip = hand.keypoints[18];

  // Check if thumb is extended away from palm
  const thumbExtended = Math.abs(thumbTip.x - thumbMcp.x) > 0.05;

  // Check if thumb is the highest point of the hand
  const thumbIsHighest =
    thumbTip.y < indexTip.y &&
    thumbTip.y < middleTip.y &&
    thumbTip.y < ringTip.y &&
    thumbTip.y < pinkyTip.y;

  // Check that other fingers are curled (tips closer to palm than knuckles)
  const fingersCurled =
    indexTip.y > indexPip.y &&
    middleTip.y > middlePip.y &&
    ringTip.y > ringPip.y &&
    pinkyTip.y > pinkyPip.y;

  return thumbExtended && thumbIsHighest && fingersCurled;
}

/**
 * Determines if the hand gesture is a thumbs-down.
 * @param hand - The hand data to analyze.
 * @returns True if the gesture is a thumbs-down, false otherwise.
 */
export function isThumbsDown(hand: HandData): boolean {
  const thumbTip = hand.keypoints[4];
  const thumbMcp = hand.keypoints[1]; // Thumb base
  const indexTip = hand.keypoints[8]; // Index finger tip
  const middleTip = hand.keypoints[12]; // Middle finger tip
  const ringTip = hand.keypoints[16]; // Ring finger tip
  const pinkyTip = hand.keypoints[20]; // Pinky finger tip

  // Get finger knuckles (proximal phalanges)
  const indexPip = hand.keypoints[6];
  const middlePip = hand.keypoints[10];
  const ringPip = hand.keypoints[14];
  const pinkyPip = hand.keypoints[18];

  // Check if thumb is extended away from palm
  const thumbExtended = Math.abs(thumbTip.x - thumbMcp.x) > 0.05;

  // Check if thumb is the lowest point of the hand
  const thumbIsLowest =
    thumbTip.y > indexTip.y &&
    thumbTip.y > middleTip.y &&
    thumbTip.y > ringTip.y &&
    thumbTip.y > pinkyTip.y;

  // Check that other fingers are curled (tips closer to palm than knuckles)
  const fingersCurled =
    indexTip.y > indexPip.y &&
    middleTip.y > middlePip.y &&
    ringTip.y > ringPip.y &&
    pinkyTip.y > pinkyPip.y;

  return thumbExtended && thumbIsLowest && fingersCurled;
}

/**
 * Determines if the hand gesture is a peace sign.
 * @param hand - The hand data to analyze.
 * @returns True if the gesture is a peace sign, false otherwise.
 */
export function isPeaceSign(hand: HandData): boolean {
  const indexTip = hand.keypoints[8]; // Index fingertip
  const indexPip = hand.keypoints[6]; // Index PIP joint
  const middleTip = hand.keypoints[12]; // Middle fingertip
  const middlePip = hand.keypoints[10]; // Middle PIP joint
  const ringTip = hand.keypoints[16]; // Ring fingertip
  const ringPip = hand.keypoints[14]; // Ring PIP joint
  const pinkyTip = hand.keypoints[20]; // Pinky fingertip
  const pinkyPip = hand.keypoints[18]; // Pinky PIP joint
  const wrist = hand.keypoints[0];

  // Check if index and middle fingers are extended (tips above PIPs)
  const indexExtended = indexTip.y < indexPip.y;
  const middleExtended = middleTip.y < middlePip.y;

  // Check if ring and pinky fingers are curled (tips below PIPs)
  const ringCurled = ringTip.y > ringPip.y;
  const pinkyCurled = pinkyTip.y > pinkyPip.y;

  // Make sure index and middle are significantly extended (not just slightly)
  const indexSignificantlyExtended = indexTip.y < wrist.y - 0.1;
  const middleSignificantlyExtended = middleTip.y < wrist.y - 0.1;

  return (
    indexExtended &&
    middleExtended &&
    ringCurled &&
    pinkyCurled &&
    indexSignificantlyExtended &&
    middleSignificantlyExtended
  );
}

/**
 * Classifies the gesture based on hand data.
 * @param hands - Array of hand data to classify.
 * @returns The classified gesture ("easy", "hard", "wrong", "ambiguous", or "none").
 */
export function classifyGesture(
  hands: HandData[]
): "easy" | "hard" | "wrong" | "ambiguous" | "none" {
  if (!hands || hands.length === 0) return "none";

  const detected = new Set<string>();

  for (const hand of hands) {
    if (isPeaceSign(hand)) detected.add("hard");
    else if (isThumbsUp(hand)) detected.add("easy");
    else if (isThumbsDown(hand)) detected.add("wrong");
  }

  if (detected.size === 0) return "none";
  if (detected.size > 1) return "ambiguous";

  return [...detected][0] as "easy" | "hard" | "wrong";
}
