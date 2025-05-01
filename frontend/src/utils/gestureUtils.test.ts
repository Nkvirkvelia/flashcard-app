import { classifyGesture, HandData } from "./gestureUtils";

function createHandWithPoints(
  points: Partial<Record<number, { x: number; y: number; z: number }>>
): HandData {
  const keypoints = Array(21)
    .fill(null)
    .map((_, i) => points[i] || { x: 0.5, y: 0.5, z: 0 });
  return { keypoints };
}

describe("classifyGesture", () => {
  it("returns 'easy' for thumbs up", () => {
    const hand = createHandWithPoints({
      4: { x: 0.8, y: 0.2, z: 0 }, // thumb tip far right & high
      1: { x: 0.5, y: 0.5, z: 0 },
      8: { x: 0.5, y: 0.6, z: 0 },
      12: { x: 0.5, y: 0.6, z: 0 },
      16: { x: 0.5, y: 0.6, z: 0 },
      20: { x: 0.5, y: 0.6, z: 0 },
      6: { x: 0.5, y: 0.5, z: 0 },
      10: { x: 0.5, y: 0.5, z: 0 },
      14: { x: 0.5, y: 0.5, z: 0 },
      18: { x: 0.5, y: 0.5, z: 0 },
    });
    expect(classifyGesture([hand])).toBe("easy");
  });

  it("returns 'wrong' for thumbs down", () => {
    const hand = createHandWithPoints({
      4: { x: 0.2, y: 0.9, z: 0 },
      1: { x: 0.5, y: 0.5, z: 0 },
      8: { x: 0.5, y: 0.6, z: 0 },
      12: { x: 0.5, y: 0.6, z: 0 },
      16: { x: 0.5, y: 0.6, z: 0 },
      20: { x: 0.5, y: 0.6, z: 0 },
      6: { x: 0.5, y: 0.5, z: 0 },
      10: { x: 0.5, y: 0.5, z: 0 },
      14: { x: 0.5, y: 0.5, z: 0 },
      18: { x: 0.5, y: 0.5, z: 0 },
    });
    expect(classifyGesture([hand])).toBe("wrong");
  });

  it("returns 'hard' for peace sign", () => {
    const hand = createHandWithPoints({
      8: { x: 0.3, y: 0.2, z: 0 },
      6: { x: 0.3, y: 0.5, z: 0 },
      12: { x: 0.5, y: 0.2, z: 0 },
      10: { x: 0.5, y: 0.5, z: 0 },
      16: { x: 0.7, y: 0.6, z: 0 },
      14: { x: 0.7, y: 0.4, z: 0 },
      20: { x: 0.9, y: 0.6, z: 0 },
      18: { x: 0.9, y: 0.4, z: 0 },
      0: { x: 0.5, y: 0.6, z: 0 },
    });
    expect(classifyGesture([hand])).toBe("hard");
  });

  it("returns 'ambiguous' for mixed gestures", () => {
    const thumbsUp = createHandWithPoints({
      4: { x: 0.8, y: 0.2, z: 0 },
      1: { x: 0.5, y: 0.5, z: 0 },
      8: { x: 0.5, y: 0.6, z: 0 },
      12: { x: 0.5, y: 0.6, z: 0 },
      16: { x: 0.5, y: 0.6, z: 0 },
      20: { x: 0.5, y: 0.6, z: 0 },
      6: { x: 0.5, y: 0.5, z: 0 },
      10: { x: 0.5, y: 0.5, z: 0 },
      14: { x: 0.5, y: 0.5, z: 0 },
      18: { x: 0.5, y: 0.5, z: 0 },
    });
    const peaceSign = createHandWithPoints({
      8: { x: 0.3, y: 0.2, z: 0 },
      6: { x: 0.3, y: 0.5, z: 0 },
      12: { x: 0.5, y: 0.2, z: 0 },
      10: { x: 0.5, y: 0.5, z: 0 },
      16: { x: 0.7, y: 0.6, z: 0 },
      14: { x: 0.7, y: 0.4, z: 0 },
      20: { x: 0.9, y: 0.6, z: 0 },
      18: { x: 0.9, y: 0.4, z: 0 },
      0: { x: 0.5, y: 0.6, z: 0 },
    });
    expect(classifyGesture([thumbsUp, peaceSign])).toBe("ambiguous");
  });

  it("returns 'none' for empty input", () => {
    expect(classifyGesture([])).toBe("none");
  });
});
