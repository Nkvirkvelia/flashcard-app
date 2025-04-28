import { processTags } from "../utils/processTags";

describe("processTags", () => {
  it("returns an empty array for null input", () => {
    const result = processTags(null);
    expect(result).toEqual([]);
  });

  it("returns an empty array for undefined input", () => {
    const result = processTags(undefined);
    expect(result).toEqual([]);
  });

  it("returns an empty array for empty string input", () => {
    const result = processTags("");
    expect(result).toEqual([]);
  });

  it("processes a single tag with extra spaces", () => {
    const result = processTags(" tag1 ");
    expect(result).toEqual(["tag1"]);
  });

  it("processes multiple tags with varying whitespace", () => {
    const result = processTags(" tag1 , tag2  , tag3 ");
    expect(result).toEqual(["tag1", "tag2", "tag3"]);
  });

  it("filters out empty tags caused by extra commas", () => {
    const result = processTags("tag1,,tag2,");
    expect(result).toEqual(["tag1", "tag2"]);
  });

  it("returns an empty array for input with only commas/whitespace", () => {
    const result = processTags(", , ");
    expect(result).toEqual([]);
  });

  it("handles input with no commas (single tag)", () => {
    const result = processTags("tag1");
    expect(result).toEqual(["tag1"]);
  });

  it("handles input with multiple consecutive spaces", () => {
    const result = processTags("tag1    ,    tag2");
    expect(result).toEqual(["tag1", "tag2"]);
  });

  it("handles input with special characters in tags", () => {
    const result = processTags("tag1, tag@2, tag#3");
    expect(result).toEqual(["tag1", "tag@2", "tag#3"]);
  });

  it("handles input with numeric tags", () => {
    const result = processTags("123, 456, 789");
    expect(result).toEqual(["123", "456", "789"]);
  });

  it("handles input with mixed alphanumeric tags", () => {
    const result = processTags("tag1, tag2, tag3");
    expect(result).toEqual(["tag1", "tag2", "tag3"]);
  });

  it("handles input with duplicate tags", () => {
    const result = processTags("tag1, tag2, tag1, tag3");
    expect(result).toEqual(["tag1", "tag2", "tag1", "tag3"]); // Does not remove duplicates
  });

  it("handles input with trailing and leading commas", () => {
    const result = processTags(",tag1,tag2,tag3,");
    expect(result).toEqual(["tag1", "tag2", "tag3"]);
  });

  it("handles input with a mix of valid and invalid tags", () => {
    const result = processTags("tag1, , ,tag2,,tag3");
    expect(result).toEqual(["tag1", "tag2", "tag3"]);
  });
});