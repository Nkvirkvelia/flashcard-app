/**
 * Processes a tag string or array into a normalized array of tags.
 * @param tagString - A string or array of tags to process.
 * @returns An array of unique, trimmed tags.
 */
export function processTags(tagString: string | string[] | null | undefined): string[] {
  if (!tagString) {
    return [];
  }

  const tags = Array.isArray(tagString) ? tagString : tagString.split(",");
  return tags
    .map((tag) => tag.trim()) // Remove extra whitespace
    .filter((tag) => tag.length > 0) // Remove empty tags
    .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
}