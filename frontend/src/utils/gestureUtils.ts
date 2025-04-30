export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  keypoints: Landmark[];
}

export function isThumbsUp(hand: HandData): boolean {
  const thumbTip = hand.keypoints[4];
  const wrist = hand.keypoints[0];
  return thumbTip.y < wrist.y; // thumb is above wrist
}

export function isThumbsDown(hand: HandData): boolean {
  const thumbTip = hand.keypoints[4];
  const wrist = hand.keypoints[0];
  return thumbTip.y > wrist.y; // thumb is below wrist
}

export function isFlatHand(hand: HandData): boolean {
  const fingers = [8, 12, 16, 20];
  const baseY = hand.keypoints[0].y;
  return fingers.every((idx) => Math.abs(hand.keypoints[idx].y - baseY) < 0.1);
}

export function classifyGesture(
  hands: HandData[]
): "easy" | "hard" | "wrong" | "ambiguous" | "none" {
  if (!hands || hands.length === 0) return "none";

  const detected = new Set<string>();

  for (const hand of hands) {
    if (isThumbsUp(hand)) detected.add("easy");
    else if (isThumbsDown(hand)) detected.add("wrong");
    else if (isFlatHand(hand)) detected.add("hard");
  }

  if (detected.size === 0) return "none";
  if (detected.size > 1) return "ambiguous";

  return [...detected][0] as "easy" | "hard" | "wrong";
}
