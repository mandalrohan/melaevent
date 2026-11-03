# melaevent – Event Management Website

A responsive event discovery and registration website built for the **K Explore Web Designing** task.

**Developed by:** Rohan Mandal

**Live site:** https://mandalrohan.github.io/melaevent/
**Repository:** https://github.com/mandalrohan/melaevent

## Features
- Hero section with a live countdown to 1 January
- Event cards with name, date, time, venue, custom illustration and short description
- Search by name, venue, category or description, plus category filter chips
- Event details dialog with a seat counter and registration form
- Form validation in JavaScript (name, email, 10-digit phone, event) with inline error messages
- Confirmation message after a successful registration
- Duplicate-registration and sold-out checks
- **Bonus:** dark/light mode (remembers your choice), countdown timer, animations, and Local Storage registration management (view and cancel your registrations)
- Responsive on mobile, tablet and desktop; keyboard accessible; respects reduced-motion settings

## Tech stack
HTML5, CSS3 (custom properties, Grid, Flexbox) and vanilla JavaScript. No build step or dependencies.

## Project structure
```
index.html
css/style.css
js/script.js
images/   (one SVG illustration per event)
README.md
```

## How it works
- `EVENTS` in `js/script.js` holds the event data. Events have fixed dates between November 2026 and 1 January 2027, matching the countdown. Edit this array to add your own events.
- `renderGrid()` filters the array by the active category and search text, then redraws the cards.
- The registration form is validated with the `rules` object. Errors show on blur and on submit, and focus moves to the first invalid field.
- Registrations are stored in `localStorage` under `melaevent.regs`; the theme is stored under `melaevent.theme`.
- The countdown updates every second using `Date.now()`.

## Run locally
Open `index.html` in a browser, or run `npx serve .` / the VS Code Live Server extension.

## Deployment (GitHub Pages)
1. Push the project to a GitHub repository.
2. Go to **Settings → Pages**, set the source to the `main` branch and `/ (root)`, then save.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

Netlify and Vercel also work: import the repo and deploy with no build command.
