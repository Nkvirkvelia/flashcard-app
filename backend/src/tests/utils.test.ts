/**
 * @file utils.test.ts
 * @description Unit tests for utility functions in the application.
 *              Specifically tests `processTags`, a helper that takes a comma-separated string
 *              and returns an array of cleaned tag strings.
 *
 * The `processTags` function:
 * - Handles null, undefined, and empty input by returning an empty array.
 * - Trims whitespace from tags.
 * - Ignores empty entries caused by extra commas.
 * - Preserves tag order and allows duplicates.
 */

import { processTags } from "../utils/processTags";

describe("processTags", () => {
  // Handles null input
  it("returns an empty array for null input", () => {
    const result = processTags(null);
    expect(result).toEqual([]);
  });

  // Handles undefined input
  it("returns an empty array for undefined input", () => {
    const result = processTags(undefined);
    expect(result).toEqual([]);
  });

  // Handles empty string input
  it("returns an empty array for empty string input", () => {
    const result = processTags("");
    expect(result).toEqual([]);
  });

  // Trims leading and trailing whitespace from a single tag
  it("processes a single tag with extra spaces", () => {
    const result = processTags(" tag1 ");
    expect(result).toEqual(["tag1"]);
  });

  // Processes multiple tags with inconsistent whitespace
  it("processes multiple tags with varying whitespace", () => {
    const result = processTags(" tag1 , tag2  , tag3 ");
    expect(result).toEqual(["tag1", "tag2", "tag3"]);
  });

  // Filters out empty tags caused by double commas
  it("filters out empty tags caused by extra commas", () => {
    const result = processTags("tag1,,tag2,");
    expect(result).toEqual(["tag1", "tag2"]);
  });

  // Filters out tags when input is only commas and whitespace
  it("returns an empty array for input with only commas/whitespace", () => {
    const result = processTags(", , ");
    expect(result).toEqual([]);
  });

  // Handles input with a single tag and no commas
  it("handles input with no commas (single tag)", () => {
    const result = processTags("tag1");
    expect(result).toEqual(["tag1"]);
  });

  // Handles excessive spacing between tags
  it("handles input with multiple consecutive spaces", () => {
    const result = processTags("tag1    ,    tag2");
    expect(result).toEqual(["tag1", "tag2"]);
  });

  // Supports special characters in tags
  it("handles input with special characters in tags", () => {
    const result = processTags("tag1, tag@2, tag#3");
    expect(result).toEqual(["tag1", "tag@2", "tag#3"]);
  });

  // Supports numeric tag strings
  it("handles input with numeric tags", () => {
    const result = processTags("123, 456, 789");
    expect(result).toEqual(["123", "456", "789"]);
  });

  // Accepts alphanumeric combinations
  it("handles input with mixed alphanumeric tags", () => {
    const result = processTags("tag1, tag2, tag3");
    expect(result).toEqual(["tag1", "tag2", "tag3"]);
  });

  // Does not remove duplicate tags
  it("handles input with duplicate tags", () => {
    const result = processTags("tag1, tag2, tag1, tag3");
    expect(result).toEqual(["tag1", "tag2", "tag1", "tag3"]);
  });

  // Ignores leading and trailing commas
  it("handles input with trailing and leading commas", () => {
    const result = processTags(",tag1,tag2,tag3,");
    expect(result).toEqual(["tag1", "tag2", "tag3"]);
  });

  // Handles valid tags mixed with empty strings
  it("handles input with a mix of valid and invalid tags", () => {
    const result = processTags("tag1, , ,tag2,,tag3");
    expect(result).toEqual(["tag1", "tag2", "tag3"]);
  });
});
