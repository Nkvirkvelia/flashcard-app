Okay, here is a detailed `todo.md` checklist based on the specification and the development blueprint. You can use this to track your progress.

````markdown
# Project TODO Checklist: Flashcard App Enhancements

## Phase 0: Setup & Configuration

- [x] Verify Node.js and npm/yarn are installed.
- [x] Set up project structure (if not already existing).
- [x] Install necessary dependencies for backend testing (e.g., `jest`, `supertest`, `ts-jest`, `@types/jest`, `@types/supertest`).
- [x] Set up testing scripts in `package.json` for backend tests.
- [x] Ensure existing `Flashcard` class and `state.ts` (with `getBuckets`, `setBuckets`) are available for backend tests.
- [x] Set up testing environment for frontend/extension (e.g., Jest with JSDOM, or browser-specific tools).
- [x] Install necessary dependencies for frontend testing.
- [x] Install dependencies for gesture recognition (`@tensorflow/tfjs`, `@tensorflow-models/hand-pose-detection`, related `@types/` if using TypeScript).

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

- [x] Create `manifest.json` (v3, name, version, desc).
- [x] Add `permissions`: `scripting`, `activeTab` (initially).
- [x] Define `content_scripts` in `manifest.json` (`matches: <all_urls>`, `js: content.js`).
- [x] Create placeholder `icons` (e.g., `icon48.png`) and reference in `manifest.json`.
- [x] Create `content.js`.
- [x] Implement `mouseup` listener in `content.js` to check `window.getSelection()` and `console.log` if text selected.
- [x] **Manual Test:** Load extension in browser, select text on a webpage, verify console log message appears.

### 2.2: Floating Button Appearance

- [x] Modify `content.js`: Get selection range and bounding rectangle on `mouseup`.
- [x] Modify `content.js`: Calculate button position (below bottom-right corner of selection).
- [x] Modify `content.js`: Check for/remove existing button instance.
- [x] Modify `content.js`: Create button element (`#flashcard-quick-add-button`).
- [x] Modify `content.js`: Style button (absolute position, z-index, appearance).
- [x] Modify `content.js`: Set calculated `top`/`left` styles.
- [x] Modify `content.js`: Append button to `document.body`.
- [x] Set up Jest/JSDOM testing environment for `content.js`.
- [ ] Create `content.test.js`.
- [ ] **Test:** Assert button element exists in mock DOM after simulated selection & `mouseup`.
- [x] **Test:** Assert button has `position: absolute`.
- [x] **Test:** (Optional) Assert button `top`/`left` styles are approximately correct based on mock rect.

### 2.3: Floating Button Disappearance

- [x] Modify `content.js`: Add `mousedown` listener to `document`.
- [x] Modify `content.js` (`mousedown` listener): Remove button if click target is not the button itself.
- [x] Modify `content.js` (`mouseup` listener): Remove button if selection is empty (`window.getSelection().toString().trim() === ''`).
- [ ] Update `content.test.js`: Test button removed after simulated click outside the button.
- [ ] Update `content.test.js`: Test button removed after simulated selection clear & `mouseup`.

### 2.4: Modal HTML Structure & CSS

- [x] Define Modal HTML structure (e.g., as JS template string): Overlay div (`#flashcard-modal-overlay`), content div (`#flashcard-modal-content`), close 'X' button (`#flashcard-modal-close`), form, labels, inputs (`#flashcard-front`, `#flashcard-back`, `#flashcard-hint`, `#flashcard-tags`), required/optional indicators, message area (`#flashcard-modal-message`), Save button (`#flashcard-save`), Cancel button (`#flashcard-cancel`).
- [x] Create `popup.css` (or embed styles): Style overlay (fixed, full screen, bg dimming), content box (centered, bg, padding, etc.), close button, form elements, message area, buttons. Set overlay `display: none` initially.
- [x] Add `popup.css` to `content_scripts.css` array in `manifest.json`.

### 2.5: Modal Display & Basic Interaction

- [x] Modify `content.js`: Add `click` listener to the floating button (`#flashcard-quick-add-button`).
- [x] Modify `content.js` (button listener): Store selected text (`window.getSelection().toString()`).
- [x] Modify `content.js` (button listener): Check if modal exists; if not, inject HTML structure into `document.body`.
- [x] Modify `content.js` (button listener): Get 'Back' textarea (`#flashcard-back`) and set its value to stored selected text.
- [x] Modify `content.js` (button listener): Show the modal overlay (`display: block` or similar).
- [x] Modify `content.js` (button listener): Add listeners (only once) to Cancel (`#flashcard-cancel`) and 'X' (`#flashcard-modal-close`) buttons to hide the overlay (`display: none`).
- [ ] Update `content.test.js`: Test modal overlay becomes visible on floating button click.
- [ ] Update `content.test.js`: Test 'Back' textarea value is correctly pre-filled.
- [ ] Update `content.test.js`: Test modal overlay is hidden on Cancel button click.
- [ ] Update `content.test.js`: Test modal overlay is hidden on 'X' button click.

### 2.6: Tag Processing Logic & Tests

- [x] Create `utils.js`.
- [x] Implement `processTags(tagString)` function in `utils.js` (split by comma, trim whitespace, filter empty strings). Export it.
- [x] Create `utils.test.js`.
- [x] Write unit tests for `processTags` covering various inputs (null, empty, single, multiple, extra commas, whitespace variations).
- [x] Import `processTags` into `content.js`.
- [x] Add `utils.js` to `content_scripts.js` array in `manifest.json` if needed (check bundler setup).

### 2.7: Modal Save Logic & API Call (Mocked)

- [x] Modify `content.js`: Add `submit` event listener to the modal's `<form>`.
- [x] Modify `content.js` (submit listener): Call `event.preventDefault()`.
- [x] Modify `content.js` (submit listener): Get values from Front, Hint, Tags inputs.
- [x] Modify `content.js` (submit listener): Implement basic 'Front' field required validation (show message in `#flashcard-modal-message`, return if invalid).
- [x] Modify `content.js` (submit listener): Call `processTags` on Tags input value.
- [x] Modify `content.js` (submit listener): Construct `cardData` object (use 'Back' field value, omit `hint`/`tags` keys if empty/no tags).
- [x] Modify `content.js` (submit listener): Use `console.log` to mock API call with stringified `cardData`.
- [ ] Update `content.test.js`: Test form submit calls `preventDefault`.
- [ ] Update `content.test.js`: Test form submit triggers mock API log with correctly structured payload (check omitted optional fields).
- [ ] Update `content.test.js`: Test 'Front' validation shows error message and prevents mock API call.

### 2.8: API Integration & Feedback

- [x] Update `manifest.json`: Add/Verify `host_permissions` includes `"http://localhost/*/`. Update `permissions` if needed (e.g., add `storage`).
- [x] Modify `content.js` (submit listener): Make handler `async`. Replace `console.log` with `fetch` call (`POST /api/cards`, correct headers, stringified `cardData` body). Use `try...catch`.
- [x] Modify `content.js` (submit listener): Handle `fetch` response `if (response.ok)`.
  - [x] Display success message in `#flashcard-modal-message` (green color).
  - [x] Set 1-second `setTimeout` to hide modal (`display: none`) and clear message.
- [x] Modify `content.js` (submit listener): Handle `fetch` response `else` (non-ok).
  - [x] Parse error JSON (`await response.json()`).
  - [x] Display specific error message (or fallback) in `#flashcard-modal-message` (red color).
  - [x] Ensure modal remains open.
- [x] Modify `content.js` (submit listener): Handle `catch` block (network error).
  - [x] Display network error message in `#flashcard-modal-message` (red color).
  - [x] Ensure modal remains open.
- [x] Modify `content.js` (submit listener): Ensure message area is cleared before displaying new message.
- [ ] Update `content.test.js`: Mock global `fetch`.
- [ ] Update `content.test.js`: Test success case (fetch resolves ok -> success message, timer started, modal hides after timer). Use mock timers.
- [ ] Update `content.test.js`: Test client error case (fetch resolves !ok -> error message shown, modal remains open).
- [ ] Update `content.test.js`: Test network error case (fetch rejects -> network error message shown, modal remains open).

## Phase 3: Webcam Gesture Recognition Development

### 3.1: Basic Overlay UI Component & Styling

- [x] Modify `frontend/src/components/PracticeView.tsx` (or create a child component like `GestureOverlay.tsx`):
  - [x] Add state (`useState`) to manage visibility/activation of the gesture feature.
  - [x] Conditionally render a `div` element (`id="gesture-overlay"`, use `className` for styling) using JSX based on the state.
  - [x] Inside the overlay `div`, render a button (`id="gesture-access-button"`, use `className`) with initial text "Access Camera".
- [x] Modify `frontend/src/index.css` (or component-specific CSS/module):
  - [x] Add CSS rules for the overlay class (`.gesture-overlay-base`): positioning (fixed, bottom-right), dimensions, initial grey background, border-radius, flex centering, initial transparent border.
  - [x] Add CSS rules for the button class (`.gesture-button-base`): cursor, text style.
- [ ] Create/Update React Testing Library (RTL) test file for the component (`PracticeView.test.tsx` or `GestureOverlay.test.tsx`):
  - [ ] **Test:** Overlay and button render correctly when activation state is true.
  - [ ] **Test:** Overlay does not render (or renders differently) when activation state is false (if applicable).

### 3.2: Camera Access Logic & State

- [x] Modify the relevant React component (`PracticeView.tsx` or `GestureOverlay.tsx`):
  - [x] Add state (`useState`) for permission status (`'idle'`, `'pending'`, `'granted'`, `'denied'`).
  - [x] Add state (`useState`) for button text/label.
  - [x] Implement an `onClick` handler function (`handleAccessCameraClick`) for the "Access Camera" button.
  - [x] Inside the handler: Set permission state to `'pending'`, call `navigator.mediaDevices.getUserMedia({ video: true })`.
  - [x] Inside the `.then()` callback: Update permission state to `'granted'`, store the `stream` (potentially in state), update button text/visibility.
  - [x] Inside the `.catch()` callback: Update permission state to `'denied'`, update button text to "Permission Denied", log error.
  - [x] Update JSX to bind the `onClick` handler, display the button text from state, and potentially disable the button when pending.
- [ ] Update RTL test file:
  - [ ] Mock `navigator.mediaDevices.getUserMedia`.
  - [ ] **Test (Grant):** Simulate button click, mock `getUserMedia` resolving. Assert state updates and UI changes (e.g., button text/visibility).
  - [ ] **Test (Deny):** Simulate button click, mock `getUserMedia` rejecting. Assert state updates and UI changes (e.g., button text becomes "Permission Denied").

### 3.3: Webcam Feed Display & TFJS/MediaPipe Loading Hook

- [ ] Modify the relevant React component:
  - [ ] Add state (`useState`) to hold the `MediaStream` object (set in `getUserMedia` success).
  - [ ] Add state (`useState`) for ML library loading status (`'idle'`, `'loading'`, `'ready'`, `'error'`).
  - [x] Add `useRef` for the `<video>` element (`videoRef`).
  - [x] Conditionally render the `<video>` element in JSX when permission status is `'granted'`. Assign `videoRef` to its `ref` prop. Include `autoPlay`, `playsInline`, `muted` attributes and necessary styles (width, height, transform scaleX).
  - [ ] Add `useEffect` hook (dependent on `stream` state): Set `videoRef.current.srcObject = stream`. Include cleanup function to stop stream tracks.
  - [ ] Implement dynamic script loading logic (e.g., in a utility function or separate hook `useDynamicScript`).
  - [ ] Trigger dynamic script loading via `useEffect` when permission state is `'granted'`. Update ML loading status state accordingly.
- [ ] Update RTL test file:
  - [ ] Mock `MediaStream`. Mock dynamic script loading.
  * **Test:** Assert `<video>` element appears when permission is granted.
  * **Test:** Assert `videoRef.current.srcObject` is set correctly (might require checking ref or mocking video element methods).
  * **Test:** Assert ML loading functions are called only after permission grant.
  * **Test:** Assert ML loading status state updates correctly.

### 3.4: Hand Detection Hook & Loop Setup

- [ ] Modify the relevant React component (or create a custom hook `useHandDetection`):
  - [ ] Add `useRef` for the MediaPipe detector instance (`detectorRef`).
  - [ ] Add `useRef` for the `requestAnimationFrame` ID (`rafRef`).
  - [ ] Add `useEffect` hook (dependent on ML loading status `'ready'`): Initialize the detector (`handPoseDetection.createDetector`), store instance in `detectorRef.current`. Include cleanup to `dispose()` the detector. Handle initialization errors (update ML status state).
  - [ ] Add `useEffect` hook (dependent on `detectorRef.current` and `videoRef.current` readiness):
    - [ ] Define the `detectHandsLoop` async function inside the effect.
    - [ ] Inside `detectHandsLoop`: Check detector/video readiness, call `detectorRef.current.estimateHands()`, handle results (call gesture classification - Step 3.5), handle errors.
    - [ ] Inside `detectHandsLoop`: Recursively call `rafRef.current = requestAnimationFrame(detectHandsLoop)`.
    - [ ] Start the loop initially: `rafRef.current = requestAnimationFrame(detectHandsLoop)`.
    - [ ] Include cleanup function to `cancelAnimationFrame(rafRef.current)`.
- [ ] Update RTL test file:
  - [ ] Mock MediaPipe detector methods (`createDetector`, `estimateHands`, `dispose`). Mock `requestAnimationFrame`, `cancelAnimationFrame`.
  - [ ] **Test:** Detector initialization effect runs correctly when ML status is ready. `dispose` is called on unmount.
  - [ ] **Test:** Detection loop effect starts `rAF` when detector/video ready. `estimateHands` is called within `rAF` callback. `cancelAnimationFrame` is called on unmount.

### 3.5: Gesture Classification Logic & Tests

- [ ] Create `frontend/src/utils/gestureUtils.ts`.
- [ ] Define necessary TypeScript interfaces/types for hand/landmark data.
- [ ] Implement and export `isThumbsUp(hand: HandData): boolean`.
- [ ] Implement and export `isFlatHand(hand: HandData): boolean`.
- [ ] Implement and export `isThumbsDown(hand: HandData): boolean`.
- [ ] Implement and export `classifyGesture(hands: HandData[]): 'easy' | 'hard' | 'wrong' | 'none' | 'ambiguous'` (including multi-hand logic).
- [ ] Create `frontend/src/utils/gestureUtils.test.ts`.
- [ ] Write comprehensive Jest unit tests for `classifyGesture` using mock landmark data for all specified cases.

### 3.6: Gesture State Management & Border Feedback Hook

- [ ] Modify the relevant React component:
  - [ ] Import `classifyGesture` from `gestureUtils.ts`.
  - [ ] Add state (`useState`) for `currentGesture` (`'easy'`, `'hard'`, etc.).
  - [ ] Add state (`useState`) for `gestureStartTime` (`number | null`).
  - [ ] Add state (`useState`) for `borderStyle` (`React.CSSProperties`) or border class names. Define `gestureColors` map.
  - [ ] Integrate `classifyGesture` call into the `detectHandsLoop` callback (from Step 3.4).
  - [ ] Implement state update logic within the loop based on `classifyGesture` result vs. current state (using `setCurrentGesture`, `setGestureStartTime`).
  - [ ] Update `borderStyle` state based on gesture hold progress (`(Date.now() - gestureStartTime) / GESTURE_HOLD_DURATION`) to implement the filling animation (e.g., using CSS variables, background gradients, or styled-component props). Reset style on gesture stop/change.
  - [ ] Apply the `borderStyle` state (or class name) to the `#gesture-overlay` div's `style` (or `className`) prop in JSX.
- [ ] Update RTL test file:
  - [ ] Mock `classifyGesture`, `Date.now()`.
  - [ ] **Test (Hold Start/Continue/Stop/Switch):** Simulate `classifyGesture` results over time via mocked `rAF` calls. Assert internal state updates correctly. Assert `style` or `className` prop of the overlay `div` reflects expected border feedback (start, progress, reset).

### 3.7: Action Triggering, Props & Cooldown Hook

- [ ] Modify the relevant React component (`PracticeView.tsx` or `GestureOverlay.tsx`):
  - [ ] Define component props interface to include `onGestureRecognized: (action: 'easy' | 'hard' | 'wrong') => void;`. Ensure parent component passes this prop.
  - [ ] Add state (`useState`) for `isCooldownActive` (`boolean`).
  - [ ] Add state (`useState`) for temporary feedback style/class (`feedbackColor: string | null`).
  - [ ] Modify gesture processing logic (where hold duration is met):
    - [ ] Check `!isCooldownActive`.
    - [ ] Call the `props.onGestureRecognized(currentGesture)` function.
    - [ ] Set temporary feedback state (`setFeedbackColor`) to show solid border. Use `setTimeout` (managed within `useEffect` for cleanup) to clear this state after 0.5s.
    - [ ] Set `setIsCooldownActive(true)`.
    - [ ] Use `setTimeout` (managed within `useEffect` for cleanup) to set `setIsCooldownActive(false)` after 1s.
    - [ ] Reset gesture state (`setCurrentGesture('none')`, `setGestureStartTime(null)`).
  - [ ] Modify gesture processing logic: Add check `if (isCooldownActive) return;` at the beginning.
  - [ ] Update JSX `style`/`className` binding for the overlay to prioritize `feedbackColor` over the progress fill when active.
- [ ] Update RTL test file:
  - [ ] Mock the `onGestureRecognized` prop function (`jest.fn()`). Mock timers (`jest.useFakeTimers`).
  - [ ] **Test (Hold Complete):** Simulate gesture hold completion. Assert mock prop is called correctly. Assert cooldown state becomes true. Assert feedback style applied. Advance timer 0.5s, assert feedback style removed. Advance timer 1s, assert cooldown state becomes false.
  - [ ] **Test (Cooldown Active):** While cooldown state is true, simulate gesture detection. Assert mock prop is _not_ called again.

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

```
````
