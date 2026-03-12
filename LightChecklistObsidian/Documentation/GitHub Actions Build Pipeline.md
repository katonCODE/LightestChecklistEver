# GitHub Actions CI/CD Pipeline

The Continuous Integration and Deployment process relies on [[GitHub Actions]] to automatically package and release the application.

## Package.json Configuration 
The `package.json` was updated to include:
- A `repository` field pointing to the GitHub repository.
- A `dist` script: `"dist": "electron-builder --publish always"`. 
- Explicit `build.publish` settings with `provider: github` to ensure artifacts are uploaded correctly.
- Standardized `target` formats (arrays) for macOS and Windows.

## Workflow Execution
The workflow is defined in `.github/workflows/build.yml`. It triggers whenever a repository tag that starts with `v` (like `v1.0.0`) is pushed to GitHub.

Important environment variables included for publishing:
- `GITHUB_TOKEN`: Standard token provided by GitHub Actions.
- `GH_TOKEN`: Explicitly required by many versions of `electron-builder` to authenticate and upload release assets.

To understand how the app logic works behind the scenes, see the [[Architecture Overview]].
