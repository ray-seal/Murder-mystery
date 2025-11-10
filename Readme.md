# The Case Files — Murder Mystery (Static Web App)

A small static murder-mystery game designed for quick deployment on Vercel. Each time you "Start Case" the app generates a random case: victim, suspects, killer, weapon, location and clues. Players inspect clues and accuse a suspect.

Design notes:
- Colour scheme: beige/old paper + blood red accents.
- Title uses a typewriter style font (Special Elite).
- Start button styled to look like dripping blood.
- Uses free photos from Unsplash (see attributions below).

How to deploy to Vercel:
1. Push these files to a GitHub repo (already in this repo).
2. Go to https://vercel.com/new, import the repository, leave defaults (Framework Preset: Other — Static Site).
3. Vercel will auto-deploy the site. Alternatively, use the Vercel CLI:
   - npm i -g vercel
   - vercel login
   - vercel

Files in this project:
- index.html — app UI
- styles.css — styles and dripping button effect
- app.js — case generation and interactivity
- README.md — this file
- LICENSE — MIT

Assets & Attributions (Unsplash — free to use):
- Crime scene / hero photo: https://unsplash.com/photos/-nYaA1K2cGk
- Victim/suspect photos: samples from Unsplash (hotlinked images in app.js)
  - Portraits and free images from Unsplash (https://unsplash.com). Unsplash photos are free to use — see https://unsplash.com/license

If you want:
- More suspects, richer clue logic, or persistent leaderboards (requires a backend).
- Multiple difficulty modes (more decoys on Hard).
- Printable "case file" PDF export.

What's included and what I did:
I created a compact, self-contained static app (HTML/CSS/JS) that randomizes cases and provides a simple, replayable user experience. The visuals match your requested color palette and typography; the start button uses a CSS dripping-blood effect. The app uses Unsplash images (free-use) for victim and suspects.

Next steps you can take:
- Push the files to the repository and deploy to Vercel.
- If you'd like, I can convert this into a Next.js app, add persistent storage (Firestore or KV) for multi-player scoring, or add more advanced clue generation and branching narrative.
