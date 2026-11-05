# Pre-Push Quality Gate Setup

**Goal:** If the code has errors (lint / test / build failures), the push must be blocked.
The developer must fix the problem first, then push. This applies to everyone who works on the project in the future.

## Step 1: Check First (Do Not Recreate)
- Check whether `.githooks/pre-push` already exists.
- If Husky or pre-commit is already configured, use it. Do not build a separate system.
- If everything is already set up correctly, report "Setup already exists" and stop this part.
- Otherwise, continue.

## Step 2: Detect Language/Framework and Choose Commands
- **Node.js / React / Next.js** (`package.json`): `npm run lint`, `npm test`, `npm run build` (only scripts that exist).
- **Python** (`requirements.txt` / `pyproject.toml`): `ruff` or `flake8`, and `pytest`.
- **PHP / Laravel** (`composer.json`): `./vendor/bin/pint --test`, `php artisan test`.
- **Java** (`pom.xml` / `build.gradle`): `mvn test` or `./gradlew test`.
- **Go** (`go.mod`): `go vet ./...`, `go test ./...`
- **Other:** use that language's standard lint and test commands.
- If there are no tests, keep at least a build/compile check and inform me.

## Step 3: Create the Hook in a Shareable Folder
- Create `.githooks/pre-push` in the project root (NOT in `.git/hooks`, which is not shared).
- The file must start with `#!/bin/sh`.
- After each command, on failure print a clear error message and `exit 1`.
- Run checks only when pushing to `main` (optionally `staging`).
- Make it executable: `chmod +x .githooks/pre-push`

## Step 4: Point Git to the Folder
- Run: `git config core.hooksPath .githooks`
- Automatic setup for anyone who clones:
  - **Node.js:** add `"prepare": "git config core.hooksPath .githooks"` to `package.json` scripts (runs on `npm install`).
  - **Otherwise:** create `setup-hooks.sh` and document in the README that it must be run once after cloning.

## Step 5: Update the README
Add a short section covering:
- Which checks run before a push.
- What a new developer must do the first time (`npm install` or `setup-hooks.sh`).
- That errors block the push and must be fixed first.

## Step 6: Test It Yourself
1. Introduce a deliberate error and confirm the push is blocked.
2. Fix the error and confirm the push succeeds.
3. Remove the deliberate test error afterwards.

## Warnings
- `git push --no-verify` bypasses the hook. Do not use it.
- This hook works only on the local machine. Add GitHub branch protection and CI later for server-side enforcement.
- Do not change existing code or configuration unnecessarily.
