# Frontend Utilities Testing

Extracted critical frontend mechanisms from `app.js` into an isolated context capable of supporting Node.js testing environments without breaking DOM dependency ties.

- Extracted `getContrastColor` and `acceleratorFromEvent` to `utils.js`.
- Injected the newly modularized code natively into `index.html`.
- Implemented isolated testing routines verifying the visual engine computations and accelerator configurations via `utils.test.js`.
- Connects centrally to [[Vitest Integration]].
