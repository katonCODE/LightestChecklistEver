---
aliases: [Store]
tags: [architecture, storage, refactor]
---
# Store Component

The `store.js` component is responsible for handling all `fs` (file system) read/write operations for the application.

## Overview
It abstracts the core file operations out of `main.js`, keeping the main process focused on application lifecycle and IPC instead of raw file manipulation.

The factory function `createStore(filePath)` returns an object with two methods:
- `load()`: Safely reads and parses the JSON file, returning an empty array `[]` by default if the file doesn't exist.
- `save(items)`: Stringifies the provided data structure and writes it to disk safely.

## Dependencies Context
It reduces direct `fs` usage across the application logic. See [[Architecture Overview]] for how `main.js` integrates with IPC and [[Settings Architecture]] for how settings are saved via the store.
