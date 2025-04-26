import request from "supertest";
import { app } from "../server";
import * as state from "../state";

// Mock the state module
jest.mock("../src/state");

// Setup before tests
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();

  // Mock initial state structure
  (state as any).mockState = {
    buckets: {},
  };
});

describe("POST /api/cards", () => {
  // Test cases
});
