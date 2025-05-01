/**
 * TagDropdown Component
 * ----------------------
 * This component provides a dropdown menu for selecting tags.
 * It fetches available tags from the backend and allows the user to select one.
 */

import React, { useState, useEffect } from "react";

const TagDropdown: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]); // List of available tags
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // Currently selected tag

  /**
   * Fetches tags from the backend when the component mounts.
   */
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        const data = await response.json();
        setTags(data);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };

    fetchTags();
  }, []);

  return (
    <select
      value={selectedTag || ""}
      onChange={(e) => setSelectedTag(e.target.value)}
    >
      <option value="" disabled>
        Select a tag
      </option>
      {tags.map((tag) => (
        <option key={tag} value={tag}>
          {tag}
        </option>
      ))}
    </select>
  );
};

export default TagDropdown;