const admin = require('firebase-admin');

// 1. Get the encoded Base64 string from the environment variable
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountBase64) {
  console.error("FATAL ERROR: FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set.");
  process.exit(1);
}

// 2. Decode the Base64 string back into a JSON string
let serviceAccount;
try {
  // Create a Buffer from the Base64 string
  const jsonBuffer = Buffer.from(serviceAccountBase64, 'base64');
  
  // Convert the Buffer to a standard UTF-8 string
  const jsonString = jsonBuffer.toString('utf8');
  
  // Parse the JSON string into the service account object
  serviceAccount = JSON.parse(jsonString);

} catch (error) {
  // Log the full error object for complete debugging information
  console.error("FATAL ERROR: Failed to decode or parse FIREBASE_SERVICE_ACCOUNT_BASE64.", error);
  process.exit(1);
}

// 3. Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
