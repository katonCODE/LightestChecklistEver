# Git Ignore Policies

A standard `.gitignore` file has been added to exclude local, build, and environment-specific files from version control.

## Ignored Components
- **Node Dependencies**: `node_modules/`
- **User Data**: `LightChecklist.json` and `settings.json` (as referenced in [[Architecture Overview]])
- **Obsidian Workspaces**: Local `.obsidian/workspace.json`, `.obsidian/workspace`, `.obsidian/graph.json` and similar local graphical states in the vault.
- **OS Files**: `.DS_Store`, `Thumbs.db`

This ensures that our repository remains clean and developers' localized data isn't tracked or accidentally overwritten.
