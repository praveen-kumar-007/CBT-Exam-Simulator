# CBT Exam Frontend

This frontend is now connected to the backend API for:

- Student signup and login
- Loading sections and MCQ questions from MongoDB
- Submitting exam answers to backend
- Keeping score hidden from students (admin-only visibility)
- Auto-submit on repeated anti-cheat violations
- Tracking and sending: cheating attempts, termination remark, first-choice vs final-choice interactions, and total option changes
- Rendering responsive behavior insights for students and admins
- Dedicated admin Insights page with data-driven Pie, Bar, and Line charts

Admin routes are React SPA routes:

- `/admin/login`
- `/admin/signup`
- `/admin/dashboard`

## Run Locally

Prerequisites:

- Node.js
- Backend server running from `backend CBT`

1. Install dependencies:

`npm install`

2. Create `.env` from `.env.example` and set values:

`VITE_API_BASE_URL=http://localhost:5000`

3. Start frontend:

`npm run dev`

4. Start backend in parallel:

`cd ../backend CBT && npm run dev`

## Deployment (Frontend)

1. Build:

`npm run build`

2. Deploy `dist` to your static host (Vercel/Netlify/etc.).

3. Set environment variable on host:

`VITE_API_BASE_URL=https://your-backend-domain`

4. Ensure SPA rewrite is enabled for all paths to `index.html`.

- For Vercel, `vercel.json` is already added.

5. Verify admin routes after deploy:

- `/admin/login`
- `/admin/signup`
- `/admin/dashboard`

## PWA (Install Like App)

- PWA is enabled with `vite-plugin-pwa`.
- Build output includes `manifest.webmanifest` and a generated service worker.
- Install prompt appears in supported browsers (Chrome/Edge mobile and desktop) after visiting the deployed HTTPS site.

To test locally:

1. Build and preview:

`npm run build && npm run preview`

2. Open the preview URL in Chrome/Edge.

3. Use browser menu: `Install app` or `Add to Home screen`.
