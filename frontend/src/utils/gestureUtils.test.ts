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

function createPeaceSign(): Hand {
  return {
    keypoints: Array(21)
      .fill(null)
      .map((_, i) => {
        // index(8) and middle(12) tips higher than joints
        if (i === 8 || i === 12) return { x: i * 0.05, y: 0.2, z: 0 };
        if (i === 6 || i === 10) return { x: i * 0.05, y: 0.5, z: 0 }; // PIP
        if (i === 16 || i === 20) return { x: i * 0.05, y: 0.6, z: 0 }; // ring/pinky tips
        if (i === 14 || i === 18) return { x: i * 0.05, y: 0.4, z: 0 }; // ring/pinky PIP
        return { x: i * 0.05, y: 0.5, z: 0 };
      }),
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
  return [createThumbsUp(), createPeaceSign()];
}

describe("classifyGesture", () => {
  it("should return 'easy' for thumbs up", () => {
    const result = classifyGesture([createThumbsUp()]);
    expect(result).toBe("easy");
  });

  it("should return 'hard' for flat hand", () => {
    const result = classifyGesture([createPeaceSign()]);
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
