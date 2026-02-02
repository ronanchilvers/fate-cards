# Deploying Fate Cards to GitHub Pages

This guide will help you deploy Fate Cards to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Node.js and npm installed

## Deployment Methods

There are two ways to deploy this site to GitHub Pages:

### Method 1: Automated Deployment with GitHub Actions (Recommended)

This repository includes a GitHub Actions workflow that automatically deploys your site whenever you push to the main branch.

**Setup:**
1. Push your code to GitHub (see "Setup Steps" below)
2. Go to your repository settings on GitHub
3. Navigate to **Settings → Pages**
4. Under "Build and deployment", select **Source: GitHub Actions**
5. The workflow will automatically run on the next push to `main`

The site will be automatically deployed to `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME`

### Method 2: Manual Deployment with npm script

You can also deploy manually using the `npm run deploy` command.

**Requirements:**
- Git credentials configured on your machine
- Write access to the repository

**To deploy manually:**
```bash
npm run deploy
```

This will build the project and push the `dist` folder to the `gh-pages` branch.

## Setup Steps

### 1. Update the Homepage URL

Edit `package.json` and change the `homepage` field to match your GitHub username and repository name:

```json
"homepage": "https://YOUR-USERNAME.github.io/YOUR-REPO-NAME"
```

For example:
```json
"homepage": "https://johndoe.github.io/fate-cards"
```

### 2. Update Vite Base Path

If you changed the repository name, also update `vite.config.js`:

```js
base: '/YOUR-REPO-NAME/'
```

### 3. Create a GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it (e.g., `fate-cards`)
3. Don't initialize with README, .gitignore, or license (we already have these)

### 4. Initialize Git and Push to GitHub

From your project directory:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 5. Enable GitHub Pages (if using GitHub Actions)

If using the automated GitHub Actions deployment:
1. Go to your repository on GitHub
2. Click **Settings**
3. Click **Pages** in the left sidebar
4. Under "Build and deployment", select **Source: GitHub Actions**
5. The next push to `main` will automatically deploy the site

If using manual deployment with `npm run deploy`:
1. Run `npm run deploy` first
2. Go to your repository on GitHub
3. Click **Settings**
4. Click **Pages** in the left sidebar
5. Under "Source", select **gh-pages** branch
6. Click **Save**

Your site will be live at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME` in a few minutes!

## Updating Your Deployed Site

### With GitHub Actions (Automated)
Simply push your changes to the main branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The site will automatically rebuild and deploy.

### With Manual Deployment

Whenever you want to deploy changes:

```bash
git add .
git commit -m "Your commit message"
git push origin main
npm run deploy
```

## Troubleshooting

### Blank page after deployment

Make sure:
- The `homepage` in `package.json` matches your GitHub Pages URL
- The `base` in `vite.config.js` matches your repo name
- You've run `npm run deploy` after making these changes

### 404 errors

GitHub Pages can take a few minutes to update. Wait 5-10 minutes and try again.

### Custom Domain

To use a custom domain:
1. Add a `CNAME` file to the `public/` folder with your domain
2. Configure your domain's DNS settings (see GitHub's documentation)
3. In GitHub repo settings > Pages, add your custom domain

## Local Testing

Before deploying, test the production build locally:

```bash
npm run build
npm run preview
```

This will show you exactly how it will look when deployed.