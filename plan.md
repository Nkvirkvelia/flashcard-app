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

## Revised Development Blueprint & Iterative Plan (Phase 3 - React/TS)

**Strategy:** Test-Driven Development (TDD) using React Testing Library. Build incrementally within the React component structure.

**Target Files:** Primarily `frontend/src/components/PracticeView.tsx` (or a new child component like `GestureOverlay.tsx`), `frontend/src/index.css` (or other relevant CSS files), `frontend/src/utils/gestureUtils.ts`, and associated test files.

**Phase 3: Webcam Gesture Recognition Development (React/TS)**

1.  **Step 3.1: Basic Overlay UI Component & Styling**
    - **Goal:** Add the initial static UI element for the webcam overlay using JSX within the appropriate React component.
    - **Tasks:** Modify `PracticeView.tsx` (or create `GestureOverlay.tsx` and use it in `PracticeView.tsx`) to conditionally render a `div` (`#gesture-overlay`) containing the "Access Camera" button (`#gesture-access-button`). Add necessary CSS rules to `index.css` or component-specific styles. Manual Test: Overlay appears on page load with ‘Access Camera’ button.
2.  **Step 3.2: Camera Access Logic & State**
    - **Goal:** Implement the camera permission request flow using React state and event handlers.
    - **Tasks:** Add state (`useState`) to track permission status (`'idle'`, `'pending'`, `'granted'`, `'denied'`). Add an `onClick` handler to the "Access Camera" button. This handler sets state to `'pending'` and calls `navigator.mediaDevices.getUserMedia`. Update state in `.then()`/`.catch()` callbacks. Use `useEffect` to react to permission state changes (e.g., logging). Write RTL tests mocking `getUserMedia`, simulating clicks, and asserting state changes and UI updates (button text).
3.  **Step 3.3: Webcam Feed Display & TFJS/MediaPipe Loading Hook**
    - **Goal:** Show the webcam feed in a `<video>` element and load ML libraries dynamically _after_ permission grant, managed by component logic/hooks.
    - **Tasks:** Use `useRef` for the `<video>` element. Conditionally render the `<video>` element in JSX when permission is `'granted'`. Use `useEffect` (dependent on permission state and the stream object) to set the `video.srcObject`. Implement dynamic script loading (e.g., in a utility or hook). Trigger loading via `useEffect` when permission is granted. Manage ML loading state (`useState`).
4.  **Step 3.4: Hand Detection Hook & Loop Setup**
    - **Goal:** Encapsulate MediaPipe setup and the detection loop, possibly within a custom hook (`useHandDetection`).
    - **Tasks:** Create a custom hook or manage within `PracticeView.tsx`'s `useEffect`. Use `useRef` for the detector instance. Use `useEffect` (dependent on ML libs loaded state) to initialize the detector (`createDetector`). Use another `useEffect` (dependent on detector & video element) to start the `requestAnimationFrame` loop, storing the frame ID in `useRef` for cleanup. The loop function (called by `rAF`) calls `detector.estimateHands`. Use `useEffect` cleanup to cancel `rAF` and dispose the detector. Write RTL tests mocking detector methods and `rAF`, ensuring the loop starts and `estimateHands` is called.
5.  **Step 3.5: Gesture Classification Logic & Tests**
    - **Goal:** Implement the pure gesture classification logic.
    - **Tasks:** Create `frontend/src/utils/gestureUtils.ts`. Implement/export `isThumbsUp`, `isFlatHand`, `isThumbsDown`, and `classifyGesture`. Write unit tests using Jest in `gestureUtils.test.ts`.
6.  **Step 3.6: Gesture State Management & Border Feedback Hook**
    - **Goal:** Manage gesture hold state and visual feedback using React state and effects.
    - **Tasks:** Use `useState` for `currentGesture`, `gestureStartTime`. Integrate `classifyGesture` into the detection loop callback. Update state based on classification results. Use state to derive border style/class names applied to the overlay `div` in JSX (for filling animation). Write RTL tests mocking classifiers/timers, asserting state transitions and className/style changes on the overlay element.
7.  **Step 3.7: Action Triggering, Props & Cooldown Hook**
    - **Goal:** Trigger actions via props and implement cooldown state.
    - **Tasks:** Define props for the gesture component/hook (e.g., `onGestureRecognized: (action: 'easy' | 'hard' | 'wrong') => void`). Call this prop function when a gesture hold completes. Use `useState` for `isCooldownActive`. Implement `setTimeout` logic for feedback (solid border style/class) and cooldown period within `useEffect` or triggered logic, ensuring cleanup. Pause gesture processing during cooldown. Write RTL tests mocking prop functions and timers, asserting props are called correctly, cooldown state works, and feedback styles are applied/removed.

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

## Revised LLM Prompts (Phase 3 - React/TS)

**Prompt 10 (React): Basic Overlay UI Component & Styling**

````text
Objective: Add the initial static UI element for the webcam overlay using React JSX and manage its basic visibility.

Context: We are working within a React/TypeScript frontend (`frontend/src`). The main practice UI is likely rendered by `components/PracticeView.tsx`. We need to add the gesture overlay UI.

Requirements:
1.  Modify `components/PracticeView.tsx`:
    *   Introduce a state variable to control the overall visibility of the gesture feature, e.g., `const [showGestureUI, setShowGestureUI] = useState(true);` (or false, depending on default).
    *   In the JSX return statement, conditionally render the overlay based on `showGestureUI`:
        ```jsx
        {showGestureUI && (
          <div id="gesture-overlay" className="gesture-overlay-base"> {/* Use className for styling */}
            <button id="gesture-access-button" className="gesture-button-base">
              Access Camera
            </button>
          </div>
        )}
        ```
2.  Modify `index.css` (or relevant CSS file, e.g., `PracticeView.module.css`):
    *   Define base styles for `.gesture-overlay-base` (fixed position bottom-right, dimensions, initial grey background, border-radius, flex centering, initial transparent border).
    *   Define base styles for `.gesture-button-base` (cursor, text style).
3.  Create/Update test file for `PracticeView.tsx`:
    *   Use React Testing Library (`render`, `screen`).
    *   Test Case 1: When state shows UI, assert that the element with `id="gesture-overlay"` and the button with text "Access Camera" are present in the rendered output (`screen.getByRole`, `screen.getByText`).
    *   Test Case 2: (Optional) When state hides UI, assert the overlay is not present (`screen.queryBy...`).

Provide the updated JSX snippet for `PracticeView.tsx` and the new CSS rules. Also, provide the basic RTL test setup and cases.
````

---

**Prompt 11 (React): Camera Access Logic & State**

```text
Objective: Implement the camera permission request flow using React state (`useState`) and event handlers within the `PracticeView` component.

Context: Building on Prompt 10 (React). The static overlay exists in `PracticeView.tsx`. Now, make the "Access Camera" button functional using React state.

Requirements:
1.  Modify `components/PracticeView.tsx`:
    *   Add state for permission status: `const [permissionStatus, setPermissionStatus] = useState<'idle' | 'pending' | 'granted' | 'denied'>('idle');`
    *   Add state for the button text: `const [buttonText, setButtonText] = useState('Access Camera');`
    *   Create the `handleAccessCameraClick` async function:
        *   Set `setPermissionStatus('pending')`.
        *   Call `navigator.mediaDevices.getUserMedia({ video: true })`.
        *   In `.then(stream => { ... })`: Set `setPermissionStatus('granted')`; handle the stream (next step); maybe update button text or hide button.
        *   In `.catch(error => { ... })`: Set `setPermissionStatus('denied')`; `setButtonText('Permission Denied')`; log error.
    *   Attach this handler to the "Access Camera" button's `onClick` prop in the JSX.
    *   Conditionally render the button text using the `buttonText` state. Disable the button while `permissionStatus === 'pending'`.
2.  Update test file for `PracticeView.tsx`:
    *   Mock `navigator.mediaDevices.getUserMedia`.
    *   Test Case (Grant): `render(<PracticeView />);` Simulate `fireEvent.click` on the "Access Camera" button. Make `getUserMedia` mock resolve. Assert `screen.getBy...` reflects state changes (e.g., button text changes or disappears) and internal state (if exposed via test hook/prop) is `'granted'`.
    *   Test Case (Deny): Simulate click. Make `getUserMedia` mock reject. Assert button text changes to "Permission Denied" (`screen.getByText`). Assert internal state is `'denied'`.

Provide the updated state variables, the `handleAccessCameraClick` function, the updated JSX for the overlay, and the updated RTL test cases.
```

---

**Prompt 12 (React): Webcam Feed Display & TFJS/MediaPipe Loading Hook**

````text
Objective: Display the live webcam feed in a `<video>` element upon permission grant and dynamically load ML libraries, managed within the React component lifecycle.

Context: Building on Prompt 11 (React). Camera access state is managed. On success (`'granted'`), show video and load libs.

Requirements:
1.  Modify `components/PracticeView.tsx`:
    *   Add state for the media stream: `const [stream, setStream] = useState<MediaStream | null>(null);`
    *   Add state for ML loading: `const [mlStatus, setMlStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');`
    *   Use `useRef` for the video element: `const videoRef = useRef<HTMLVideoElement>(null);`
    *   In the `handleAccessCameraClick` success (`.then(stream => ...)`): Call `setStream(stream)`. Trigger ML loading (call a function defined below).
    *   Add a `useEffect` hook that depends on `stream`:
        ```typescript
        useEffect(() => {
          if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // Cleanup function to stop the stream tracks when component unmounts or stream changes
          return () => {
            stream?.getTracks().forEach(track => track.stop());
          };
        }, [stream]);
        ```
    *   Implement dynamic loading (e.g., a `loadMLDependencies` async function similar to Prompt 12 vanilla JS version using `loadScript` helper or dynamic `import()`). Call this function after setting the stream. Update `mlStatus` state accordingly (`'loading'`, `'ready'`, `'error'`).
    *   In the JSX:
        *   Conditionally render the `<video>` element only when `permissionStatus === 'granted'`.
        *   Assign the `ref`: `<video ref={videoRef} ... />`. Include `autoPlay playsInline muted` attributes and necessary styles (width, height, transform scaleX).
        *   Hide the "Access Camera" button when permission is granted or pending.
        *   Optionally display ML loading status (`mlStatus`).
2.  Update test file for `PracticeView.tsx`:
    *   Mock `stream` object. Mock dynamic loading functions.
    *   Refine 'Grant' test: Assert `<video>` element appears (`screen.getByTestId('webcam-video')` - add `data-testid`). Assert (via ref spy or effect mock) that `srcObject` is set. Assert ML loading function is called. Assert `mlStatus` state updates.

Provide the updated state, refs, `useEffect` hooks, dynamic loading function structure, updated JSX, and updated RTL test cases.
````

---

**Prompt 13 (React): Hand Detection Hook & Loop Setup**

````text
Objective: Initialize the MediaPipe Hand Pose Detector and set up the detection loop using React hooks (`useRef`, `useEffect`) after ML libraries are loaded.

Context: Building on Prompt 12 (React). Video feed is active, ML libs load status (`mlStatus`) is tracked. Now initialize and run the detector. Consider creating a custom hook `useHandDetection` later, but implement inline first.

Requirements:
1.  Modify `components/PracticeView.tsx`:
    *   Use `useRef` for the detector instance: `const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);`
    *   Use `useRef` for the `requestAnimationFrame` ID: `const rafRef = useRef<number | null>(null);`
    *   Add a `useEffect` hook to initialize the detector, dependent on `mlStatus`:
        ```typescript
        useEffect(() => {
          if (mlStatus === 'ready') {
            const initialize = async () => {
              const model = handPoseDetection.SupportedModels.MediaPipeHands;
              // ... detectorConfig ...
              try {
                 // ... await tf.setBackend / tf.ready ... (if needed)
                 detectorRef.current = await handPoseDetection.createDetector(model, detectorConfig);
                 console.log('Hand detector initialized.');
                 // Trigger loop start maybe via another state/effect?
              } catch (error) { /* handle error, set mlStatus to 'error' */ }
            };
            initialize();
          }
          // Cleanup function to dispose detector
          return () => {
             detectorRef.current?.dispose();
             detectorRef.current = null;
             console.log('Hand detector disposed.');
          }
        }, [mlStatus]); // Dependency: mlStatus
        ```
    *   Add *another* `useEffect` hook to manage the detection loop, dependent on the detector being ready and the video element being available/ready:
        ```typescript
        useEffect(() => {
          const videoEl = videoRef.current;
          const detector = detectorRef.current;

          const detectHandsLoop = async () => {
            if (detector && videoEl && videoEl.readyState >= 2) {
              try {
                const hands = await detector.estimateHands(videoEl, { /* options */ });
                if (hands.length > 0) {
                  // console.log('Detected hands:', hands); // Process gestures (next step)
                  // *** Call gesture processing logic here ***
                }
              } catch (error) { /* handle error */ }
            }
            rafRef.current = requestAnimationFrame(detectHandsLoop); // Loop
          };

          if (detector && videoEl) {
            rafRef.current = requestAnimationFrame(detectHandsLoop); // Start loop
            console.log('Detection loop started.');
          }

          // Cleanup: cancel animation frame
          return () => {
            if (rafRef.current) {
              cancelAnimationFrame(rafRef.current);
              console.log('Detection loop stopped.');
            }
          };
        }, [detectorRef.current, videoRef.current]); // Dependencies: detector and video ref current values might need careful handling if refs update without re-render trigger, consider adding mlStatus or permissionStatus if needed
        ```
        *Note: Dependency arrays for effects using refs need care. Sometimes passing the ref object itself isn't enough if its `.current` property changes without a state change triggering re-render.*
2.  Update test file for `PracticeView.tsx`:
    *   Mock detector methods (`createDetector`, `estimateHands`, `dispose`). Mock `requestAnimationFrame`, `cancelAnimationFrame`.
    *   Test detector initialization `useEffect` is triggered when `mlStatus` becomes `'ready'`. Assert `createDetector` called. Assert `dispose` called on unmount.
    *   Test detection loop `useEffect` starts `rAF` when detector/video ready. Assert `estimateHands` called within `rAF` callback. Assert `cancelAnimationFrame` called on unmount.

Provide the updated refs, `useEffect` hooks, and RTL test case descriptions.
````

---

**Prompt 14 (React): Gesture Classification Logic & Tests**

```text
Objective: Implement and test the pure gesture classification functions in TypeScript.

Context: Building on Prompt 13 (React). The detection loop will provide hand landmark data. This logic should be isolated.

Requirements:
1.  Create `frontend/src/utils/gestureUtils.ts`.
2.  Define and export types/interfaces for Hand and Landmark data if not already available globally (e.g., `interface HandData { keypoints: Array<{x: number, y: number, z?: number, name?: string}> }`).
3.  Implement and export classifier functions:
    *   `isThumbsUp(hand: HandData): boolean`
    *   `isFlatHand(hand: HandData): boolean`
    *   `isThumbsDown(hand: HandData): boolean`
    *   `classifyGesture(hands: HandData[]): 'easy' | 'hard' | 'wrong' | 'none' | 'ambiguous'` (implementing multi-hand logic from spec).
    *   **Refine logic** based on landmark geometry. Use TypeScript type safety.
4.  Create `frontend/src/utils/gestureUtils.test.ts`.
5.  Write unit tests using Jest for `classifyGesture` with mock `HandData` covering all required cases. Use `describe` and `it`.

Provide the complete `gestureUtils.ts` (with refined logic or clear placeholders) and `gestureUtils.test.ts`.
```

---

**Prompt 15 (React): Gesture State Management & Border Feedback Hook**

````text
Objective: Manage gesture hold state (`currentGesture`, `gestureStartTime`) and visual feedback (border fill) using React state and effects.

Context: Building on Prompts 13 (React) & 14. The detection loop runs. Integrate gesture classification and add timing/feedback logic using React state.

Requirements:
1.  Modify `components/PracticeView.tsx`:
    *   Import `classifyGesture` from `utils/gestureUtils.ts`.
    *   Add state variables:
        ```typescript
        const [currentGesture, setCurrentGesture] = useState<'easy' | 'hard' | 'wrong' | 'none' | 'ambiguous'>('none');
        const [gestureStartTime, setGestureStartTime] = useState<number | null>(null);
        const [borderStyle, setBorderStyle] = useState<React.CSSProperties>({ borderColor: 'transparent' }); // Or use classNames
        const GESTURE_HOLD_DURATION = 3000;
        const gestureColors = { easy: 'green', hard: 'orange', wrong: 'red' };
        ```
    *   Modify the `detectHandsLoop` function (or the callback passed to the `useHandDetection` hook):
        *   Inside the loop, after getting `hands`, call `const recognizedGesture = classifyGesture(hands);`.
        *   Implement the state update logic based on `recognizedGesture` vs `currentGesture` (from Prompt 15 vanilla JS, adapted for `setState`). Use `Date.now()`.
        *   Update `borderStyle` state based on hold progress:
            *   Calculate `progress = (Date.now() - gestureStartTime) / GESTURE_HOLD_DURATION`.
            *   Implement filling effect (e.g., update `borderImage` or use a CSS variable set via the style prop). Example using simple border color change + transition (needs CSS setup):
              ```typescript
               // Inside state update logic...
               if (holding_same_gesture) {
                   const holdTime = Date.now() - gestureStartTime;
                   if (holdTime < GESTURE_HOLD_DURATION) {
                       // Update border fill (e.g., with linear gradient or pseudo-element width)
                       // Simple example: just set color
                       setBorderStyle({ borderColor: gestureColors[currentGesture], transition: 'border-color 0.1s linear' });
                   } else { /* handle completion - next step */ }
               } else if (new_valid_gesture) {
                   setBorderStyle({ borderColor: gestureColors[recognizedGesture], transition: 'none' }); // Start color immediately
               } else { // none/ambiguous
                   setBorderStyle({ borderColor: 'transparent', transition: 'border-color 0.2s linear' });
               }
              ```
    *   Apply the `borderStyle` state to the `gesture-overlay` div's `style` prop in JSX: `<div id="gesture-overlay" style={borderStyle} ...>`.
2.  Update test file for `PracticeView.tsx`:
    *   Mock `classifyGesture`, `Date.now()`.
    *   Test Case (Hold Start/Continue/Stop/Switch): Simulate `classifyGesture` returning different values over time (via mocked `rAF` callbacks). Assert internal state (`currentGesture`, `gestureStartTime`) updates correctly. Assert the `style` prop of the overlay div reflects the expected border color/style changes.

Provide the updated state variables, the modified detection loop logic integrating classification and state updates, the JSX change for applying `borderStyle`, and updated RTL test descriptions.
````

---

**Prompt 16 (React): Action Triggering, Props & Cooldown Hook**

```text
Objective: Trigger actions via component props upon successful gesture hold, provide brief solid border feedback, and implement the cooldown using React state and timeouts managed by effects.

Context: Building on Prompt 15 (React). Gesture hold state and border feedback are implemented. Now, connect to parent component logic via props and add cooldown.

Requirements:
1.  Modify `components/PracticeView.tsx` (or the component handling gestures):
    *   Define component props: `interface PracticeViewProps { /* other props */ onGestureRecognized: (action: 'easy' | 'hard' | 'wrong') => void; }` (Adjust component name and existing props). Ensure the parent component passes this prop.
    *   Add state for cooldown: `const [isCooldownActive, setIsCooldownActive] = useState(false);`
    *   Modify the gesture processing logic where `holdTime >= GESTURE_HOLD_DURATION`:
        *   Check `!isCooldownActive`.
        *   Call the prop function: `props.onGestureRecognized(currentGesture);`
        *   Set visual feedback state: Maybe a temporary state `const [feedbackColor, setFeedbackColor] = useState<string | null>(null);`. Set `setFeedbackColor(gestureColors[currentGesture])`. Use `useEffect` or `setTimeout` to clear `feedbackColor` after 0.5s. The `borderStyle` should reflect this `feedbackColor` when active, overriding the fill effect.
        *   Set `setIsCooldownActive(true)`.
        *   Use `useEffect` or a `setTimeout` triggered here to set `setIsCooldownActive(false)` after 1 second. Ensure timeout cleanup (return function from `useEffect` or `clearTimeout` if storing ID).
        *   Reset gesture state (`setCurrentGesture('none')`, `setGestureStartTime(null)`).
    *   Modify the gesture processing logic: Add check `if (isCooldownActive) return;` at the beginning.
2.  Update test file for `PracticeView.tsx`:
    *   Create a mock prop function: `const onGestureRecognizedMock = jest.fn();` Render component with `<PracticeView onGestureRecognized={onGestureRecognizedMock} />`.
    *   Mock timers (`jest.useFakeTimers`, `jest.advanceTimersByTime`).
    *   Test Case (Hold Complete): Simulate gesture hold completion. Assert `onGestureRecognizedMock` is called with the correct action ('easy', etc.). Assert cooldown state becomes true. Assert feedback style applied. Advance timer by 0.5s, assert feedback style removed. Advance timer by 1s total, assert cooldown state becomes false.
    *   Test Case (Cooldown Active): While cooldown state is true, simulate gesture detection. Assert `onGestureRecognizedMock` is *not* called again and state doesn't restart.

Provide the updated component props definition, state variables, modified gesture completion logic (calling props, setting feedback/cooldown state), JSX potentially updated for feedback style, and updated RTL test descriptions.
```
