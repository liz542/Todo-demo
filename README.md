# To-Do Demo (React + Firebase)

This is a small demo web app that implements the to-do list features requested:
- Mobile-friendly, simple UI (no dark mode)
- Google Login (Firebase Auth)
- Tasks with due dates, priority (High/Medium/Low)
- Recurring tasks (daily/weekly/monthly)
- File attachments (Firebase Storage)
- Push notifications (Firebase Cloud Messaging) with Dismiss and Snooze (5/10/30 min presets)
- Categories, customizable theme colors

## Setup (local testing)
1. Install Node.js (>=18) and npm.
2. cd todo-demo
3. Run `npm install`.
4. Create a Firebase project and enable Auth (Google), Firestore, Storage and Cloud Messaging.
5. Replace placeholders in `src/firebase.js` with your Firebase config.
6. For FCM push notifications: generate a VAPID pair in Firebase and paste the VAPID key where indicated.
7. Run locally: `npm run start` and open http://localhost:5173

## Deploy
You can deploy to Vercel (recommended) or Firebase Hosting.
