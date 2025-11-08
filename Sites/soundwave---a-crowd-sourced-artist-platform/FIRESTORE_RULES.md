# SoundWave Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // SoundWave Users Collection
    match /soundwave_users/{userId} {
      allow read: if true; // Public read for artist profiles
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // SoundWave Tracks Collection
    match /soundwave_tracks/{trackId} {
      allow read: if true; // Public read for music discovery
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.artistId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.artistId;
    }
    
    // SoundWave Posts Collection (Community)
    match /soundwave_posts/{postId} {
      allow read: if true; // Public read for community posts
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.authorId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
    
    // SoundWave Comments Collection
    match /soundwave_comments/{commentId} {
      allow read: if true; // Public read for all comments
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.authorId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
    
    // SoundWave Labels Collection
    match /soundwave_labels/{labelId} {
      allow read: if true; // Public read for label discovery
      allow write: if request.auth != null; // Allow authenticated users to create/edit labels
    }
    
    // SoundWave Playlists Collection
    match /soundwave_playlists/{playlistId} {
      allow read: if true; // Public read for community playlists
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.curatorId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.curatorId;
    }
    
    // SoundWave Masterclasses Collection
    match /soundwave_masterclasses/{masterclassId} {
      allow read: if true; // Public read for course discovery
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.instructorId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.instructorId;
    }
    
    // SoundWave Tutorials Collection
    match /soundwave_tutorials/{tutorialId} {
      allow read: if true; // Public read for tutorial discovery
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.instructorId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.instructorId;
    }
    
    // SoundWave Sample Packs Collection
    match /soundwave_sample_packs/{packId} {
      allow read: if true; // Public read for sample pack discovery
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.creatorId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.creatorId;
    }
    
    // SoundWave Global Events Collection
    match /soundwave_global_events/{eventId} {
      allow read: if true; // Public read for global feed
      allow create: if request.auth != null; // Any authenticated user can create events
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
    
    // Private user data (messages, purchases, etc.)
    match /soundwave_private/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /purchases/{purchaseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // User avatars
    match /users/{userId}/avatar/{allPaths=**} {
      allow read: if true; // Public read for avatars
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Track audio files
    match /tracks/{trackId}/audio/{allPaths=**} {
      allow read: if true; // Public read for music streaming
      allow write: if request.auth != null; // TODO: Add track ownership check
    }
    
    // Track cover art
    match /tracks/{trackId}/cover/{allPaths=**} {
      allow read: if true; // Public read for cover art
      allow write: if request.auth != null; // TODO: Add track ownership check
    }
    
    // Label assets
    match /labels/{labelId}/{allPaths=**} {
      allow read: if true; // Public read for label assets
      allow write: if request.auth != null; // TODO: Add label admin check
    }
    
    // Sample pack files
    match /sample-packs/{packId}/{allPaths=**} {
      allow read: if request.auth != null; // Require auth for sample downloads
      allow write: if request.auth != null; // TODO: Add ownership check
    }
  }
}
```

## Implementation Notes

1. **Public Content**: Most content (tracks, posts, user profiles) is publicly readable to enable music discovery and community features.

2. **Authentication Required**: All write operations require authentication.

3. **Ownership Protection**: Users can only edit content they created (tracks, posts, comments).

4. **Private Data**: Personal messages and purchase history are strictly private.

5. **File Access**: Audio and images are publicly accessible, but sample pack downloads require authentication.

## Security Considerations

- Implement rate limiting at the application level
- Add content moderation for user-generated content
- Consider implementing role-based access for label administrators
- Add validation rules for data structure and content length
- Implement spam protection for comments and posts