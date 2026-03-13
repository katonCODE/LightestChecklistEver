# Drag and Drop Implementation

The drag and drop system for reorganizing tasks in the Lightest Checklist Ever app is custom-built using standard `pointerdown`, `pointermove`, and `pointerup` events to allow reordering across both mouse and touch inputs without relying on heavy external libraries like SortableJS.

## Features and Constraints

1. **X-Axis Locking**: To ensure tasks feel like they are constrained to the vertical list, the `drag-ghost` element's `translateX` is rigidly locked to its original X coordinate. This prevents the optical illusion that a task can be placed "wherever you want."

2. **Pointer Capture Safety**: The dragging architecture utilizes `setPointerCapture` and `releasePointerCapture`. This ensures that even if the user drags a task entirely outside the boundaries of the frameless Electron window, the `pointermove` and `pointerup` events are still registered perfectly. 
   - A fail-safe `ev.buttons === 0` check during `pointermove` prevents the ghost from getting "stuck" if macOS drops the `pointerup` event upon returning to the window.

3. **macOS Native Drag Prevention**: To avoid triggering a native text/element drag (which creates a translucent clipping and breaks the custom script's pointer tracking on macOS), `-webkit-user-drag: none;` is strictly applied to `.task-item` elements in the CSS.

## File References
Relevant logic can be found in `src/app.js` (under `onDragPointerDown`, `createGhost`, and `moveGhost`) and `src/styles.css` (`.task-item`, `.drag-ghost`).

[[Architecture Overview]]
