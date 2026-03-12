# Task Sorting

The application supports manual task reordering via drag-and-drop using a custom **pointer-event** system (not the HTML5 Drag API).

## Architecture
- **Pointer Events**: Uses `pointerdown` → `pointermove` → `pointerup` lifecycle with `setPointerCapture` for reliable tracking even outside the list bounds.
- **Dead Zone**: A 5px vertical threshold prevents accidental drags when clicking checkboxes or delete buttons.
- **Event Isolation**: Clicks on `.task-checkbox` and `.delete-btn` are explicitly excluded from initiating a drag via `e.target.closest()`.

## Performance
- **`requestAnimationFrame` Throttle**: `pointermove` fires at screen refresh rate, but `updateDropTarget()` is gated behind a single `rAF` — only one DOM read/write per frame.
- **Single Drop Indicator**: A persistent `div.drop-indicator` element is moved via `insertBefore`, never created or destroyed during drag.
- **`will-change` Scoped**: Only applied to the `.dragging` element, removed on drop.
- **No Animation Replay**: `renderTasks(true)` applies `.no-animate` to suppress the `slideIn` keyframe after reorder.

## Data Integrity
- The `tasks` array is updated via surgical `splice(from, 1)` + `splice(to, 0, moved)` — never rebuilt from DOM queries.

## Related
- [[Architecture Overview]]
- [[Custom Window Resizing]]
