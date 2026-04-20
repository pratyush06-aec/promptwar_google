const admin = require('firebase-admin');

// Initialize Firebase Admin using Application Default Credentials.
// In Google Cloud Run, this completely automatically uses the service account attached to the environment.
// For local dev, make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable.
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

module.exports = { admin, db };
