# CBT Exam Frontend

This frontend is now connected to the backend API for:

- Student signup and login
- Loading sections and MCQ questions from MongoDB
- Submitting exam answers to backend
- Keeping score hidden from students (admin-only visibility)

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
