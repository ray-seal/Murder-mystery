```markdown
# Case Files — Murder Mystery (Static Web App / PWA)

This repo contains a small randomized murder-mystery game. The app is PWA-ready (manifest + service worker) and can be installed as "Case Files".

## Features

- **Open/Closed Cases Tabs**: Switch between active and solved cases
- **Solved Counter**: Track how many cases you've solved
- **Game Progress Saving**: Auto-saves your notes and suspect selections
- **LocalStorage Persistence**: Your case state persists across browser sessions

## Adding Custom Cases

You can add custom case files in two ways:

1. **Single case at root**: Place a `case.json` file in the root directory
2. **Multiple cases in /cases/ folder**: Add JSON files to the `/cases/` directory

### Case Template

Copy `/cases/case-template.json` as a starting point for your custom cases. The template includes:

```json
{
  "id": "example-1",
  "title": "Example Case",
  "victim": {
    "name": "",
    "age": "",
    "occupation": "",
    "last_known_location": ""
  },
  "suspects": [],
  "clues": [],
  "timeline": [],
  "evidence": []
}
```

### Required Fields

- `id` or `case_id`: Unique identifier for the case
- `title`: Display name for the case

### Optional Fields

- `summary`: Case description
- `victim`: Object with victim details
- `suspects`: Array of suspect objects
- `timeline`: Array of timeline events
- `initial_clues` or `clues`: Array of clues
- `evidence`: Array of evidence items
- `status`: "open" or "closed" (defaults to "open")

## localStorage Keys

The app uses the following localStorage keys:

- `casefiles_state`: Main app state including:
  - `cases`: Array of case metadata
  - `solvedCount`: Number of closed cases
  - `lastOpenedCaseId`: ID of last viewed case
  - `currentTab`: "open" or "closed"

- `casefiles_progress_{caseId}`: Per-case saved progress including:
  - `caseId`: The case identifier
  - `selectedSuspect`: Currently selected suspect ID
  - `playerNotes`: User's typed notes
  - `timestamp`: When progress was last saved

## Save Game Behavior

- **Auto-save**: Progress is automatically saved when:
  - You type notes (after 2 seconds of inactivity)
  - You select a suspect
  - You navigate back to the cases list

- **Manual save**: Click the "Save Game" button to save immediately

- **Loading saved progress**: When you open a case with saved progress, your notes and suspect selection are restored

## Migration Notes

If you're upgrading from an earlier version:
- The solved counter will start at 0 since there's no previous localStorage data
- Existing cases will be detected and added to the Open Cases tab
- You can mark cases as solved using the "Mark Case as Solved" button

## Deployment

- Deploy as a static site (Vercel, Netlify, GitHub Pages)
- For PWA install support, ensure icon.svg and manifest.webmanifest are served from the site root

Images: Unsplash (free to use under Unsplash license) — attribution in the app.

```

