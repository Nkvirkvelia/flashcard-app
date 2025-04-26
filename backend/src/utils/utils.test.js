import { processTags } from "./processTags";

describe("processTags", () => {
  it("should return an empty array for null/undefined/empty input", () => {
    expect(processTags(null)).toEqual([]);
    expect(processTags(undefined)).toEqual([]);
    expect(processTags("")).toEqual([]);
  });

  it("should process a single tag with extra spaces", () => {
    expect(processTags(" tag1 ")).toEqual(["tag1"]);
  });

  it("should process multiple tags with varying whitespace", () => {
    expect(processTags(" tag1 , tag2  , tag3 ")).toEqual(["tag1", "tag2", "tag3"]);
  });

  it("should filter out empty tags caused by extra commas", () => {
    expect(processTags("tag1,,tag2,")).toEqual(["tag1", "tag2"]);
  });

  it("should return an empty array for input with only commas/whitespace", () => {
    expect(processTags(", , ")).toEqual([]);
  });
});