import { classifyGesture } from "./gestureUtils";

// Mock types based on MediaPipe Hands output
interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface Hand {
  keypoints: Landmark[];
}

function createThumbsUp(): Hand {
  return {
    keypoints: Array(21)
      .fill(null)
      .map((_, i) => ({
        x: i === 4 ? 0.5 : 0.5,
        y: i === 4 ? 0.2 : 0.5,
        z: 0,
      })),
  };
}

function createFlatHand(): Hand {
  return {
    keypoints: Array(21)
      .fill(null)
      .map((_, i) => ({
        x: 0.1 * i,
        y: 0.5,
        z: 0,
      })),
  };
}

function createThumbsDown(): Hand {
  return {
    keypoints: Array(21)
      .fill(null)
      .map((_, i) => ({
        x: i === 4 ? 0.5 : 0.5,
        y: i === 4 ? 0.9 : 0.5,
        z: 0,
      })),
  };
}

function createAmbiguous(): Hand[] {
  return [createThumbsUp(), createFlatHand()];
}

describe("classifyGesture", () => {
  it("should return 'easy' for thumbs up", () => {
    const result = classifyGesture([createThumbsUp()]);
    expect(result).toBe("easy");
  });

  it("should return 'hard' for flat hand", () => {
    const result = classifyGesture([createFlatHand()]);
    expect(result).toBe("hard");
  });

  it("should return 'wrong' for thumbs down", () => {
    const result = classifyGesture([createThumbsDown()]);
    expect(result).toBe("wrong");
  });

  it("should return 'ambiguous' for mixed gestures", () => {
    const result = classifyGesture(createAmbiguous());
    expect(result).toBe("ambiguous");
  });

  it("should return 'none' for empty hands array", () => {
    const result = classifyGesture([]);
    expect(result).toBe("none");
  });
});
