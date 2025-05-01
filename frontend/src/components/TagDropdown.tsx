/**
 * TagDropdown Component
 * ----------------------
 * This component provides a dropdown menu for selecting tags.
 * It fetches available tags from the backend and allows the user to select one.
 */

import React, { useEffect, useState } from "react";
import { fetchTags } from "../services/api";

const TagDropdown: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const fetchedTags = await fetchTags();
        setTags(fetchedTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    loadTags();
  }, []);

  return (
    <div>
      <h2>Available Tags</h2>
      <select style={{ width: "200px", padding: "5px" }}>
        {tags.map((tag, index) => (
          <option key={index} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TagDropdown;