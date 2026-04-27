# Security Spec: Dreamwaker

## Data Invariants
1. A transaction MUST belong to an existing user.
2. SATS balance cannot be negative.
3. Steps tracked must have a valid timestamp and cannot be futuristic.
4. Users cannot modify other users' balances or transaction history.
5. Leaderboard entries are derived from user stats; users cannot directly write to total leaderboard stats without proper validation.

## Dirty Dozen Payloads
1. Attempt to add 1,000,000 coins to own balance via direct client update.
2. Attempt to read another user's transaction history.
3. Attempt to delete a withdrawal transaction once it's marked "pending".
4. Attempt to write a transaction with a fake timestamp.
5. Attempt to create a user profile with `isVerified: true` as a non-admin.

## Firestore Rules Drafting
We use a Master Gate pattern.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isAdmin() { return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid)); }

    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) && request.resource.data.isVerified == false;
      allow update: if isOwner(userId) && (
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['dailySteps', 'totalSteps', 'lastStepUpdate'])
      );
    }
    
    match /users/{userId}/transactions/{txId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId); // Further validation in isValidTransaction
    }
  }
}
```
