# Firestore Security Rules for Portal UI

These rules allow:
- Each authenticated user to manage their own app data under `users/{uid}/apps/{appId}/...`
- A shared, collaborative namespace for Temple (`apps/{appId}/...`) where ANY authenticated user can read & write the schedule and DJ pool.

Publish these in Firebase Console → Build → Firestore Database → Rules.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 1) Per-user private namespace
    match /users/{userId}/apps/{appId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 2) Shared app namespace (Temple)
    //    All authenticated users may read & write.
    match /apps/{appId}/{document=**} {
      allow read, write: if request.auth != null;
    }

    // 3) (Optional) Public read of published schedules
    // match /apps/{appId}/schedule/{docId} {
    //   allow read: if true;            // public
    //   allow write: if request.auth != null; // editors must be signed in
    // }
  }
}
```

Notes:
- If you prefer per-user isolation only, disable the shared block and set the app paths back to `users/{uid}/apps/{appId}` in `Sites/TempleDjSpot/App.tsx`.
- After publishing rules, reload https://portal-ui.com/Spaces/TempleDjs/ and click “Create Base Schedule” once more if needed.
- If you see `permission-denied`, verify that you’re logged in and that these rules are active (click “Publish” in the Firebase console).
