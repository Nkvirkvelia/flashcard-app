export function processTags(tagString: string | string[] | null | undefined): string[] {
  if (!tagString) {
    return [];
  }

  // If the input is already an array, return it as-is (after trimming each tag)
  if (Array.isArray(tagString)) {
    return tagString.map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  }

  // If the input is a string, split it by commas and process it
  return tagString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}