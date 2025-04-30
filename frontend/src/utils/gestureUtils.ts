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

export function isPeaceSign(hand: HandData): boolean {
  const tip = (i: number) => hand.keypoints[i].y;
  const pip = (i: number) => hand.keypoints[i - 2].y; // one joint before tip

  const isExtended = (tipIdx: number) => tip(tipIdx) < pip(tipIdx);

  const indexUp = isExtended(8); // index finger
  const middleUp = isExtended(12); // middle finger
  const ringDown = tip(16) > pip(16);
  const pinkyDown = tip(20) > pip(20);

  return indexUp && middleUp && ringDown && pinkyDown;
}

export function classifyGesture(
  hands: HandData[]
): "easy" | "hard" | "wrong" | "ambiguous" | "none" {
  if (!hands || hands.length === 0) return "none";

  const detected = new Set<string>();

  for (const hand of hands) {
    if (isThumbsUp(hand)) detected.add("easy");
    else if (isThumbsDown(hand)) detected.add("wrong");
    else if (isPeaceSign(hand)) detected.add("hard");
  }

  if (detected.size === 0) return "none";
  if (detected.size > 1) return "ambiguous";

  return [...detected][0] as "easy" | "hard" | "wrong";
}
