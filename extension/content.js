// Listen for mouseup events to detect text selection
document.addEventListener("mouseup", () => {
  console.log("Mouseup event detected");
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    console.log("Text selected:", selection.toString());
    const range = selection.getRangeAt(0).getBoundingClientRect();
    if (range.width > 0 && range.height > 0) { // Ensure valid selection
      console.log("Valid selection detected, showing floating button");
      showFloatingButton(range, selection.toString());
    }
  } else {
    console.log("No text selected, removing floating button");
    removeExistingButton(); // Remove the button if no text is selected
  }
});

// Function to create and display the floating button
function showFloatingButton(range, selectedText) {
  console.log("Creating floating button");
  // Remove any existing button
  removeExistingButton();

  // Create the button
  const button = document.createElement("div");
  button.className = "floating-flashcard-button"; // Add a class for easier removal
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

  // Add hover effect
  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = "#0056b3";
  });
  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = "#007bff";
  });

  // Prevent mouseup on the button from propagating
  button.addEventListener("mouseup", (event) => {
    console.log("Mouseup event stopped on floating button");
    event.stopPropagation();
  });

  // Append the button to the document
  document.body.appendChild(button);

  // Add click event to open the modal
  button.addEventListener("click", () => {
    console.log("Floating button clicked, opening modal");
    openModal(selectedText); // Open the modal with the selected text
    removeExistingButton(); // Remove the floating button after clicking
  });
}

// Function to remove the floating button if it exists
function removeExistingButton() {
  console.log("Removing floating button if it exists");
  const existingButton = document.querySelector(".floating-flashcard-button");
  if (existingButton) {
    existingButton.remove();
    console.log("Floating button removed");
  }
}

// Function to open a modal
function openModal(selectedText) {
  console.log("Opening modal with selected text:", selectedText);
  // Remove any existing modal
  removeExistingModal();

  // Create the modal container
  const modal = document.createElement("div");
  modal.className = "flashcard-modal";
  modal.style.position = "fixed";
  modal.style.left = "50%";
  modal.style.top = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.backgroundColor = "#fff";
  modal.style.padding = "20px";
  modal.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
  modal.style.borderRadius = "8px";
  modal.style.zIndex = "1001";
  modal.style.width = "400px";
  modal.style.textAlign = "center";

  // Add modal content
  const title = document.createElement("h3");
  title.innerText = "Create Flashcard";
  title.style.marginBottom = "10px";

  const frontInput = document.createElement("input");
  frontInput.type = "text";
  frontInput.placeholder = "Enter the question (front)";
  frontInput.style.width = "100%";
  frontInput.style.marginBottom = "10px";
  frontInput.style.padding = "5px";

  const backTextArea = document.createElement("textarea");
  backTextArea.value = selectedText;
  backTextArea.placeholder = "Highlighted text (back)";
  backTextArea.style.width = "100%";
  backTextArea.style.height = "60px";
  backTextArea.style.marginBottom = "10px";
  backTextArea.style.padding = "5px";

  const hintInput = document.createElement("input");
  hintInput.type = "text";
  hintInput.placeholder = "Enter a hint";
  hintInput.style.width = "100%";
  hintInput.style.marginBottom = "10px";
  hintInput.style.padding = "5px";

  const tagsInput = document.createElement("input");
  tagsInput.type = "text";
  tagsInput.placeholder = "Enter tags (comma-separated)";
  tagsInput.style.width = "100%";
  tagsInput.style.marginBottom = "10px";
  tagsInput.style.padding = "5px";

  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.style.marginRight = "10px";
  saveButton.style.padding = "5px 10px";
  saveButton.style.backgroundColor = "#007bff";
  saveButton.style.color = "#fff";
  saveButton.style.border = "none";
  saveButton.style.borderRadius = "5px";
  saveButton.style.cursor = "pointer";

  const cancelButton = document.createElement("button");
  cancelButton.innerText = "Cancel";
  cancelButton.style.padding = "5px 10px";
  cancelButton.style.backgroundColor = "#ccc";
  cancelButton.style.color = "#000";
  cancelButton.style.border = "none";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.cursor = "pointer";

  // Append elements to the modal
  modal.appendChild(title);
  modal.appendChild(frontInput);
  modal.appendChild(backTextArea);
  modal.appendChild(hintInput);
  modal.appendChild(tagsInput);
  modal.appendChild(saveButton);
  modal.appendChild(cancelButton);

  // Append the modal to the document
  document.body.appendChild(modal);

  // Add event listeners for buttons
  saveButton.addEventListener("click", () => {
    const front = frontInput.value.trim();
    const back = backTextArea.value.trim();
    const hint = hintInput.value.trim();
    const tags = tagsInput.value.split(",").map(tag => tag.trim()).filter(tag => tag);

    if (!front) {
      alert("The question (front) field cannot be empty.");
      return;
    }

    console.log("Flashcard saved:", { front, back, hint, tags });
    alert(`Flashcard saved:\nFront: ${front}\nBack: ${back}\nHint: ${hint}\nTags: ${tags.join(", ")}`);
    removeExistingModal();
  });

  cancelButton.addEventListener("click", () => {
    console.log("Cancel button clicked, closing modal");
    removeExistingModal();
  });
}

// Function to remove the modal if it exists
function removeExistingModal() {
  console.log("Removing modal if it exists");
  const existingModal = document.querySelector(".flashcard-modal");
  if (existingModal) {
    existingModal.remove();
    console.log("Modal removed");
  }
}