# Task Completion Behaviour

Two optional features control how completed tasks are displayed. Both are toggled in [[Settings Architecture]].

## Tick to Bottom
- **Setting key:** `tickToBottom` (boolean, default: `false`)
- When enabled, ticking a task moves it to the bottom of the visible list.
- Implemented via `getDisplayOrder()` in `app.js` — active tasks render first, completed tasks render after. No re-ordering of the underlying `tasks` array occurs; only render order changes.

## Tick Divider
- **Setting key:** `tickDivider` (boolean, default: `false`)
- When enabled, a subtle horizontal rule labelled with lines appears between active and completed tasks.
- Implemented as a single reused `<li class="tick-divider">` DOM node injected by `insertDivider()` after each `renderTasks()` call.

## Performance Notes
- Both features trigger `renderTasks(true)` (no slide-in animation) only when a task is ticked **and** at least one feature is active. When both are off, `toggleTask` updates the DOM surgically in-place (no full re-render).
- The divider is a single persistent DOM node; it is moved, never recreated.
- No timers, polling, or observers are used.
