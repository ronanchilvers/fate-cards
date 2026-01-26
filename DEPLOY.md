# Deploying Fate Cards to GitHub Pages

This guide will help you deploy Fate Cards to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Node.js and npm installed

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

### 5. Deploy to GitHub Pages

```bash
npm run deploy
```

This command will:
- Build your project (`npm run build`)
- Create a `gh-pages` branch
- Push the `dist` folder to that branch

### 6. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Click **Pages** in the left sidebar
4. Under "Source", select **gh-pages** branch
5. Click **Save**

Your site will be live at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME` in a few minutes!

## Updating Your Deployed Site

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