# The Case Files — Murder Mystery (Static Web App)

A static murder-mystery investigation game with interactive evidence-gathering tasks. Each case generates a unique victim, suspects, killer, weapon, location, and hidden clues that must be uncovered through investigation.

## Features

- **Interactive Investigation Tasks**: Players must actively investigate by running forensic tasks like dusting for fingerprints, analyzing fibers, checking databases, interviewing witnesses, and running blood analysis.
- **Time-Based Task System**: Each investigation task takes time to complete (simulated with delays), making the experience more realistic and engaging.
- **Evidence-Based Accusations**: Players must complete at least 2 investigation tasks before they can make an accusation, ensuring thoughtful detective work.
- **Action Log**: Track all investigation activities and evidence discoveries in real-time.
- **Detailed Suspect Profiles**: Each suspect and victim includes gender and ethnicity information for more realistic character building.
- **Progressive Web App (PWA)**: Install the app on your device and play offline.

## How to Play

1. Click "Start Case" to generate a new murder mystery.
2. Review the case details: victim information, location, suspected weapon, and possible motive.
3. **Run Investigation Tasks**: Click on investigation tasks to execute them. Each task takes a few seconds and reveals evidence.
4. **Review Evidence**: As you complete tasks, clues will be revealed in the Clues section and logged in the Action Log.
5. **Make Your Accusation**: Once you've gathered enough evidence (minimum 2 tasks), click "Accuse" on the suspect you believe is guilty.
6. The game will reveal whether you solved the case!

## Design Notes

- Colour scheme: beige/old paper + blood red accents.
- Title uses a typewriter style font (Special Elite).
- Start button styled to look like dripping blood.
- Uses free photos from Unsplash (see attributions below).

## PWA Support

This app is a Progressive Web App (PWA) and can be installed on your device:

1. **On Desktop**: Visit the site in Chrome/Edge and look for the install icon in the address bar.
2. **On Mobile**: Visit the site and use "Add to Home Screen" from your browser menu.
3. **Offline Support**: Once installed, the app works offline (though new cases require network for images).

**To Update PWA**: If you've previously installed the app and need to update to the latest version:
1. Uninstall the current PWA from your device
2. Clear browser cache for the site
3. Revisit the site and reinstall the PWA

## Deployment

### Deploy to Vercel:
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
