# Development Workflow

This document outlines the standard development process for this project.

## Branch Strategy

We follow a **two-branch workflow** for development and deployment:

```
local → dev → main
  ↓      ↓      ↓
local  Vercel  Vercel
test   Dev    Production
```

### Branches

- **`main`** - Production branch (protected)
  - Deployed to: Vercel Production
  - Only merge from `dev` after successful testing
  - Triggers production deployment on push

- **`dev`** - Development branch
  - Deployed to: Vercel Preview/Dev environment
  - Used for testing before production
  - Triggers preview deployment on push

### Workflow Steps

#### 1. Local Development
```bash
# Make sure you're on dev branch
git checkout dev

# Pull latest changes
git pull origin dev

# Make your changes
# ... edit files ...

# Run tests locally
npm test

# Run build verification
npm run build

# Run linting
npm run lint
```

#### 2. Commit to Dev Branch
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature XYZ"

# Push to dev branch
git push origin dev
```

This will:
- ✅ Trigger GitHub Actions tests
- ✅ Deploy to Vercel Dev environment
- ✅ Run unit tests in CI/CD

#### 3. Test in Vercel Dev
- Visit your Vercel dev deployment URL
- Thoroughly test all changes
- Verify functionality works as expected
- Check console for errors
- Test on mobile/desktop

#### 4. Merge to Main (Production)
Only after successful testing in dev:

```bash
# Switch to main branch
git checkout main

# Pull latest main
git pull origin main

# Merge dev into main
git merge dev

# Push to main
git push origin main
```

This will:
- ✅ Trigger GitHub Actions tests
- ✅ Deploy to Vercel Production
- ✅ Make changes live to users

## GitHub Actions

Our CI/CD pipeline runs on both `dev` and `main` branches:

### What Gets Tested
- ✅ Unit tests (Jest)
- ✅ Build verification (Next.js build)
- ✅ Environment configuration check

### Test Configuration
See `.github/workflows/test.yml` for details.

## Environment Variables

Make sure these are set in Vercel for both environments:

### Required Secrets
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

## Vercel Configuration

### Dev Environment
- Branch: `dev`
- URL: `https://your-project-dev.vercel.app`

### Production Environment
- Branch: `main`
- URL: `https://your-project.vercel.app`

## Commit Message Convention

Follow conventional commits for better changelog generation:

```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semi-colons, etc
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

Examples:
```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve contact form validation bug"
git commit -m "test: add unit tests for Hero component"
```

## Pre-Deployment Checklist

Before merging to main:

- [ ] All tests passing locally
- [ ] All tests passing in GitHub Actions on dev
- [ ] Vercel dev deployment successful
- [ ] Manual testing completed on dev environment
- [ ] No console errors
- [ ] Mobile responsive testing done
- [ ] Performance check (Lighthouse/PageSpeed)
- [ ] Database migrations applied (if any)

## Emergency Hotfix Process

For critical production bugs:

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug-fix

# Make fix
# ... edit files ...

# Test locally
npm test && npm run build

# Commit
git commit -m "hotfix: fix critical bug XYZ"

# Merge to main
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

# Merge back to dev
git checkout dev
git merge hotfix/critical-bug-fix
git push origin dev

# Delete hotfix branch
git branch -d hotfix/critical-bug-fix
```

## Local Development Tips

### Run Dev Server
```bash
npm run dev
# Opens on http://localhost:3000
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Check Test Coverage
```bash
npm run test:coverage
```

### Lint Code
```bash
npm run lint
```

## Troubleshooting

### Tests Failing in CI but Passing Locally
- Check environment variables are set in GitHub Secrets
- Verify Node version matches (see `.github/workflows/test.yml`)
- Review GitHub Actions logs

### Vercel Deployment Failing
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Ensure all dependencies are in package.json

### Merge Conflicts
```bash
# Update your branch with latest main
git checkout dev
git merge main
# Resolve conflicts
git commit -m "chore: resolve merge conflicts"
```

## Questions?

If you have questions about the workflow, check:
- `.github/workflows/test.yml` - CI/CD configuration
- `jest.config.js` - Test configuration
- `package.json` - Available scripts
