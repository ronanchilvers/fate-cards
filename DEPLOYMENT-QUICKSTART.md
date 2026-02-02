# Quick Deployment Guide

This repository is configured for deployment to GitHub Pages. Choose your preferred method:

## Option 1: Automated Deployment (Recommended)

The site automatically deploys when you push to the `main` branch.

**Setup (one-time):**
1. Go to your repository on GitHub
2. Navigate to **Settings → Pages**
3. Under "Build and deployment", select **Source: GitHub Actions**

**Deploy:**
```bash
git push origin main
```

That's it! GitHub Actions will build and deploy automatically.

## Option 2: Manual Deployment

Deploy anytime with a single command:

```bash
npm run deploy
```

This builds the site and pushes to the `gh-pages` branch.

**First-time setup:**
1. Run `npm run deploy`
2. Go to **Settings → Pages** on GitHub
3. Select **Source: gh-pages branch**

## Checking Deployment Status

- **GitHub Actions:** Check the "Actions" tab in your repository
- **Live site:** https://ronanchilvers.github.io/fate-cards

## Local Testing

Test the production build before deploying:

```bash
npm run build
npm run preview
```

---

For detailed instructions, see [DEPLOY.md](DEPLOY.md).
