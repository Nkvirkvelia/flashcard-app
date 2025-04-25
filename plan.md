Okay, let's create a detailed blueprint and break it down into iterative, test-driven implementation steps, followed by the corresponding LLM prompts.

## Development Blueprint & Iterative Plan

**Goal:** Implement the Browser Extension and Webcam Gesture Recognition features according to the specification.

**Strategy:** Test-Driven Development (TDD). Build incrementally, starting with backend verification, then the extension, then gesture recognition. Each step includes tests.

**Phase 1: Backend API Verification & Setup**

1.  **Step 1.1: Test Backend API (`POST /api/cards`)**
    - **Goal:** Ensure the existing backend endpoint meets the spec requirements before the extension tries to use it.
    - **Tasks:** Write and run integration tests for `POST /api/cards` covering success cases (with/without optional fields), error cases (missing required fields), correct data storage (Bucket 0), and response codes/formats.

**Phase 2: Browser Extension Development**

1.  **Step 2.1: Extension Manifest & Basic Content Script Setup**
    - **Goal:** Create the fundamental structure of the extension and verify the content script injects.
    - **Tasks:** Create `manifest.json` with basic info, permissions (`scripting`, `activeTab` initially), and content script declaration. Create a simple content script (`content.js`) that logs a message to the console on `mouseup`. Create a test page. Manually test selection triggers the log.
2.  **Step 2.2: Floating Button Appearance**
    - **Goal:** Display the "add new flashcard" button on text selection.
    - **Tasks:** Modify `content.js` to detect text selection, calculate position, create/inject the button element (HTML/CSS). Write tests (using a testing library like Jest with JSDOM or similar browser-env simulation) to assert the button appears in the mock DOM after a simulated selection event.
3.  **Step 2.3: Floating Button Disappearance**
    - **Goal:** Hide the button when selection is lost.
    - **Tasks:** Add logic to `content.js` (e.g., listening to `mousedown` or selection change) to remove the button. Update tests to assert the button is removed after simulated deselection.
4.  **Step 2.4: Modal HTML Structure & CSS**
    - **Goal:** Create the visual structure of the popup modal.
    - **Tasks:** Create `popup.html` (or define the structure within JS) containing the input fields (Front, Back, Hint, Tags), labels, required/optional indicators, Save/Cancel buttons, 'X' close button, and messaging area. Create basic `popup.css` for layout and styling. Test rendering visually or with DOM structure tests.
5.  **Step 2.5: Modal Display & Basic Interaction**
    - **Goal:** Show the modal when the floating button is clicked and handle basic closing.
    - **Tasks:** Modify `content.js` to inject/show the modal structure (from Step 2.4) when the floating button is clicked. Add event listeners to the Cancel button and 'X' button to hide/remove the modal. Test modal appearance on button click and disappearance on Cancel/'X' click. Pre-fill the 'Back' field with the selected text. Test 'Back' field pre-filling.
6.  **Step 2.6: Tag Processing Logic & Tests**
    - **Goal:** Implement and test the tag string processing logic in isolation.
    - **Tasks:** Create a utility function (e.g., `processTags(tagString)`) that takes the comma-separated string and returns `ReadonlyArray<string>` per the spec (trimming, filtering empty). Write unit tests for this function covering various inputs (whitespace, empty tags, no tags, etc.).
7.  **Step 2.7: Modal Save Logic & API Call (Mocked)**
    - **Goal:** Handle input gathering, tag processing, and trigger the save action.
    - **Tasks:** Add event listener to the Save button. Implement logic to: read values from Front, Hint, Tags fields; call the `processTags` function (from Step 2.6); construct the JSON payload. _Mock_ the `fetch` API call to `/api/cards`. Write tests to verify the Save button click triggers this logic and that the mocked `fetch` is called with the correct URL, method, headers, and correctly structured body (including omitted optional fields).
8.  **Step 2.8: API Integration & Feedback**
    - **Goal:** Connect the Save logic to the actual backend API and handle responses.
    - **Tasks:** Replace the mocked `fetch` with the real API call to `POST /api/cards`. Implement logic to handle successful responses (display success message, start 1s timer, close modal) and error responses (display specific error message from server, keep modal open). Write integration tests (mocking `fetch` again, but this time simulating different _responses_ - success, 400 error, 500 error) to verify the correct UI feedback and modal behavior for each case. Update `manifest.json` `host_permissions` if necessary (`http://localhost/*/`).

**Phase 3: Webcam Gesture Recognition Development**

1.  **Step 3.1: Basic Overlay UI & Styling**
    - **Goal:** Add the initial grey overlay element to the practice page.
    - **Tasks:** Modify the practice page's HTML to include a `div` for the overlay (bottom-right corner). Add CSS for positioning, rounded corners, grey background, and initial text ("Access Camera"). Test the overlay appears correctly on page load.
2.  **Step 3.2: Camera Access Logic & UI Update**
    - **Goal:** Implement the camera permission request flow.
    - **Tasks:** Add JavaScript to the practice page. Add a click listener to the "Access Camera" element. On click, call `navigator.mediaDevices.getUserMedia({video: true})`. Handle the promise: on success, add a class/style to the overlay to indicate success (e.g., prepare for video feed) and potentially hide the button text; on failure, update the overlay text to "Permission Denied" but keep the button clickable. Write tests (mocking `getUserMedia`) to verify the UI updates correctly for both grant and deny scenarios.
3.  **Step 3.3: Webcam Feed Display & TFJS/MediaPipe Loading**
    - **Goal:** Show the webcam feed and load necessary libraries only after permission is granted.
    - **Tasks:** Modify the success handler from Step 3.2: Create a `<video>` element inside the overlay; set its `srcObject` to the stream from `getUserMedia`. Implement dynamic loading for TensorFlow.js (`@tensorflow/tfjs`) and MediaPipe Hands (`@tensorflow-models/hand-pose-detection`). Trigger loading _only_ after permission is granted. Test that the video element is added and `srcObject` is set. Test (e.g., by checking script tags or mocking load functions) that TFJS/MediaPipe loading is initiated _only_ after simulated permission grant. Add TFJS/MediaPipe types (`@types/tensorflow__tfjs`, potentially others) if using TypeScript.
4.  **Step 3.4: Hand Detection Loop (Basic)**
    - **Goal:** Set up the core loop to detect hands using MediaPipe.
    - **Tasks:** Initialize the MediaPipe Hands detector (`createDetector`). Set up a loop (e.g., using `requestAnimationFrame`) to get predictions from the video feed (`detector.estimateHands`). For now, just log detected hand landmarks to the console. Write tests (mocking the detector and `estimateHands`) to ensure the detection loop runs and processes mock hand data.
5.  **Step 3.5: Gesture Classification Logic & Tests**
    - **Goal:** Implement functions to classify detected hand landmarks into specific gestures (Thumbs Up, Thumbs Down, Flat Hand, None/Other).
    - **Tasks:** Create pure functions (ideally) that take hand landmark data (from MediaPipe) as input. Implement the geometric logic to determine if the landmarks represent Thumbs Up, Thumbs Down, or Flat Hand. Return an identifier for the recognized gesture (e.g., 'easy', 'hard', 'wrong', 'none'). Write unit tests for these classifier functions, providing mock landmark data for each gesture case and verifying the correct identifier is returned. Consider edge cases and multi-hand scenarios based on the spec (allow one gesture type across hands).
6.  **Step 3.6: Gesture Hold Timer & Border Feedback**
    - **Goal:** Implement the 3-second hold requirement and visual feedback.
    - **Tasks:** In the detection loop, call the classifier function (from Step 3.5). Implement state management to track the currently detected gesture, the start time of the hold, and the timer status. If a valid gesture is consistently detected, update a timer. If the timer reaches 3 seconds, trigger a 'gesture recognized' event/state. Add logic to update the overlay border's style (e.g., using CSS variables or direct style manipulation) based on the currently held gesture and the timer progress (filling effect). Implement the immediate reset logic if the gesture changes or stops. Write tests (mocking timers and classifiers) to verify timer start/progress/reset logic and the associated border style updates.
7.  **Step 3.7: Action Triggering, Feedback & Cooldown**
    - **Goal:** Link successful gestures to flashcard actions and implement cooldown.
    - **Tasks:** When the 'gesture recognized' state is reached (after 3s hold):
      - Trigger the corresponding frontend action (e.g., call the existing JS function that handles 'Easy', 'Hard', or 'Wrong' button clicks).
      - Briefly apply the solid border feedback (0.5s).
      - Immediately start a 1-second cooldown timer, disabling gesture processing during this time.
      - Reset the hold timer/state.
      - After the cooldown, re-enable gesture processing.
    - Write tests (mocking action functions, timers) to verify the correct action function is called, the solid border feedback occurs, the cooldown period is enforced, and processing resumes afterward.

**Phase 4: Integration & Final Testing**

1.  **Step 4.1: Wiring & Integration Testing**
    - **Goal:** Ensure all parts work together seamlessly.
    - **Tasks:** Connect any mocked components (API calls, action triggers) to the real implementations. Perform end-to-end testing manually for both the extension (across different sites) and the gesture recognition (different lighting, hands). Supplement with automated integration tests if feasible (e.g., using Puppeteer or Cypress).

---

## LLM Prompts for Implementation

Here are the prompts derived from the blueprint, designed for a code-generation LLM. Each prompt builds upon the previous one.

---

**Prompt 1: Test Backend API (`POST /api/cards`)**

````text
Objective: Write integration tests for the existing backend API endpoint `POST /api/cards` to ensure it conforms to the specification.

Context: We have a Node.js/Express backend with state management in `state.ts` and the following API endpoint definition (from the spec):

```typescript
// POST /api/cards - Add a new card from the extension
app.post("/api/cards", (req: Request, res: Response) => {
  try {
    const { front, back, hint, tags } = req.body;

    // Validate required fields
    if (!front || !back) {
      res.status(400).json({ message: "Front and back are required" });
      return;
    }

    // Create new flashcard
    const newCard = new Flashcard(front, back, hint, tags || []); // Assuming Flashcard class exists

    // Get current buckets from state.ts (assuming state.getBuckets() exists)
    const currentBuckets = state.getBuckets();

    // Add to bucket 0 (new cards)
    if (!currentBuckets.has(0)) {
      currentBuckets.set(0, new Set());
    }
    const bucket0 = currentBuckets.get(0);
    if (bucket0) {
      bucket0.add(newCard);
    }

    // Update state (assuming state.setBuckets(currentBuckets) exists)
    state.setBuckets(currentBuckets);

    console.log(`Added new card: "${front}"`);
    res.status(201).json({
      message: "Card added successfully",
      card: { front, back, hint, tags: tags || [] }, // Return processed tags
    });
  } catch (error) {
    console.error("Error adding card:", error);
    res.status(500).json({ message: "Error adding card" });
  }
});
````

Requirements:

1.  Use a testing framework like Jest and Supertest.
2.  Assume `state.ts` provides `getBuckets()` and `setBuckets()` methods and handles persistence/resetting for tests (you might need mock implementations or a setup/teardown logic for `state`). Assume a `Flashcard` class exists.
3.  Write tests within a `describe("POST /api/cards", () => { ... })` block.
4.  Include the following test cases (`it(...)`):
    - "adds new card to state with correct fields (front, back, hint, tags)" (verify response body and potentially check state after call).
    - "adds new card to bucket 0" (verify by checking state after call).
    - "returns 400 if required field 'front' is missing".
    - "returns 400 if required field 'back' is missing".
    - "handles optional field 'hint' correctly when missing".
    - "handles optional field 'tags' correctly when missing".
    - "handles optional fields 'hint' and 'tags' correctly when both are present".
    - "returns 201 status and correct success response body on success".
    - Optional: Add a test for potential server errors (500) if possible to simulate.

Provide the complete test file content. Assume necessary setup (`app` instance, `state` mocking/resetting) is handled outside the prompt response or provide basic placeholders.

````

---

**Prompt 2: Extension Manifest & Basic Content Script Setup**

```text
Objective: Create the initial Browser Extension files (`manifest.json`, `content.js`) for Manifest V3.

Context: This is the first step for the browser extension. We need the basic structure and a content script that activates on any page.

Requirements:
1.  Create `manifest.json`:
    *   `manifest_version`: 3
    *   `name`: "Flashcard Quick Add"
    *   `version`: "1.0"
    *   `description`: "Quickly create flashcards from selected text."
    *   `permissions`: Start with `["scripting", "activeTab"]`. We'll add more later if needed.
    *   `content_scripts`: Define one content script:
        *   `matches`: `["<all_urls>"]`
        *   `js`: `["content.js"]`
    *   Include basic `icons` placeholders (e.g., `"icons": {"48": "icon48.png"}`). Assume `icon48.png` exists.
2.  Create `content.js`:
    *   Add an event listener for the `mouseup` event on the `document`.
    *   Inside the listener, check if any text is selected (`window.getSelection().toString().trim() !== ''`).
    *   If text is selected, log a message to the console (e.g., "Text selected!").

Provide the complete content for `manifest.json` and `content.js`.
````

---

**Prompt 3: Floating Button Appearance**

```text
Objective: Modify the content script to display a floating button near selected text.

Context: Building on Prompt 2 (`manifest.json`, `content.js`). The content script currently logs to the console on text selection. Now, it needs to create and show a button element.

Requirements:
1.  Modify `content.js`:
    *   Keep the `mouseup` listener and selection check.
    *   If text is selected:
        *   Get the selection range (`window.getSelection().getRangeAt(0)`).
        *   Get the bounding rectangle of the selection range (`range.getBoundingClientRect()`).
        *   Calculate the desired position for the button (e.g., `top: rect.bottom + window.scrollY + 5`, `left: rect.right + window.scrollX - buttonWidth / 2`).
        *   Create a new `div` or `button` element programmatically.
        *   Set its ID (e.g., `flashcard-quick-add-button`).
        *   Set its text content to "add new flashcard" (add an icon later if desired).
        *   Style it: `position: absolute;`, `z-index: 9999;`, background color, padding, border, cursor pointer, etc. Set the calculated `top` and `left`.
        *   **Important:** Before adding a new button, check if one already exists (using the ID) and remove the old one. This prevents multiple buttons.
        *   Append the new button element to the `document.body`.
2.  Create `content.test.js` (using Jest and JSDOM or similar):
    *   Set up a mock DOM environment.
    *   Simulate a text selection event (e.g., programmatically set `window.getSelection`).
    *   Dispatch a `mouseup` event on the mock `document`.
    *   Assert that the button element (with ID `flashcard-quick-add-button`) exists in the document body.
    *   Assert that its `position` style is `absolute`.
    *   (Optional but good) Assert its approximate `top` and `left` styles based on the simulated selection rect.

Provide the updated `content.js` and the new `content.test.js`.
```

---

**Prompt 4: Floating Button Disappearance**

```text
Objective: Make the floating button disappear when the user clicks elsewhere or the selection is cleared.

Context: Building on Prompt 3. The button appears on selection but doesn't disappear automatically.

Requirements:
1.  Modify `content.js`:
    *   Add a mechanism to remove the button. A simple way is to add a `mousedown` listener to the `document`.
    *   Inside the `mousedown` listener:
        *   Check if the click target is *not* the floating button itself (`event.target.id !== 'flashcard-quick-add-button'`).
        *   If the click is outside the button, find the button element (by ID) and remove it from the DOM if it exists.
    *   Also, modify the `mouseup` listener: if `window.getSelection().toString().trim() === ''` (i.e., selection is cleared), explicitly remove the button if it exists.
2.  Update `content.test.js`:
    *   Add a test case: Simulate selection and button appearance. Then, simulate a `mousedown` event on the `document.body` (not the button). Assert the button is removed from the DOM.
    *   Add a test case: Simulate selection and button appearance. Then, simulate clearing the selection (`window.getSelection().removeAllRanges()`) and dispatching `mouseup`. Assert the button is removed.

Provide the updated `content.js` and `content.test.js`.
```

---

**Prompt 5: Modal HTML Structure & CSS**

```text
Objective: Define the HTML structure and basic CSS for the card creation modal popup.

Context: Building on Prompt 4. We need the UI for the modal that will be triggered by the floating button.

Requirements:
1.  Create `popup.html`:
    *   A container `div` for the modal (e.g., ID `flashcard-modal-overlay`). Style this for overlay behavior (fixed position, full screen, background dimming).
    *   Inside the overlay, a `div` for the modal content box (e.g., ID `flashcard-modal-content`). Style this (background color, padding, border-radius, centered position, max-width).
    *   Inside the content box:
        *   An 'X' close button (`<button>` or `<span>`, ID `flashcard-modal-close`). Style it (top-right corner).
        *   A form element (`<form>`).
        *   Label and Input for "Front" (`<input type="text" id="flashcard-front" required>`). Add `*` indicator near label. Placeholder: "Enter the front of the card".
        *   Label and display area for "Back" (`<textarea id="flashcard-back" readonly disabled>`). Style appropriately.
        *   Label and Input for "Hint" (`<input type="text" id="flashcard-hint">`). Placeholder: "Enter an optional hint".
        *   Label and Input for "Tags" (`<input type="text" id="flashcard-tags">`). Placeholder: "Enter optional tags, comma-separated".
        *   A div for messages (ID `flashcard-modal-message`). Initially empty.
        *   Save button (`<button type="submit" id="flashcard-save">Save</button>`).
        *   Cancel button (`<button type="button" id="flashcard-cancel">Cancel</button>`). Position buttons appropriately.
2.  Create `popup.css`:
    *   Include styles for the overlay (`#flashcard-modal-overlay`), content box (`#flashcard-modal-content`), close button, form elements, labels, message area, and buttons. Make the overlay hidden by default (`display: none;`).

Provide the complete content for `popup.html` and `popup.css`. We will inject/control this structure using JavaScript in the next step.
```

---

**Prompt 6: Modal Display & Basic Interaction**

```text
Objective: Show the modal when the floating button is clicked, pre-fill the 'Back' field, and handle Cancel/'X' clicks.

Context: Building on Prompts 4 & 5. We have the floating button logic (`content.js`) and the modal structure (`popup.html`, `popup.css`). Now, wire them together.

Requirements:
1.  Modify `content.js`:
    *   When creating the floating button (`#flashcard-quick-add-button`), add an event listener to it (`click`).
    *   Inside the click listener:
        *   Store the currently selected text (`window.getSelection().toString()`) in a variable.
        *   Check if the modal structure already exists in the DOM (e.g., using `#flashcard-modal-overlay` ID). If not, fetch `popup.html` (using `fetch` and `chrome.runtime.getURL('popup.html')`) and insert its content into `document.body`. Fetching might require background script coordination or adjusting permissions. Alternatively, define the HTML structure as a string within `content.js` and inject it directly to avoid async issues/complexity if preferred. Let's proceed with injecting the HTML structure directly from a string template for simplicity here.
        *   Once the modal HTML is in the DOM (or if it existed already):
            *   Get the 'Back' textarea (`#flashcard-back`) and set its value to the stored selected text.
            *   Get the overlay element (`#flashcard-modal-overlay`) and set its `display` style to `block` (or `flex`, etc.) to show it.
            *   Add event listeners (if not already added persistently):
                *   To the Cancel button (`#flashcard-cancel`): Hide the overlay (`display: none;`).
                *   To the 'X' button (`#flashcard-modal-close`): Hide the overlay (`display: none;`).
                *   Ensure these listeners are added only once.
2.  Update `content.test.js`:
    *   Add tests: Simulate selection, then simulate a click on the floating button. Assert the modal overlay (`#flashcard-modal-overlay`) becomes visible (`display !== 'none'`). Assert the 'Back' textarea (`#flashcard-back`) value matches the simulated selected text.
    *   Add tests: Simulate the modal being visible. Simulate a click on the Cancel button. Assert the overlay is hidden. Simulate a click on the 'X' button. Assert the overlay is hidden.

Provide the updated `content.js` (including the modal HTML string template and injection logic) and `content.test.js`. You don't need to provide `popup.html` or `popup.css` again unless they changed. Assume `popup.css` needs to be declared in `manifest.json` under `content_scripts` -> `css`. Update `manifest.json` accordingly.
```

---

**Prompt 7: Tag Processing Logic & Tests**

```text
Objective: Implement and test the tag processing utility function.

Context: Building on Prompt 6. Before implementing the Save logic, create the isolated function for processing the comma-separated tag string according to the spec.

Requirements:
1.  Create a new file `utils.js`.
2.  Inside `utils.js`, define and export a function `processTags(tagString)`:
    *   Input: A single string (potentially null, undefined, or empty).
    *   Logic:
        *   Handle null/undefined/empty string input gracefully (return empty array).
        *   Split the string by commas.
        *   Trim whitespace from each resulting item.
        *   Filter out any empty strings after trimming.
    *   Output: A `ReadonlyArray<string>` (or just `Array<string>`).
3.  Create `utils.test.js`:
    *   Import the `processTags` function.
    *   Write unit tests covering:
        *   Null/undefined/empty input -> `[]`
        *   Single tag: `" tag1 "` -> `["tag1"]`
        *   Multiple tags: `" tag1 , tag2"` -> `["tag1", "tag2"]`
        *   Tags with extra commas: `"tag1,,tag2,"` -> `["tag1", "tag2"]`
        *   Tags with varying whitespace: `"  tag1,tag2  , tag3 "` -> `["tag1", "tag2", "tag3"]`
        *   Only commas/whitespace: `", , "` -> `[]`

Provide the complete content for `utils.js` and `utils.test.js`. Also, update `content.js` to import this function (e.g., `import { processTags } from './utils.js';`). We will use it in the next step. Update `manifest.json` if `utils.js` needs to be listed.
```

---

**Prompt 8: Modal Save Logic & API Call (Mocked)**

```text
Objective: Implement the Save button logic: gather data, process tags, construct payload, and mock the API call.

Context: Building on Prompts 6 & 7. The modal appears, 'Back' is filled, Cancel/'X' work, and `processTags` is ready. Now, handle the Save action.

Requirements:
1.  Modify `content.js`:
    *   Import `processTags` from `utils.js` if not already done.
    *   Find the `<form>` element within the modal. Add a `submit` event listener to the form.
    *   Inside the submit listener:
        *   Prevent the default form submission (`event.preventDefault();`).
        *   Get the values from the Front (`#flashcard-front`), Hint (`#flashcard-hint`), and Tags (`#flashcard-tags`) input fields.
        *   Perform basic validation: Check if the Front value is empty. If so, display an error message in `#flashcard-modal-message` (e.g., "Front field is required.") and return (do not proceed). Clear any previous error messages first.
        *   Call `processTags()` with the Tags input value.
        *   Construct the `cardData` JSON object:
            *   `front`: Value from Front input.
            *   `back`: Value from the Back textarea (ensure it's still correct).
            *   `hint`: Value from Hint input (OMIT the key if the value is empty/whitespace).
            *   `tags`: Result from `processTags()` (OMIT the key if the array is empty).
        *   **Mocking:** `console.log("Mock API Call: POST /api/cards with body:", JSON.stringify(cardData));` (We'll replace this with actual `fetch` later).
        *   Clear the form fields after mocking the call (optional, for immediate feedback).
2.  Modify `content.test.js`:
    *   Add tests for the form submission:
        *   Simulate modal open, fill fields (including variations of hint/tags).
        *   Simulate form `submit` event.
        *   Assert that `event.preventDefault` was called.
        *   Assert (using `console.log` spying or similar) that the mock API log message appears and contains the correctly structured JSON payload (check for omitted optional fields).
        *   Add a test case where 'Front' is empty, submit the form, and assert that the error message appears in `#flashcard-modal-message` and the mock API log was *not* called.

Provide the updated `content.js` and `content.test.js`. Update `manifest.json`'s `content_scripts` -> `js` array if `utils.js` wasn't added previously.
```

---

**Prompt 9: API Integration & Feedback**

````text
Objective: Replace the mocked API call with a real `fetch` call to the backend and handle success/error feedback in the UI.

Context: Building on Prompt 8. The Save logic constructs the payload. Now, send it to the actual backend (`http://localhost:PORT/api/cards`) and update the modal based on the response.

Requirements:
1.  Modify `manifest.json`:
    *   Add `host_permissions`: Ensure `["http://localhost/*/"]` is present (replace `PORT` with `*`). You might also need `<all_urls>` depending on other extension needs, but specifically add localhost access for the API call. Permissions might now be `["scripting", "storage"]` and `host_permissions`: `["<all_urls>", "http://localhost/*/"]`.
    *   Consider adding a background service worker (`"background": {"service_worker": "background.js"}`) if direct `fetch` from the content script causes issues (CORS, etc.), though direct fetch might work for localhost. Let's *try* direct fetch from `content.js` first.
2.  Modify `content.js`:
    *   Inside the form `submit` listener, replace the `console.log("Mock API Call...")` line with an actual `fetch` call:
        ```javascript
        const apiUrl = 'http://localhost:3000/api/cards'; // Replace 3000 with your actual backend port
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cardData),
            });

            const messageElement = document.getElementById('flashcard-modal-message');
            messageElement.textContent = ''; // Clear previous messages

            if (response.ok) { // Check for 2xx status codes
                // Success
                messageElement.textContent = 'Card saved successfully';
                messageElement.style.color = 'green';

                // Optional: Clear form fields
                // document.getElementById('flashcard-front').value = '';
                // document.getElementById('flashcard-hint').value = '';
                // document.getElementById('flashcard-tags').value = '';

                // Close modal after 1 second
                setTimeout(() => {
                    const overlay = document.getElementById('flashcard-modal-overlay');
                    if (overlay) overlay.style.display = 'none';
                    messageElement.textContent = ''; // Clear message on close
                }, 1000);

            } else {
                // Error
                const errorData = await response.json();
                messageElement.textContent = errorData.message || 'Error saving card.';
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error('Network error:', error);
            const messageElement = document.getElementById('flashcard-modal-message');
            messageElement.textContent = 'Network error. Unable to reach server.';
            messageElement.style.color = 'red';
        }
        ```
    *   Make the submit handler `async`. Ensure error handling (`try...catch`) is robust.
3.  Modify `content.test.js`:
    *   Update the tests for form submission. Instead of checking `console.log`, mock the global `fetch` function (using `jest.fn()` or `jest.spyOn(window, 'fetch')`).
    *   Test Case 1 (Success): Simulate `fetch` resolving with `{ ok: true }`. Assert success message appears, `setTimeout` is called (mock timers if needed), and modal eventually hides.
    *   Test Case 2 (Client Error): Simulate `fetch` resolving with `{ ok: false, status: 400, json: async () => ({ message: 'Front and back are required' }) }`. Assert the specific error message appears, color is red, and modal remains open.
    *   Test Case 3 (Server/Network Error): Simulate `fetch` rejecting. Assert a network error message appears, color is red, and modal remains open.

Provide the updated `manifest.json`, `content.js`, and `content.test.js`.
````

---

**(Continue with prompts for Gesture Recognition following the blueprint steps 3.1 - 3.7, similarly breaking down each step with context, requirements, testing, and requesting specific file outputs. THIS IS BELOW )**

---

_Self-Correction during prompt generation:_ Initially, I might have put the API call directly in the content script. While possible, especially for localhost, complex extensions often benefit from moving API calls to a background service worker to handle potential lifecycle issues or CORS complexities with external APIs. I've added a note about this but kept the direct fetch approach for simplicity first, as specified. Also ensured tests cover the different response paths (success, client error, network error) clearly. Added async/await and try/catch for the fetch logic. Emphasized clearing previous messages. Added manifest permission updates.

Okay, let's continue with the prompts for the Webcam Gesture Recognition feature, following the blueprint.

---

**Prompt 10: Basic Overlay UI & Styling (Gesture Recognition)**

```text
Objective: Add the initial, static UI element for the webcam overlay to the flashcard practice page.

Context: This is the first step for the gesture recognition feature. We need to add a non-functional placeholder element to the practice page. Assume you have an existing `practice.html` file and a corresponding `practice.css` file for the flashcard practice view.

Requirements:
1.  Modify `practice.html`:
    *   Add a new `div` element inside the `<body>` (or appropriate container).
    *   Give it an ID (e.g., `gesture-overlay`).
    *   Inside this div, add another element (e.g., a `span` or `button` with ID `gesture-access-button`) containing the initial text "Access Camera".
2.  Modify `practice.css`:
    *   Style the `#gesture-overlay` div:
        *   `position: fixed;`
        *   `bottom: 20px;`
        *   `right: 20px;`
        *   `width: 150px;` (adjust as needed)
        *   `height: 112px;` (adjust for 4:3 aspect ratio, or as needed)
        *   `background-color: #cccccc;` (grey)
        *   `border-radius: 10px;`
        *   `display: flex;`
        *   `justify-content: center;`
        *   `align-items: center;`
        *   `z-index: 1000;`
        *   `overflow: hidden;` /* Important for later border/video */
        *   `border: 3px solid transparent;` /* For later color feedback */
    *   Style the `#gesture-access-button` element:
        *   Make it look clickable (e.g., `cursor: pointer;`, padding, maybe subtle background/border).
        *   Style the text (color, font size).

Provide the updated HTML snippet for `practice.html` showing the added div, and the new CSS rules for `practice.css`.
```

---

**Prompt 11: Camera Access Logic & UI Update**

```text
Objective: Implement the logic to request camera access when the overlay button is clicked and update the UI based on permission status.

Context: Building on Prompt 10. The static overlay exists. Now, make the "Access Camera" button functional. Assume you have a `practice.js` file linked to `practice.html`.

Requirements:
1.  Modify `practice.js`:
    *   Get references to the `#gesture-overlay` and `#gesture-access-button` elements.
    *   Add a 'click' event listener to `#gesture-access-button`.
    *   Inside the listener:
        *   Call `navigator.mediaDevices.getUserMedia({ video: true })`.
        *   Use `.then()` for the success case:
            *   Log success: `console.log("Camera access granted")`.
            *   Get the overlay element (`#gesture-overlay`).
            *   Maybe hide the access button (`#gesture-access-button.style.display = 'none';`) or change its text.
            *   (Prepare for video feed - we'll add the video element in the next step).
        *   Use `.catch()` for the error/denial case:
            *   Log the error: `console.error("Camera access denied:", error)`.
            *   Get the access button element (`#gesture-access-button`).
            *   Update its text content to "Permission Denied".
            *   Ensure the button remains clickable to allow retrying.
2.  Create `practice.test.js` (or add to it):
    *   Mock `navigator.mediaDevices.getUserMedia`.
    *   Test Case 1 (Grant): Simulate `getUserMedia` resolving successfully. Trigger a click on the mock access button. Assert that the success path logic runs (e.g., check console log mock, check button text/style change).
    *   Test Case 2 (Deny): Simulate `getUserMedia` rejecting. Trigger a click on the mock access button. Assert that the error path logic runs (e.g., check console error mock, check button text changes to "Permission Denied").

Provide the updated `practice.js` and the new/updated test file `practice.test.js`.
```

---

**Prompt 12: Webcam Feed Display & TFJS/MediaPipe Loading**

````text
Objective: Display the live webcam feed in the overlay upon permission grant and dynamically load TensorFlow.js and MediaPipe libraries.

Context: Building on Prompt 11. Camera access is requested. On success, we need to show the video and load the ML models.

Requirements:
1.  Modify `practice.js`:
    *   In the `getUserMedia` success (`.then()`) handler:
        *   Accept the `stream` argument.
        *   Create a `<video>` element programmatically (e.g., `const videoElement = document.createElement('video');`).
        *   Set necessary attributes: `videoElement.setAttribute('playsinline', '');`, `videoElement.setAttribute('autoplay', '');`, `videoElement.muted = true;` (important).
        *   Style the video element: `width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);` (flip horizontally for intuitive mirroring).
        *   Set the video source: `videoElement.srcObject = stream;`.
        *   Get the overlay element (`#gesture-overlay`) and append the `videoElement` to it. Make sure the "Access Camera" button is hidden or removed.
        *   **Dynamic Loading:** Implement functions to dynamically load scripts. Example:
            ```javascript
            function loadScript(url) {
              return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
              });
            }

            async function loadMLDependencies() {
              console.log('Loading TFJS and MediaPipe...');
              // Replace with actual CDN or local paths
              await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core');
              await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl'); // Or other backend
              await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection');
              console.log('ML Dependencies loaded.');
              // TODO: Initialize detector (next step)
            }
            ```
        *   Call `loadMLDependencies()` *after* successfully setting up the video stream.
2.  Update `practice.test.js`:
    *   Refine the 'Grant' test case:
        *   Mock the `stream` object.
        *   Assert that a `<video>` element is created and appended to the mock overlay.
        *   Assert that `videoElement.srcObject` is set to the mock stream.
        *   Mock the `loadScript` function (or the dynamic import mechanism used). Assert that the loading functions for TFJS Core, Backend, and Hand Pose Detection are called *only* in the success path of `getUserMedia`.

Provide the updated `practice.js` and `practice.test.js`. Include the helper `loadScript` function or alternative dynamic loading approach.
````

---

**Prompt 13: Hand Detection Loop (Basic)**

````text
Objective: Initialize the MediaPipe Hand Pose Detector and set up a loop to continuously detect hands from the video feed.

Context: Building on Prompt 12. The video feed is active, and TFJS/MediaPipe libraries are loaded on demand. Now, use them to start detecting hands.

Requirements:
1.  Modify `practice.js`:
    *   Add variables to hold the detector instance and the video element reference (set these when available).
    *   In the `loadMLDependencies` function (or after it resolves), initialize the Hand Pose Detector:
        ```javascript
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig = {
          runtime: 'tfjs', // or 'mediapipe'
          modelType: 'lite', // or 'full'
          maxHands: 2 // Or as needed
        };
        let detector = null; // Make detector accessible in broader scope

        async function initializeDetector() {
            try {
                await tf.setBackend('webgl'); // Or other backend
                await tf.ready();
                detector = await handPoseDetection.createDetector(model, detectorConfig);
                console.log('Hand detector initialized.');
                // Start the detection loop
                requestAnimationFrame(detectHandsLoop);
            } catch (error) {
                console.error("Error initializing detector:", error);
                // Update UI to show error
            }
        }

        // Call initializeDetector() after ML dependencies are loaded in loadMLDependencies
        ```
    *   Create the detection loop function `detectHandsLoop`:
        ```javascript
        async function detectHandsLoop() {
          if (detector && videoElement && videoElement.readyState >= 2) { // Check video readyState
            try {
              const hands = await detector.estimateHands(videoElement, {
                flipHorizontal: false // Already flipped video CSS
              });

              if (hands.length > 0) {
                // TODO: Classify gestures (next step)
                console.log('Detected hands:', hands);
              } else {
                // Handle no hands detected state if needed
              }

            } catch (error) {
              console.error("Error detecting hands:", error);
              detector.dispose(); // Dispose on error? Or try again?
              detector = null;
              // Maybe show error in UI and stop loop
            }
          }
          // Keep looping
          requestAnimationFrame(detectHandsLoop);
        }
        ```
    *   Ensure `initializeDetector` is called at the appropriate time (after libraries load). Ensure `videoElement` is accessible to the loop function.
2.  Update `practice.test.js`:
    *   Mock `@tensorflow/tfjs`, `@tensorflow-models/hand-pose-detection`, `createDetector`, and `estimateHands`.
    *   Test Case: After simulating library load and detector initialization, mock `requestAnimationFrame`. Assert that `detector.estimateHands` is called within the mocked animation frame callback. Provide mock hand data as the return value for `estimateHands` and assert that the `console.log('Detected hands:')` part is reached.

Provide the updated `practice.js` and `practice.test.js`.
````

---

**Prompt 14: Gesture Classification Logic & Tests**

````text
Objective: Implement and test functions to classify detected hand landmarks into "Easy" (Thumbs Up), "Hard" (Flat Hand), or "Wrong" (Thumbs Down).

Context: Building on Prompt 13. The detection loop provides hand landmark data. Now, interpret these landmarks. This logic should be isolated for testability.

Requirements:
1.  Create `gestureUtils.js` (or add to an existing utils file):
    *   Define and export classifier functions. Example structure:
        ```javascript
        // Simplified landmark indices (adjust based on MediaPipeHands model output)
        const Landmark = { THUMB_TIP: 4, INDEX_TIP: 8, MIDDLE_TIP: 12, RING_TIP: 16, PINKY_TIP: 20, WRIST: 0, THUMB_IP: 3, THUMB_MCP: 2, INDEX_MCP: 5, PINKY_MCP: 17 };

        function isThumbsUp(hand) {
            const landmarks = hand.keypoints;
            if (!landmarks) return false;
            const thumbTip = landmarks[Landmark.THUMB_TIP];
            const indexMCP = landmarks[Landmark.INDEX_MCP];
            const pinkyMCP = landmarks[Landmark.PINKY_MCP];
            // Basic check: Thumb tip is above the knuckles of other fingers
            return thumbTip.y < indexMCP.y && thumbTip.y < pinkyMCP.y; // Lower Y is higher on screen
            // Add checks for finger curled state if needed
        }

        function isThumbsDown(hand) {
            const landmarks = hand.keypoints;
            if (!landmarks) return false;
            // Basic check: Thumb tip is below the wrist (needs refinement)
            // ... more robust checks needed ...
            return false; // Placeholder - needs actual logic
        }

        function isFlatHand(hand) {
            const landmarks = hand.keypoints;
            if (!landmarks) return false;
            // Basic check: All fingertips are roughly aligned and extended
            // Check distances between fingertips and knuckles, angles etc.
            // ... more robust checks needed ...
            return false; // Placeholder - needs actual logic
        }

        export function classifyGesture(hands) {
            let detectedGesture = 'none';
            let gestureCount = 0;
            for (const hand of hands) {
                if (isThumbsUp(hand)) {
                    if (detectedGesture === 'none') detectedGesture = 'easy';
                    else if (detectedGesture !== 'easy') return 'ambiguous'; // Conflicting gestures
                    gestureCount++;
                } else if (isFlatHand(hand)) { // Placeholder
                    if (detectedGesture === 'none') detectedGesture = 'hard';
                    else if (detectedGesture !== 'hard') return 'ambiguous';
                    gestureCount++;
                } else if (isThumbsDown(hand)) { // Placeholder
                     if (detectedGesture === 'none') detectedGesture = 'wrong';
                    else if (detectedGesture !== 'wrong') return 'ambiguous';
                    gestureCount++;
                }
                // Add checks for multiple hands showing the SAME gesture vs. different gestures
            }
             if (gestureCount === 0) return 'none';
             // If only one type of gesture was detected across potentially multiple hands:
             if (detectedGesture !== 'none' && detectedGesture !== 'ambiguous') return detectedGesture;
             // Handle case where multiple hands show *different* recognized gestures -> ambiguous
             if (detectedGesture === 'ambiguous' || gestureCount > 1 && detectedGesture === 'none') return 'ambiguous'; // If multiple hands show different things, or non-recognized things

             return 'none'; // Default fallback
        }
        ```
    *   **Crucially:** Refine the placeholder logic for `isThumbsDown` and `isFlatHand` based on landmark geometry (e.g., finger extension angles, relative positions of thumb/fingertips/wrist).
    *   The main `classifyGesture` function should handle the multi-hand logic from the spec (allow one type of gesture, return 'ambiguous' for conflicting types).
2.  Create `gestureUtils.test.js`:
    *   Import the classifier functions.
    *   Create mock hand landmark data structures (`hands` array with `keypoints`) representing:
        *   Clear Thumbs Up (one hand)
        *   Clear Flat Hand (one hand) - *pending implementation*
        *   Clear Thumbs Down (one hand) - *pending implementation*
        *   No hands / neutral hand poses
        *   Two hands showing Thumbs Up
        *   One hand Thumbs Up, one hand neutral
        *   One hand Thumbs Up, one hand Flat Hand (ambiguous)
    *   Write unit tests calling `classifyGesture` with each mock data set and assert the returned string ('easy', 'hard', 'wrong', 'none', 'ambiguous').

Provide the complete `gestureUtils.js` (with placeholders refined as much as possible or clearly marked) and `gestureUtils.test.js`.
````

---

**Prompt 15: Gesture Hold Timer & Border Feedback**

````text
Objective: Implement the 3-second gesture hold requirement with visual feedback via the overlay border color filling up.

Context: Building on Prompts 13 & 14. The detection loop gets landmarks, and `classifyGesture` identifies the gesture type. Now, add the timing logic.

Requirements:
1.  Modify `practice.js`:
    *   Import `classifyGesture` from `gestureUtils.js`.
    *   Add state variables outside the loop:
        ```javascript
        let currentGesture = 'none';
        let gestureStartTime = null;
        const GESTURE_HOLD_DURATION = 3000; // 3 seconds in ms
        const gestureColors = { easy: 'green', hard: 'orange', wrong: 'red' };
        ```
    *   Modify the `detectHandsLoop` function:
        *   After getting `hands` from `detector.estimateHands`, call `const recognizedGesture = classifyGesture(hands);`.
        *   Implement the state logic:
            ```javascript
            const now = Date.now();
            const overlayElement = document.getElementById('gesture-overlay');

            if (recognizedGesture !== 'none' && recognizedGesture !== 'ambiguous') {
                if (recognizedGesture === currentGesture) {
                    // Continue holding the same gesture
                    const holdTime = now - gestureStartTime;
                    if (holdTime >= GESTURE_HOLD_DURATION) {
                        // Gesture held long enough! Trigger action (next step)
                        console.log(`Gesture ${currentGesture} recognized!`);
                        // Reset state for next gesture AFTER action/cooldown (next step)
                        currentGesture = 'none';
                        gestureStartTime = null;
                        overlayElement.style.borderColor = 'transparent'; // Reset border immediately? Or after cooldown? Let's reset after cooldown.
                        // *** TODO: Trigger Action & Cooldown ***
                    } else {
                        // Update border fill based on progress
                        const progress = holdTime / GESTURE_HOLD_DURATION;
                        const color = gestureColors[currentGesture];
                        // Simple border color change - Needs refinement for "filling" effect
                        overlayElement.style.borderColor = color;
                        // TODO: Implement actual filling animation (e.g., using background gradient, pseudo-elements)
                        console.log(`Holding ${currentGesture}: ${Math.round(progress * 100)}%`);
                    }
                } else {
                    // Switched to a new valid gesture
                    console.log(`Started gesture: ${recognizedGesture}`);
                    currentGesture = recognizedGesture;
                    gestureStartTime = now;
                    // Reset border visually to start filling for new gesture
                     overlayElement.style.borderColor = gestureColors[currentGesture]; // Show color immediately
                    // TODO: Reset fill animation to 0%
                }
            } else {
                // No gesture or ambiguous gesture detected
                if (currentGesture !== 'none') {
                    console.log('Gesture stopped/ambiguous.');
                }
                currentGesture = 'none';
                gestureStartTime = null;
                // Reset border
                overlayElement.style.borderColor = 'transparent';
                 // TODO: Reset fill animation to 0%
            }
            ```
    *   **Border Fill Animation:** The `overlayElement.style.borderColor = color;` is a placeholder. Implement a visual "filling" effect. This could use:
        *   CSS conic-gradient background on the overlay itself (complex?).
        *   Animating the `border-image` property.
        *   Using pseudo-elements (`::before` or `::after`) with `clip-path` or animated `width/height` on top of the border. Choose a method and implement it.
2.  Update `practice.test.js`:
    *   Mock `classifyGesture`, `Date.now()`, and `requestAnimationFrame`.
    *   Test Case 1 (Hold Start): Simulate `classifyGesture` returning 'easy'. Assert `currentGesture` becomes 'easy', `gestureStartTime` is set. Assert border style changes to indicate start (e.g., green border visible).
    *   Test Case 2 (Hold Continue): Simulate time passing (< 3s). Assert border style updates reflect progress (mock the animation update).
    *   Test Case 3 (Hold Complete): Simulate time passing (>= 3s). Assert the "Gesture recognized!" log occurs and state resets (or prepares for action trigger).
    *   Test Case 4 (Hold Interrupt): Simulate 'easy' -> 'none'. Assert state resets, border becomes transparent.
    *   Test Case 5 (Hold Switch): Simulate 'easy' -> 'hard'. Assert `currentGesture` changes, `gestureStartTime` resets, border reflects 'hard'.

Provide the updated `practice.js` (including the chosen border fill implementation) and `practice.test.js`.
````

---

**Prompt 16: Action Triggering, Feedback & Cooldown**

````text
Objective: Trigger the appropriate flashcard action upon successful gesture hold, provide brief solid border feedback, and implement the 1-second cooldown period.

Context: Building on Prompt 15. The 3-second hold is detected. Now, link this to the actual flashcard logic ("Easy", "Hard", "Wrong") and add final feedback/cooldown. Assume there are existing JavaScript functions `handleEasy()`, `handleHard()`, `handleWrong()` that update the flashcard state and UI.

Requirements:
1.  Modify `practice.js`:
    *   Introduce a state variable for cooldown: `let isCooldownActive = false;`.
    *   In `detectHandsLoop`, modify the section where `holdTime >= GESTURE_HOLD_DURATION`:
        ```javascript
        if (holdTime >= GESTURE_HOLD_DURATION && !isCooldownActive) {
            const recognizedAction = currentGesture; // 'easy', 'hard', or 'wrong'
            console.log(`Gesture ${recognizedAction} recognized! Triggering action.`);

            // --- Action Trigger ---
            try {
                if (recognizedAction === 'easy' && typeof handleEasy === 'function') {
                    handleEasy();
                } else if (recognizedAction === 'hard' && typeof handleHard === 'function') {
                    handleHard();
                } else if (recognizedAction === 'wrong' && typeof handleWrong === 'function') {
                    handleWrong();
                }
            } catch (e) { console.error("Error triggering action:", e); }

            // --- Visual Feedback ---
            const color = gestureColors[recognizedAction];
            overlayElement.style.borderColor = color; // Solid border
            // TODO: Ensure any "fill" animation is removed/overridden for solid color
            setTimeout(() => {
                // Reset border after 0.5s, only if not overridden by new gesture detection
                 if (!gestureStartTime) overlayElement.style.borderColor = 'transparent';
            }, 500); // 0.5 second feedback

            // --- Cooldown ---
            isCooldownActive = true;
            console.log('Cooldown started.');
            setTimeout(() => {
                console.log('Cooldown ended.');
                isCooldownActive = false;
            }, 1000); // 1 second cooldown

            // --- Reset State ---
            currentGesture = 'none';
            gestureStartTime = null;
            // Reset fill animation state here
        }
        ```
    *   Modify the gesture detection logic slightly: Add `if (isCooldownActive) return;` at the beginning of the main logic block inside `detectHandsLoop` (after getting `recognizedGesture`) to pause processing during cooldown.
2.  Update `practice.test.js`:
    *   Mock the action functions `handleEasy`, `handleHard`, `handleWrong`.
    *   Mock `setTimeout` and `clearTimeout`.
    *   Refine Test Case 3 (Hold Complete):
        *   Assert the correct action function (`handleEasy`, etc.) is called.
        *   Assert the overlay border becomes solid with the correct color.
        *   Assert `isCooldownActive` becomes true.
        *   Use timer mocks (`jest.advanceTimersByTime`) to simulate 0.5s passing. Assert the border reset timeout logic runs (border becomes transparent).
        *   Use timer mocks to simulate 1s passing. Assert `isCooldownActive` becomes false.
    *   Add a test case during cooldown: Simulate gestures being detected. Assert that no new `gestureStartTime` is set and no actions are triggered while `isCooldownActive` is true.

Provide the updated `practice.js` and `practice.test.js`. Assume `handleEasy`, `handleHard`, `handleWrong` exist globally or are properly imported/available in the scope.
````

---

These prompts cover the implementation steps for the gesture recognition feature based on the blueprint. The final step (4.1 in the blueprint) would involve manual end-to-end testing and potentially writing automated integration tests using tools like Cypress or Puppeteer, which are generally outside the scope of direct code generation prompts but are crucial for validation.
