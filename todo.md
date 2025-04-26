Okay, here is a detailed `todo.md` checklist based on the specification and the development blueprint. You can use this to track your progress.

```markdown
# Project TODO Checklist: Flashcard App Enhancements

## Phase 0: Setup & Configuration

- [ ] Verify Node.js and npm/yarn are installed.
- [ ] Set up project structure (if not already existing).
- [ ] Install necessary dependencies for backend testing (e.g., `jest`, `supertest`, `ts-jest`, `@types/jest`, `@types/supertest`).
- [ ] Set up testing scripts in `package.json` for backend tests.
- [ ] Ensure existing `Flashcard` class and `state.ts` (with `getBuckets`, `setBuckets`) are available for backend tests.
- [ ] Set up testing environment for frontend/extension (e.g., Jest with JSDOM, or browser-specific tools).
- [ ] Install necessary dependencies for frontend testing.
- [ ] Install dependencies for gesture recognition (`@tensorflow/tfjs`, `@tensorflow-models/hand-pose-detection`, related `@types/` if using TypeScript).

## Phase 1: Backend API Verification (`POST /api/cards`)

- [x] **Test Suite Setup:** Configure Jest/Supertest for API testing, including mock setup/teardown for `state.ts`.
- [x] **Test:** `it("adds new card to state with correct fields (front, back, hint, tags)")` - Verify 201 status, response body, and state change.
- [x] **Test:** `it("adds new card to bucket 0")` - Verify specifically that the card lands in bucket 0 in the state.
- [x] **Test:** `it("returns 400 if required field 'front' is missing")`.
- [x] **Test:** `it("returns 400 if required field 'back' is missing")`.
- [x] **Test:** `it("handles optional field 'hint' correctly when missing")` - Verify 201 status and correct state/response.
- [x] **Test:** `it("handles optional field 'tags' correctly when missing")` - Verify 201 status and correct state/response.
- [x] **Test:** `it("handles optional fields 'hint' and 'tags' correctly when both are present")` - Verify 201 status.
- [x] **Test:** `it("returns 201 status and correct success response body on success")` (Covered partially above, ensure explicit check).
- [x] **Test:** (Optional) `it("returns 500 on internal server error")` - If simulating errors in state management is feasible.
- [x] **Run & Verify:** Ensure all backend API tests pass before proceeding.

## Phase 2: Browser Extension Development

### 2.1: Manifest & Basic Content Script Setup

- [ ] Create `manifest.json` (v3, name, version, desc).
- [ ] Add `permissions`: `scripting`, `activeTab` (initially).
- [ ] Define `content_scripts` in `manifest.json` (`matches: <all_urls>`, `js: content.js`).
- [ ] Create placeholder `icons` (e.g., `icon48.png`) and reference in `manifest.json`.
- [ ] Create `content.js`.
- [ ] Implement `mouseup` listener in `content.js` to check `window.getSelection()` and `console.log` if text selected.
- [ ] **Manual Test:** Load extension in browser, select text on a webpage, verify console log message appears.

### 2.2: Floating Button Appearance

- [ ] Modify `content.js`: Get selection range and bounding rectangle on `mouseup`.
- [ ] Modify `content.js`: Calculate button position (below bottom-right corner of selection).
- [ ] Modify `content.js`: Check for/remove existing button instance.
- [ ] Modify `content.js`: Create button element (`#flashcard-quick-add-button`).
- [ ] Modify `content.js`: Style button (absolute position, z-index, appearance).
- [ ] Modify `content.js`: Set calculated `top`/`left` styles.
- [ ] Modify `content.js`: Append button to `document.body`.
- [ ] Set up Jest/JSDOM testing environment for `content.js`.
- [ ] Create `content.test.js`.
- [ ] **Test:** Assert button element exists in mock DOM after simulated selection & `mouseup`.
- [ ] **Test:** Assert button has `position: absolute`.
- [ ] **Test:** (Optional) Assert button `top`/`left` styles are approximately correct based on mock rect.

### 2.3: Floating Button Disappearance

- [ ] Modify `content.js`: Add `mousedown` listener to `document`.
- [ ] Modify `content.js` (`mousedown` listener): Remove button if click target is not the button itself.
- [ ] Modify `content.js` (`mouseup` listener): Remove button if selection is empty (`window.getSelection().toString().trim() === ''`).
- [ ] Update `content.test.js`: Test button removed after simulated click outside the button.
- [ ] Update `content.test.js`: Test button removed after simulated selection clear & `mouseup`.

### 2.4: Modal HTML Structure & CSS

- [ ] Define Modal HTML structure (e.g., as JS template string): Overlay div (`#flashcard-modal-overlay`), content div (`#flashcard-modal-content`), close 'X' button (`#flashcard-modal-close`), form, labels, inputs (`#flashcard-front`, `#flashcard-back`, `#flashcard-hint`, `#flashcard-tags`), required/optional indicators, message area (`#flashcard-modal-message`), Save button (`#flashcard-save`), Cancel button (`#flashcard-cancel`).
- [ ] Create `popup.css` (or embed styles): Style overlay (fixed, full screen, bg dimming), content box (centered, bg, padding, etc.), close button, form elements, message area, buttons. Set overlay `display: none` initially.
- [ ] Add `popup.css` to `content_scripts.css` array in `manifest.json`.

### 2.5: Modal Display & Basic Interaction

- [ ] Modify `content.js`: Add `click` listener to the floating button (`#flashcard-quick-add-button`).
- [ ] Modify `content.js` (button listener): Store selected text (`window.getSelection().toString()`).
- [ ] Modify `content.js` (button listener): Check if modal exists; if not, inject HTML structure into `document.body`.
- [ ] Modify `content.js` (button listener): Get 'Back' textarea (`#flashcard-back`) and set its value to stored selected text.
- [ ] Modify `content.js` (button listener): Show the modal overlay (`display: block` or similar).
- [ ] Modify `content.js` (button listener): Add listeners (only once) to Cancel (`#flashcard-cancel`) and 'X' (`#flashcard-modal-close`) buttons to hide the overlay (`display: none`).
- [ ] Update `content.test.js`: Test modal overlay becomes visible on floating button click.
- [ ] Update `content.test.js`: Test 'Back' textarea value is correctly pre-filled.
- [ ] Update `content.test.js`: Test modal overlay is hidden on Cancel button click.
- [ ] Update `content.test.js`: Test modal overlay is hidden on 'X' button click.

### 2.6: Tag Processing Logic & Tests

- [ ] Create `utils.js`.
- [ ] Implement `processTags(tagString)` function in `utils.js` (split by comma, trim whitespace, filter empty strings). Export it.
- [ ] Create `utils.test.js`.
- [ ] Write unit tests for `processTags` covering various inputs (null, empty, single, multiple, extra commas, whitespace variations).
- [ ] Import `processTags` into `content.js`.
- [ ] Add `utils.js` to `content_scripts.js` array in `manifest.json` if needed (check bundler setup).

### 2.7: Modal Save Logic & API Call (Mocked)

- [ ] Modify `content.js`: Add `submit` event listener to the modal's `<form>`.
- [ ] Modify `content.js` (submit listener): Call `event.preventDefault()`.
- [ ] Modify `content.js` (submit listener): Get values from Front, Hint, Tags inputs.
- [ ] Modify `content.js` (submit listener): Implement basic 'Front' field required validation (show message in `#flashcard-modal-message`, return if invalid).
- [ ] Modify `content.js` (submit listener): Call `processTags` on Tags input value.
- [ ] Modify `content.js` (submit listener): Construct `cardData` object (use 'Back' field value, omit `hint`/`tags` keys if empty/no tags).
- [ ] Modify `content.js` (submit listener): Use `console.log` to mock API call with stringified `cardData`.
- [ ] Update `content.test.js`: Test form submit calls `preventDefault`.
- [ ] Update `content.test.js`: Test form submit triggers mock API log with correctly structured payload (check omitted optional fields).
- [ ] Update `content.test.js`: Test 'Front' validation shows error message and prevents mock API call.

### 2.8: API Integration & Feedback

- [ ] Update `manifest.json`: Add/Verify `host_permissions` includes `"http://localhost/*/`. Update `permissions` if needed (e.g., add `storage`).
- [ ] Modify `content.js` (submit listener): Make handler `async`. Replace `console.log` with `fetch` call (`POST /api/cards`, correct headers, stringified `cardData` body). Use `try...catch`.
- [ ] Modify `content.js` (submit listener): Handle `fetch` response `if (response.ok)`.
  - [ ] Display success message in `#flashcard-modal-message` (green color).
  - [ ] Set 1-second `setTimeout` to hide modal (`display: none`) and clear message.
- [ ] Modify `content.js` (submit listener): Handle `fetch` response `else` (non-ok).
  - [ ] Parse error JSON (`await response.json()`).
  - [ ] Display specific error message (or fallback) in `#flashcard-modal-message` (red color).
  - [ ] Ensure modal remains open.
- [ ] Modify `content.js` (submit listener): Handle `catch` block (network error).
  - [ ] Display network error message in `#flashcard-modal-message` (red color).
  - [ ] Ensure modal remains open.
- [ ] Modify `content.js` (submit listener): Ensure message area is cleared before displaying new message.
- [ ] Update `content.test.js`: Mock global `fetch`.
- [ ] Update `content.test.js`: Test success case (fetch resolves ok -> success message, timer started, modal hides after timer). Use mock timers.
- [ ] Update `content.test.js`: Test client error case (fetch resolves !ok -> error message shown, modal remains open).
- [ ] Update `content.test.js`: Test network error case (fetch rejects -> network error message shown, modal remains open).

## Phase 3: Webcam Gesture Recognition Development

### 3.1: Basic Overlay UI & Styling

- [ ] Modify **`index.html`**: Add overlay container `div#gesture-overlay`.
- [ ] Modify **`index.html`**: Add button/span `#gesture-access-button` inside overlay with text "Access Camera".
- [ ] Modify **your existing CSS file (e.g., `style.css` or `index.css`)**: Style `#gesture-overlay` (fixed position bottom-right, dimensions, grey background, border-radius, flex centering, initial transparent border).
- [ ] Modify **your existing CSS file**: Style `#gesture-access-button` (cursor, text style).

### 3.2: Camera Access Logic & UI Update

- [ ] Modify **your existing JS file (e.g., `script.js` or `index.js`)**: Get references to `#gesture-overlay`, `#gesture-access-button`.
- [ ] Modify **your existing JS file**: Add `click` listener to `#gesture-access-button`.
- [ ] Modify **your existing JS file** (listener): Call `navigator.mediaDevices.getUserMedia({ video: true })`.
- [ ] Modify **your existing JS file** (`.then`): Log success, potentially hide button text/update overlay style.
- [ ] Modify **your existing JS file** (`.catch`): Log error, update `#gesture-access-button` text to "Permission Denied".
- [ ] Create/Update **your frontend test file (e.g., `index.test.js`)**. Mock `getUserMedia`.
- [ ] **Test:** Grant permission scenario -> success logic runs, UI updates.
- [ ] **Test:** Deny permission scenario -> error logic runs, button text updates.

### 3.3: Webcam Feed Display & TFJS/MediaPipe Loading

- [ ] Modify **your existing JS file** (`getUserMedia.then`): Accept `stream`.
- [ ] Modify **your existing JS file**: Create `<video>` element programmatically.
- [ ] Modify **your existing JS file**: Set video attributes (`playsinline`, `autoplay`, `muted`) and styles (`width`, `height`, `object-fit`, `transform: scaleX(-1)`).
- [ ] Modify **your existing JS file**: Set `video.srcObject = stream`.
- [ ] Modify **your existing JS file**: Append video element to `#gesture-overlay`. Hide/remove access button.
- [ ] Modify **your existing JS file**: Implement helper function (`loadScript` or dynamic `import()`) for loading external JS.
- [ ] Modify **your existing JS file**: Call helper to load TFJS Core, Backend, and Hand Pose Detection _after_ stream setup is complete.
- [ ] Update **your frontend test file**: Assert `<video>` created, configured, appended on permission grant.
- [ ] Update **your frontend test file**: Assert ML dependency loading functions are called only on permission grant.

### 3.4: Hand Detection Loop (Basic)

- [ ] Modify **your existing JS file**: Add module-level variables for `detector`, `videoElement`.
- [ ] Modify **your existing JS file**: Implement `initializeDetector` function (await `tf.setBackend`, `tf.ready`, `handPoseDetection.createDetector`). Call after libraries loaded. Handle init errors.
- [ ] Modify **your existing JS file**: Implement `detectHandsLoop` function using `requestAnimationFrame`.
- [ ] Modify **your existing JS file** (loop): Check if `detector` and `videoElement` (with `readyState`) are ready.
- [ ] Modify **your existing JS file** (loop): Call `await detector.estimateHands(videoElement)`. Use `try...catch`.
- [ ] Modify **your existing JS file** (loop): `console.log` detected `hands` array if length > 0.
- [ ] Modify **your existing JS file** (loop): Call `requestAnimationFrame(detectHandsLoop)` recursively.
- [ ] Modify **your existing JS file** (`initializeDetector`): Start loop (`requestAnimationFrame(detectHandsLoop)`) after successful detector init.
- [ ] Update **your frontend test file**: Mock TF/MediaPipe/detector methods (`setBackend`, `ready`, `createDetector`, `estimateHands`). Mock `requestAnimationFrame`.
- [ ] **Test:** `initializeDetector` calls `createDetector` correctly.
- [ ] **Test:** `detectHandsLoop` calls `estimateHands` within `requestAnimationFrame`.
- [ ] **Test:** `detectHandsLoop` processes mock hand data result.

### 3.5: Gesture Classification Logic & Tests

- [ ] Create `gestureUtils.js` (or add to existing utils).
- [ ] Implement helper `isThumbsUp(hand)` using landmark geometry.
- [ ] Implement helper `isFlatHand(hand)` using landmark geometry (palm facing camera, fingers extended).
- [ ] Implement helper `isThumbsDown(hand)` using landmark geometry.
- [ ] Implement main `classifyGesture(hands)` function (handle multi-hand logic).
- [ ] Export `classifyGesture`.
- [ ] Create `gestureUtils.test.js`.
- [ ] Write unit tests for `classifyGesture` with mock landmark data for all required cases.

### 3.6: Gesture Hold Timer & Border Feedback

- [ ] Modify **your existing JS file**: Import `classifyGesture` from `gestureUtils.js` (adjust path if needed).
- [ ] Modify **your existing JS file**: Add state variables (`currentGesture`, `gestureStartTime`, `GESTURE_HOLD_DURATION`, `gestureColors`).
- [ ] Modify **your existing JS file** (`detectHandsLoop`): Call `classifyGesture(hands)`.
- [ ] Modify **your existing JS file** (loop): Implement state logic for gesture hold timing.
- [ ] Modify **your existing JS file** (loop): Implement border "filling" animation on `#gesture-overlay` based on hold progress.
- [ ] Modify **your existing JS file** (loop): Reset border/animation when gesture stops or changes.
- [ ] Update **your frontend test file**: Mock `classifyGesture`, `Date.now()`, timers, `rAF`.
- [ ] **Test:** Hold Start: State updates, border starts filling (mock style assertion).
- [ ] **Test:** Hold Continue: Border progress updates (mock style assertion).
- [ ] **Test:** Hold Complete: Recognition log occurs, state reset prepares for action.
- [ ] **Test:** Hold Interrupt: State/border reset.
- [ ] **Test:** Hold Switch: State updates for new gesture, border restarts fill.

### 3.7: Action Triggering, Feedback & Cooldown

- [ ] Modify **your existing JS file**: Add state variable `isCooldownActive = false`.
- [ ] Modify **your existing JS file** (loop): Add `if (isCooldownActive) return;` near the beginning of gesture processing logic.
- [ ] Modify **your existing JS file** (loop, on hold complete):
  - [ ] Check `!isCooldownActive`.
  - [ ] Call corresponding action function (`handleEasy()`, `handleHard()`, `handleWrong()`). Use `try...catch`. Ensure functions exist/are imported/available in the scope of **your existing JS file**.
  - [ ] Set overlay border to solid color (`gestureColors[recognizedAction]`) immediately.
  - [ ] Use 0.5s `setTimeout` to reset border to transparent (if state allows).
  - [ ] Set `isCooldownActive = true`.
  - [ ] Use 1s `setTimeout` to set `isCooldownActive = false`.
  - [ ] Reset `currentGesture`, `gestureStartTime` state _after_ triggering action.
- [ ] Update **your frontend test file**: Mock action handlers (`handleEasy`, etc.), mock timers.
- [ ] **Test:** Correct action handler called on hold complete.
- [ ] **Test:** Solid border feedback applied for 0.5s then reset.
- [ ] **Test:** Cooldown state (`isCooldownActive`) managed correctly by timers.
- [ ] **Test:** Gesture detection/action triggering is paused during cooldown.

## Phase 4: Integration & Final Testing

- [ ] **Manual Test (Extension):** Use extension on various websites. Select text, fill fields (incl. optional), save. Verify card appears correctly in backend/practice app (in Bucket 0). Test cancel/close. Test error handling (e.g., save without front).
- [ ] **Manual Test (Gestures):** Start practice session. Grant camera permission. Use Thumbs Up, Flat Hand, Thumbs Down gestures. Verify correct actions ("Easy", "Hard", "Wrong") are triggered and card state updates appropriately. Test hold timing and cooldown.
- [ ] **Manual Test (Gestures - Robustness):** Test gestures under different lighting conditions, with different backgrounds, different hand sizes/shapes if possible.
- [ ] **Manual Test (Coexistence):** Use both mouse clicks on buttons and hand gestures during a single practice session. Verify both input methods work correctly and don't interfere unexpectedly.
- [ ] **Automated E2E Tests:** (Optional) Implement basic E2E tests using Puppeteer/Cypress for key scenarios if time permits.
- [ ] **Code Review:** Review code for clarity, efficiency, adherence to spec, and best practices.
- [ ] **Refactoring:** Refactor code based on review feedback and identified improvements.
- [ ] **Final Check:** Ensure all tests (unit, integration, E2E if applicable) pass.
```
