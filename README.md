# Smart Chore Roster

A household chore roster built with React, Vite, Firebase Authentication, and Cloud Firestore. Sign in with the same email and password on each device to access the same live chore data.

## Firebase setup

1. Create a Firebase project and register a Web app in the Firebase console.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. Create a **Cloud Firestore** database.
4. Copy `.env.example` to `.env.local` and fill in the Firebase Web app values:

   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   These are Firebase client configuration values, not service-account credentials. Never put a Firebase Admin SDK key in the client app.

5. Publish the rules in `firestore.rules` using the Firestore Rules tab in the Firebase console, or run `firebase deploy --only firestore:rules` from a machine with the Firebase CLI authenticated to the project.
6. Start the app:

   ```sh
   npm install
   npm run dev
   ```

Each signed-in Firebase user can read and write only their own `/users/{uid}` document. Updates are saved to Firestore and synchronized live to other signed-in devices. Existing local accounts can sign up with the same email/password; if the matching account exists on the current device and has no cloud record yet, its chore state is migrated once after authentication.

## Other commands

```sh
npm test
npm run lint
npm run build
```
