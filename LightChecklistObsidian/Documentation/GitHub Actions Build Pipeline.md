# GitHub Actions CI/CD Pipeline

The Continuous Integration and Deployment process relies on [[GitHub Actions]] to automatically package and release the application.

## Workflow Execution
The workflow is defined in `.github/workflows/build.yml`. It triggers whenever a repository tag that starts with `v` (like `v1.0.0`) is pushed to GitHub.

## Package.json Configuration 
The `package.json` was updated to include a `dist` script: `"dist": "electron-builder --publish always"`. This command triggers the builder tool, which detects the executing OS natively in the GitHub Action runners (`macos-latest` and `windows-latest`) and seamlessly compiles the build.

To understand how the app logic works behind the scenes, see the [[Architecture Overview]].
