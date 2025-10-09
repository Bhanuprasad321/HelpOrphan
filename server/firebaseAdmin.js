const admin = require('firebase-admin');

// 1. Get the raw JSON string from the environment variable
// This environment variable MUST be set in the Render UI.
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  console.error("FATAL ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Deployment will fail.");
  // Exit to prevent the server from running without necessary authentication
  process.exit(1);
}

// 2. Parse the JSON string into an object
let serviceAccount;
try {
  // IMPORTANT: Replace all newline escape sequences (\\n) with actual newlines (\n) 
  // before parsing, as deployment environments often escape them when stored 
  // in an environment variable.
  const correctedJsonString = serviceAccountJson.replace(/\\n/g, '\n'); 
  serviceAccount = JSON.parse(correctedJsonString);
} catch (error) {
  console.error("FATAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string. Check your environment variable syntax.", error);
  process.exit(1);
}


// 3. Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
