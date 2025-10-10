const admin = require('firebase-admin');

// 1. Get the raw JSON string from the environment variable
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  console.error("FATAL ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Deployment will fail.");
  process.exit(1);
}

// 2. CRITICAL FIX: Remove all common whitespace (newlines, tabs, etc.) 
// that might break JSON parsing when read from environment variables.
// The private key itself MUST still be handled as a string within the object.
const cleanedJsonString = serviceAccountJson
  // First, ensure all JSON-required newlines (\n) within the private key are properly represented 
  // with a literal backslash and 'n' (\n), assuming Render might have improperly inserted them.
  .replace(/\\n/g, '\n') 
  // Next, strip any excess, invisible whitespace/control characters (like extra carriage returns, tabs, etc.)
  .replace(/[\r\t\f]/gm, "") 
  // Finally, trim any leading/trailing spaces outside the JSON object itself.
  .trim();

let serviceAccount;
try {
  // Parse the cleaned string
  serviceAccount = JSON.parse(cleanedJsonString);
} catch (error) {
  console.error("FATAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string. Check your environment variable syntax.");
  console.log("Error details:", error.message);
  // Log the position of the error to help pinpoint the issue
  console.log(`JSON parsing failed near position ${error.message.match(/at position (\d+)/)?.[1] || 'unknown'}.`);
  process.exit(1);
}

// 3. Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
