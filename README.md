# FinQuest — refreshed UI

This package contains the redesigned FinQuest experience. It keeps the original learning, quiz, chat, badge, and progress flows while adding a dashboard-led landing screen, clearer calls to action, richer visual hierarchy, and desktop-responsive styling.

## FinBuddy tutor setup

FinBuddy calls a server-side `POST /api/finbuddy` endpoint when one is available, and uses the built-in finance lesson coach if it is not. Copy `.env.example` to `.env.local`, add `GEMINI_API_KEY`, then restart `npm run dev`. The key is read only by the Vite development middleware and is never sent to browser code. The repository also includes `api/finbuddy.js`, a serverless handler for deployments that support an `/api` function directory. Configure a different endpoint with `VITE_FINBUDDY_ENDPOINT` when needed.

Both handlers send Gemini this strict `system_instruction`: the tutor answers only finance, investing, economics, budgeting, and corporate-market questions; non-finance questions receive the prescribed refusal response.

## Preview locally

1. Install Node.js 18 or newer.
2. In this folder, run `npm install`.
3. Run `npm run dev` and open the local address Vite prints.

To make a production build, run `npm run build`. The generated preview files will be in `dist/`.

## Add to GitHub

1. Create a new empty repository at https://github.com/new.
2. Unzip this download and open a terminal inside the `finquest-redesign` folder.
3. Run these commands, replacing `YOUR-USERNAME` and `YOUR-REPOSITORY`:

```bash
git init
git add .
git commit -m "Refresh FinQuest UI"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Do not upload `node_modules`; it is ignored and gets recreated by `npm install`.
