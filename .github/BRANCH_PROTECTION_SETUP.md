# Branch Protection Setup Guide

## Overview
Branch protection ensures code quality by requiring tests to pass before merging to main/production.

## Setup Instructions

### 1. Go to Your Repository Settings
1. Navigate to https://github.com/Tcrowley128/TCrowleyPersonalSite
2. Click **Settings** tab
3. Click **Branches** in the left sidebar

### 2. Add Branch Protection Rule for `main`

Click **"Add branch protection rule"** and configure:

#### Branch name pattern
```
main
```

#### Protection Settings (Check these boxes):

**Protect matching branches:**
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: 0 (since you're solo dev)
  - ✅ Dismiss stale pull request approvals when new commits are pushed

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Status checks to require:**
    - ✅ `test` (this is your GitHub Actions workflow)
    - ✅ `build` (part of the test workflow)

- ✅ **Require conversation resolution before merging** (optional but recommended)

- ✅ **Do not allow bypassing the above settings** (enforces rules even for admins)

**Optional (Recommended):**
- ✅ **Require linear history** (keeps git history clean)
- ✅ **Require deployments to succeed before merging** (if using Vercel auto-deploy)

#### Click "Create" or "Save changes"

### 3. Add Branch Protection Rule for `dev` (Optional but Recommended)

Repeat the same steps for the `dev` branch with slightly relaxed rules:

#### Branch name pattern
```
dev
```

#### Protection Settings:
- ✅ **Require status checks to pass before merging**
  - ✅ `test`
  - ✅ `build`

(You can skip the PR requirement for `dev` to allow faster iteration)

## Workflow After Setup

### Before Protection:
```bash
git push origin main  # Direct push allowed ❌
```

### After Protection:
```bash
# 1. Work on feature branch
git checkout -b feature/new-feature
git commit -m "Add feature"
git push origin feature/new-feature

# 2. Create Pull Request on GitHub
# 3. Tests run automatically
# 4. If tests pass ✅ → Merge button enabled
# 5. If tests fail ❌ → Merge button disabled
```

## Benefits

✅ **Prevents broken code** from reaching production
✅ **Enforces code review** process
✅ **Runs tests automatically** on every PR
✅ **Blocks deployment** if tests fail
✅ **Professional workflow** used by top companies

## Testing the Setup

1. Create a test branch: `git checkout -b test-protection`
2. Make a change and push
3. Create a PR to `main`
4. Watch GitHub Actions run tests
5. Merge will be blocked until tests pass

## Emergency Override

If you absolutely need to bypass (NOT recommended):
1. Temporarily disable branch protection
2. Make emergency fix
3. Re-enable protection immediately

## Questions?

- **Why require PRs?** Forces code review and prevents accidental direct pushes
- **Why status checks?** Ensures tests always pass before merging
- **Can I still push to dev?** Yes, if you don't add protection rules to dev
- **What if I'm the only developer?** Still valuable - catches bugs before production

---

**Setup Time:** 5 minutes
**Value:** Prevents production bugs forever ♾️
