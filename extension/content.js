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

// Function to open a modal
function openModal(selectedText) {
  removeExistingModal();

  // Create the modal overlay
  const overlay = document.createElement("div");
  overlay.id = "flashcard-modal-overlay";
  overlay.className = "modal-overlay";
  overlay.style.display = "none"; // Initially hidden

  // Create the modal content container
  const modal = document.createElement("div");
  modal.id = "flashcard-modal-content";
  modal.className = "flashcard-modal";

  // Add the close button
  const closeButton = document.createElement("span");
  closeButton.id = "flashcard-modal-close";
  closeButton.innerHTML = "&times;";
  closeButton.className = "close-button";
  closeButton.addEventListener("click", () => {
    overlay.style.display = "none";
  });

  // Add the modal title
  const title = document.createElement("h3");
  title.innerText = "Create Flashcard";

  // Add the form
  const form = document.createElement("form");

  // Front input
  const frontLabel = document.createElement("label");
  frontLabel.innerText = "Front *";
  frontLabel.htmlFor = "flashcard-front";
  const frontInput = document.createElement("input");
  frontInput.type = "text";
  frontInput.id = "flashcard-front";
  frontInput.placeholder = "Enter the front of the card";
  frontInput.required = true;

  // Back textarea
  const backLabel = document.createElement("label");
  backLabel.innerText = "Back";
  backLabel.htmlFor = "flashcard-back";
  const backTextArea = document.createElement("textarea");
  backTextArea.id = "flashcard-back";
  backTextArea.value = selectedText;
  backTextArea.readOnly = true;

  // Hint input
  const hintLabel = document.createElement("label");
  hintLabel.innerText = "Hint";
  hintLabel.htmlFor = "flashcard-hint";
  const hintInput = document.createElement("input");
  hintInput.type = "text";
  hintInput.id = "flashcard-hint";
  hintInput.placeholder = "Enter an optional hint";

  // Tags input
  const tagsLabel = document.createElement("label");
  tagsLabel.innerText = "Tags";
  tagsLabel.htmlFor = "flashcard-tags";
  const tagsInput = document.createElement("input");
  tagsInput.type = "text";
  tagsInput.id = "flashcard-tags";
  tagsInput.placeholder = "Enter optional tags, comma-separated";

  // Message area
  const messageArea = document.createElement("div");
  messageArea.id = "flashcard-modal-message";

  // Save button
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.id = "flashcard-save";
  saveButton.innerText = "Save";

  // Clear button
  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.id = "flashcard-clear";
  clearButton.innerText = "Clear";
  clearButton.addEventListener("click", () => {
    frontInput.value = "";
    hintInput.value = "";
    tagsInput.value = "";
    messageArea.textContent = ""; // Clear any messages
  });

  // Append elements to the form
  form.appendChild(frontLabel);
  form.appendChild(frontInput);
  form.appendChild(backLabel);
  form.appendChild(backTextArea);
  form.appendChild(hintLabel);
  form.appendChild(hintInput);
  form.appendChild(tagsLabel);
  form.appendChild(tagsInput);
  form.appendChild(messageArea);
  form.appendChild(saveButton);
  form.appendChild(clearButton);

  // Add form submit event listener
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Clear previous messages
    messageArea.textContent = "";
    messageArea.style.color = "red";

    // Validate the front input
    if (!frontInput.value.trim()) {
      messageArea.textContent = "Front field is required.";
      return;
    }

    // Construct the card data
    const cardData = {
      front: frontInput.value.trim(),
      back: backTextArea.value.trim(),
      hint: hintInput.value.trim() || undefined,
      tags: tagsInput.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag), // Process tags into an array
    };

    try {
      // Send the POST request to the backend
      const response = await fetch("http://localhost:3001/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardData),
      });

      if (response.ok) {
        messageArea.textContent = "Card saved successfully!";
        messageArea.style.color = "green";

        // Clear the form fields (except Back)
        frontInput.value = "";
        hintInput.value = "";
        tagsInput.value = "";

        // Optionally close the modal after a delay
        setTimeout(() => {
          overlay.style.display = "none";
          messageArea.textContent = ""; // Clear the message
        }, 1000);
      } else {
        const errorData = await response.json();
        messageArea.textContent = errorData.message || "Error saving card.";
      }
    } catch (error) {
      console.error("Error saving card:", error);
      messageArea.textContent = "Network error. Unable to save card.";
    }
  });

  // Append elements to the modal
  modal.appendChild(closeButton);
  modal.appendChild(title);
  modal.appendChild(form);

  // Append modal to the overlay
  overlay.appendChild(modal);

  // Append overlay to the document body
  document.body.appendChild(overlay);

  // Show the modal
  overlay.style.display = "block";
}

// Function to remove the modal if it exists
function removeExistingModal() {
  const existingOverlay = document.getElementById("flashcard-modal-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }
}
