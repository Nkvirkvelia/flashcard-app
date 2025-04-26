// Listen for mouseup events to detect text selection
document.addEventListener("mouseup", () => {
  console.log("Mouseup event detected");
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    console.log("Text selected:", selection.toString());
    const range = selection.getRangeAt(0).getBoundingClientRect();
    if (range.width > 0 && range.height > 0) {
      console.log("Valid selection detected, showing floating button");
      showFloatingButton(range, selection.toString());
    }
  } else {
    console.log("No text selected, removing floating button");
    removeExistingButton();
  }
});

// Function to create and display the floating button
function showFloatingButton(range, selectedText) {
  console.log("Creating floating button");
  removeExistingButton();

  const button = document.createElement("div");
  button.className = "floating-flashcard-button";
  button.innerText = "Add Flashcard";
  button.style.position = "absolute";
  button.style.left = `${range.right + window.scrollX}px`;
  button.style.top = `${range.bottom + window.scrollY}px`;
  button.style.backgroundColor = "#007bff";
  button.style.color = "#fff";
  button.style.padding = "5px 10px";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.zIndex = "1000";
  button.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
  button.style.transition = "background-color 0.3s ease";

  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = "#0056b3";
  });
  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = "#007bff";
  });

  button.addEventListener("mouseup", (event) => {
    event.stopPropagation();
  });

  button.addEventListener("click", () => {
    console.log("Floating button clicked, opening modal");
    openModal(selectedText);
    removeExistingButton();
  });

  document.body.appendChild(button);
}

// Function to remove the floating button if it exists
function removeExistingButton() {
  const existingButton = document.querySelector(".floating-flashcard-button");
  if (existingButton) {
    existingButton.remove();
  }
}

// Function to send flashcard data to the backend
async function saveFlashcardToBackend(front, back, hint, tags) {
  try {
    const response = await fetch("http://localhost:3001/api/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ front, back, hint, tags }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save flashcard: ${response.statusText}`);
    }

    alert("Flashcard saved successfully!");
  } catch (error) {
    console.error("Error saving flashcard to backend:", error);
    alert("Failed to save flashcard. Please try again.");
  }
}

// Function to open a modal
function openModal(selectedText) {
  removeExistingModal();

  const modal = document.createElement("div");
  modal.className = "flashcard-modal";
  modal.style.position = "fixed";
  modal.style.left = "50%";
  modal.style.top = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.backgroundColor = "#fff";
  modal.style.padding = "20px";
  modal.style.boxShadow = "0 4px 10px  #000000";
  modal.style.borderRadius = "8px";
  modal.style.zIndex = "1001";
  modal.style.width = "400px";
  modal.style.textAlign = "center";

  const title = document.createElement("h3");
  title.innerText = "Create Flashcard";

  const frontInput = document.createElement("input");
  frontInput.type = "text";
  frontInput.placeholder = "Enter the front of the flashcard";
  frontInput.style.width = "100%";

  const backTextArea = document.createElement("textarea");
  backTextArea.value = selectedText;
  backTextArea.placeholder = "Highlighted text (back)";
  backTextArea.style.width = "100%";

  const hintInput = document.createElement("input");
  hintInput.type = "text";
  hintInput.placeholder = "Enter a hint";
  hintInput.style.width = "100%";

  const tagsDropdown = document.createElement("select");
  tagsDropdown.style.width = "100%";

  const addTagOption = document.createElement("option");
  addTagOption.value = "add-new";
  addTagOption.innerText = "Add New Tag";
  tagsDropdown.appendChild(addTagOption);

  const newTagInput = document.createElement("input");
  newTagInput.type = "text";
  newTagInput.placeholder = "Enter new tag";
  newTagInput.style.width = "100%";
  newTagInput.style.marginTop = "10px";
  newTagInput.style.display = "block"; // Initially hidden

  // Event listener to toggle the input box
  tagsDropdown.addEventListener("change", () => {
    console.log("Dropdown value changed:", tagsDropdown.value); // Debugging
    if (tagsDropdown.value === "add-new") {
      newTagInput.style.display = "block";
    } else {
      newTagInput.style.display = "none";
    }
  });

  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.className = "save-button";

  const cancelButton = document.createElement("button");
  cancelButton.innerText = "Cancel";
  cancelButton.className = "cancel-button";

  // Fetch tags from the backend and populate the dropdown
  fetch("http://localhost:3001/api/tags")
    .then((response) => response.json())
    .then((tags) => {
      tags.forEach((tag) => {
        const option = document.createElement("option");
        option.value = tag;
        option.innerText = tag;
        tagsDropdown.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching tags:", error));

  modal.appendChild(title);
  modal.appendChild(frontInput);
  modal.appendChild(backTextArea);
  modal.appendChild(hintInput);
  modal.appendChild(tagsDropdown);
  modal.appendChild(newTagInput);
  modal.appendChild(saveButton);
  modal.appendChild(cancelButton);

  document.body.appendChild(modal);

  saveButton.addEventListener("click", () => {
    const front = frontInput.value.trim();
    const back = backTextArea.value.trim();
    const hint = hintInput.value.trim();
    const selectedTag = tagsDropdown.value;
    const newTag = newTagInput.value.trim();
    const tags = selectedTag === "add-new" && newTag ? [newTag] : [selectedTag];

    if (!front) {
      alert("The question (front) field cannot be empty.");
      return;
    }

    saveFlashcardToBackend(front, back, hint, tags);
    removeExistingModal();
  });

  cancelButton.addEventListener("click", () => {
    removeExistingModal();
  });
}

// Function to remove the modal if it exists
function removeExistingModal() {
  const existingModal = document.querySelector(".flashcard-modal");
  if (existingModal) {
    existingModal.remove();
  }
}
