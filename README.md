# Smart Chore Roster

A household chore roster built with React, Vite, Firebase Authentication, and Cloud Firestore. Each flatmate signs in with their own account, then joins the same household to share one live chore roster across devices.

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

After signing in, create a household or join one with the 36-character invite code shared by a household member. New households start with an empty roster. All household members see and can update the same chores, assignments, completion statuses, and history in real time. The invite code is visible in the app and can be copied from the shared-household banner.

Firestore rules allow access only to authenticated household members, with the high-entropy invite code used to join. Each account can belong to one household.

## Other commands

```sh
npm test
npm run lint
npm run build
```
