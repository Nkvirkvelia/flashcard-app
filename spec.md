## Project Specification: Flashcard App Enhancements

**Version:** 1.0
**Date:** 2024-03-12

### 1. Overview

This document outlines the requirements for enhancing an existing flashcard application. The goal is to implement two new features:

1.  A **Browser Extension** enabling users to quickly create new flashcards from text selected on any webpage.
2.  **Webcam-based Hand Gesture Recognition** allowing users to indicate flashcard difficulty ("Wrong", "Hard", "Easy") during practice sessions using hand gestures as an alternative to mouse clicks.

### 2. Feature 1: Browser Extension for Flashcard Creation

**Goal:** Allow users to quickly create flashcards from highlighted text on webpages.

**2.1. Triggering Card Creation**

- **Action:** When the user selects (highlights) text on any webpage.
- **UI Response:** A floating UI element containing an icon and the text "add new flashcard" should appear immediately.
- **Positioning:** This element should appear just below the bottom-right corner of the user's text selection rectangle.

**2.2. Card Creation Popup Modal**

- **Trigger:** Clicking the floating "add new flashcard" element.
- **Type:** An overlay modal window injected dynamically onto the current webpage. The rest of the page may be dimmed.
- **Closing Mechanism:** The modal can only be closed by:
  - Clicking the "Save" button (upon success).
  - Clicking the "Cancel" button.
  - Clicking a dedicated close icon ("X") located in the top-right corner of the modal (functionally equivalent to "Cancel").
  - _Note:_ Clicking outside the modal area should **not** close it.
- **Content Fields:**
  - **Front:**
    - Type: Text input field.
    - Default Value: Empty.
    - Placeholder: "Enter the front of the card".
    - Validation: Required (visually indicated, e.g., with an asterisk \*).
  - **Back:**
    - Type: Text display area (read-only or disabled input).
    - Default Value: Pre-filled with the text selected by the user on the webpage.
    - Validation: Required (implicitly fulfilled by selection).
  - **Hint:**
    - Type: Text input field.
    - Default Value: Empty.
    - Placeholder: "Enter an optional hint".
    - Validation: Optional (visually indicated).
  - **Tags:**
    - Type: Text input field.
    - Default Value: Empty.
    - Placeholder: "Enter optional tags, comma-separated".
    - Validation: Optional (visually indicated).
- **Buttons:**
  - "Save" button.
  - "Cancel" button.
- **Messaging Area:** A designated area below the buttons for displaying success or error messages.

**2.3. Data Handling and API Interaction**

- **Tags Processing:**
  - Input: User enters tags as a single comma-separated string.
  - Processing: Before sending to the API:
    1.  Split the string by commas.
    2.  Trim leading/trailing whitespace from each resulting tag string.
    3.  Filter out any tags that are empty strings after trimming.
  - Output: A `ReadonlyArray<string>` containing the processed tags.
- **API Request (On Save):**
  - Method: `POST`
  - Endpoint: `/api/cards` (hosted on the existing backend, e.g., `http://localhost:PORT/api/cards`)
  - Authentication: None required.
  - Request Body Format: JSON
  - Body Structure:
    ```json
    {
      "front": "User input for the front",
      "back": "Selected text from the webpage",
      "hint": "User input for the hint", // Field should be OMITTED if hint is empty
      "tags": ["processed", "tag", "array"] // Field should be OMITTED if no tags are provided
    }
    ```

**2.4. Success Response Handling**

- **Condition:** The `POST /api/cards` request returns a successful response (e.g., 201 Created).
- **UI Feedback:** Display the message "Card saved successfully" in the messaging area below the buttons.
- **Modal Behavior:** Automatically close the modal 1 second after displaying the success message.

**2.5. Error Response Handling**

- **Condition:** The `POST /api/cards` request fails (e.g., network error, 4xx or 5xx status code).
- **UI Feedback:**
  - Attempt to parse the error message from the server's response body (assuming JSON format like `{"message": "Error description"}`).
  - Display this specific error message in the messaging area below the buttons. If parsing fails, display a generic message like "Error saving card".
- **Modal Behavior:** The modal must remain open, allowing the user to potentially correct errors (e.g., missing required fields) and attempt to save again.

**2.6. Technical Implementation Notes (Browser Extension)**

- **Manifest Version:** Use Manifest V3.
- **Key Manifest Entries:**
  - `"manifest_version": 3`
  - `"name": "Flashcard Quick Add"` (or similar)
  - `"version": "1.0"`
  - `"description": "Quickly create flashcards from selected text."`
  - `"permissions": ["scripting", "storage"]` (`storage` may be needed for future features or configuration)
  - `"host_permissions": ["<all_urls>", "http://localhost/*/"]` (Allows running on all pages and communicating with the local backend)
  - `"background": {"service_worker": "background.js"}` (Likely needed for coordination/API calls)
  - `"content_scripts": [...]` (Define content script(s) to inject on pages matching `<all_urls>`)
  - `"icons": {...}` (Define extension icons)
- **Content Script (`content.js`):** Responsible for detecting text selection (`mouseup` event), calculating position, injecting/removing the floating button, injecting/removing the modal overlay DOM elements, and communicating with the background script or handling popup logic directly.
- **Modal Logic (`popup.js` or integrated):** Handles form input, tag processing, calls to the backend API (likely via messages to the background service worker), and updates the modal UI based on API responses (success/error messages, closing).

### 3. Feature 2: Webcam Hand Gesture Recognition for Practice

**Goal:** Provide an alternative input method during flashcard practice sessions using hand gestures detected via webcam.

**3.1. Context and Activation**

- **Location:** Within the existing flashcard practice web application page (running on `localhost`).
- **UI Element:** A small webcam overlay window appears in the bottom-right corner of the practice page.
- **Initial State:**
  - The overlay appears immediately on page load.
  - It has a grey, rounded rectangular background.
  - It contains text that acts as a button: "Access Camera".
- **Activation Flow:**
  1.  User clicks the "Access Camera" text/button.
  2.  The browser prompts for camera permission.
  3.  **Permission Granted:**
      - The grey background is replaced with the live feed from the user's webcam.
      - The necessary libraries (TensorFlow.js, MediaPipe Hands model) are loaded _at this point_.
      - Gesture detection begins.
  4.  **Permission Denied:**
      - The overlay remains grey.
      - The text inside changes to "Permission Denied".
      - The "Access Camera" button/text should remain or reappear, allowing the user to try granting permission again later without reloading the page.

**3.2. Gesture Recognition Engine**

- **Technology:** TensorFlow.js integration with the MediaPipe Hands model.
- **Resource Loading:** The TFJS library and MediaPipe Hands model should only be downloaded and initialized _after_ the user explicitly grants camera permission, not on initial page load.

**3.3. Defined Gestures and Actions**

- **Thumbs Up:** Recognized gesture corresponds to the **"Easy"** difficulty choice.
- **Flat Hand:** Recognized gesture corresponds to the **"Hard"** difficulty choice. (_Developer Note: Clarify specific pose if needed - assume palm facing camera, fingers extended and together._)
- **Thumbs Down:** Recognized gesture corresponds to the **"Wrong"** difficulty choice.

**3.4. Gesture Detection Logic**

- **Multi-Hand Handling:** The system should process landmarks for all hands detected in the frame. Recognition should proceed if **one and only one** type of the defined gestures (Thumbs Up, Flat Hand, or Thumbs Down) is consistently detected across all visible hands.
  - Example 1: One hand Thumbs Up, other hand neutral -> Recognize Thumbs Up.
  - Example 2: Two hands Thumbs Up -> Recognize Thumbs Up.
  - Example 3: One hand Thumbs Up, one hand Flat Hand -> Ambiguous, reset any timers.
  - Example 4: No defined gestures detected -> Reset any timers.
- **Hold Requirement:** A clearly recognized, non-ambiguous gesture must be held continuously for **3 seconds** to be accepted.
- **Visual Feedback (During Hold):** As a valid gesture is being held, the border of the webcam overlay window should progressively fill with a color indicating the detected gesture:
  - Thumbs Up: **Green**
  - Flat Hand: **Orange**
  - Thumbs Down: **Red**
- **Hold Interruption:** If the gesture stops, changes, or becomes ambiguous (e.g., conflicting gestures) before the 3 seconds are complete, the border fill progress must reset immediately to empty.

**3.5. Action Triggering and Cooldown**

- **Trigger:** Successful completion of the 3-second hold for a recognized gesture.
- **Immediate Feedback:** Upon successful 3-second hold:
  - The webcam overlay border turns fully solid in the corresponding color (Green, Orange, or Red) for **0.5 seconds**.
- **Action Execution:** Simultaneously with the solid border feedback, the system programmatically triggers the corresponding difficulty action ("Easy", "Hard", or "Wrong"), effectively simulating a click on the respective button. This should advance the flashcard application to the next card state as usual.
- **Cooldown Period:** Immediately after triggering the action, gesture recognition is paused for **1 second**. This prevents the previous gesture from being immediately re-detected for the new card.
- **Resumption:** After the 1-second cooldown, gesture recognition resumes actively for the currently displayed flashcard.

**3.6. Coexistence with Button Clicks**

- The existing "Wrong", "Hard", and "Easy" buttons must remain functional. Users should be able to use either mouse clicks or hand gestures interchangeably during the practice session.

### 4. Backend API Endpoint Specification (`/api/cards`)

- **Method:** `POST`
- **URL Path:** `/api/cards`
- **Host:** Existing backend server (e.g., `http://localhost:PORT`)
- **Authentication:** None required.
- **Request Body:** JSON object containing `front` (string, required), `back` (string, required), `hint` (string, optional), and `tags` (array of strings, optional). See Section 2.3 for details.
- **Core Logic:**
  - Validate the presence of required `front` and `back` fields.
  - Create a new `Flashcard` object.
  - Add the newly created flashcard to Bucket 0 in the application state managed by `state.ts`. Ensure Bucket 0 is created if it doesn't exist.
  - Persist the updated state.
- **Responses:**
  - **Success (201 Created):**
    - Body: `{"message": "Card added successfully", "card": {"front": ..., "back": ..., "hint": ..., "tags": [...]}}`
  - **Client Error (400 Bad Request):**
    - Trigger: Missing `front` or `back` in request body.
    - Body: `{"message": "Front and back are required"}`
  - **Server Error (500 Internal Server Error):**
    - Trigger: Any unexpected error during processing.
    - Body: `{"message": "Error adding card"}`

### 5. Testing Requirements (Outline)

The following areas require testing. Detailed test cases should be developed based on this outline.

**5.1. Browser Extension - Content Script**
_ Verify appearance (visibility, approximate position relative to selection) of the "add new flashcard" element on text selection.
_ Verify disappearance of the element on deselection or click outside.

**5.2. Browser Extension - Popup Modal Logic**
_ Verify initial state: placeholders, required indicators, 'Back' field pre-filled.
_ Verify tag processing: comma splitting, whitespace trim, empty tag removal.
_ Verify UI on successful save: success message display, auto-close after 1s.
_ Verify UI on failed save: correct server error message display, modal remains open.
_ Verify 'Cancel' and 'X' button functionality (close modal without saving).
_ Verify basic required field validation prevents API call if 'Front' is empty.

**5.3. Backend API (`POST /api/cards`)**
_ `describe("POST /api/cards")`
_ `it("adds new card to state with correct fields (front, back, hint, tags)")`
_ `it("adds new card to bucket 0")`
_ `it("returns 400 if required fields (front, back) are missing")`
_ `it("handles optional fields correctly (hint missing, tags missing, both missing)")`
_ `it("returns 201 status and correct success response body on success")`

**5.4. Gesture Recognition System**
_ **Permissions & Overlay UI:**
_ Test initial overlay state (grey, "Access Camera").
_ Test camera permission prompt trigger.
_ Test UI state change upon permission grant (webcam feed visible).
_ Test UI state change upon permission denial ("Permission Denied" text, button available).
_ Verify TFJS/MediaPipe loads only _after_ permission grant.
_ **Gesture Detection Logic (using mock data):**
_ Test recognition of Thumbs Up, Flat Hand, Thumbs Down from mock landmarks.
_ Test 3-second hold timer and corresponding border fill animation.
_ Test timer/border reset on gesture change/stop before 3s.
_ Test triggering of correct ("Easy"/"Hard"/"Wrong") action post-3s hold.
_ Test solid border feedback on successful recognition (0.5s duration).
_ Test 1-second cooldown period post-recognition.
_ Test multi-hand logic (single gesture type OK, ambiguous input resets).

**5.5. Integration Tests**
_ E2E Browser Extension: Select text -> Add Card -> Save -> Verify card exists in backend/practice.
_ E2E Gesture Recognition: Start practice -> Grant camera -> Use gesture (e.g., Thumbs Up) -> Verify card moves correctly (e.g., to next bucket) and next card loads.

**5.6. Manual Testing** \* Crucial for usability, especially for gesture recognition robustness (different lighting, backgrounds, hand shapes/sizes) and extension behavior across diverse websites.

---

This specification should provide a clear roadmap for development.
