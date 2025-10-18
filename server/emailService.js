const { Resend } = require('resend');
require('dotenv').config();

// Ensure both ENV variables are available
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.EMAIL_USER; 

if (!RESEND_API_KEY) {
    console.error("❌ CRITICAL: RESEND_API_KEY not loaded. Check Render environment variables.");
}
if (!SENDER_EMAIL) {
    console.error("❌ CRITICAL: SENDER_EMAIL (EMAIL_USER) not loaded.");
}

const resend = new Resend(RESEND_API_KEY);

/**
 * Sends a thank you email using the Resend API.
 * @param {object} donor - Donor information including name, email, and item committed.
 */
const sendThankYouEmail = async (donor) => {
  const { donorName, contactEmail, itemToFulfill } = donor;

  // 1. Construct the FROM address: Required format is 'Name <email@domain.com>'
  // NOTE: This email MUST be verified in your Resend account, or you must use 
  // 'onboarding@resend.dev' for testing.
  const fromAddress = SENDER_EMAIL 
    ? `HelpOrphan <${SENDER_EMAIL}>` 
    : 'HelpOrphan <onboarding@resend.dev>'; 

  // Skip sending if critical data is missing
  if (!contactEmail || !SENDER_EMAIL || !RESEND_API_KEY) {
      console.error("❌ Email skipped: Contact Email, Sender Email, or Resend API Key is missing.");
      return;
  }
  
  try {
    const response = await resend.emails.send({
      // ✅ CORRECTION 1: Must be in email format: 'Name <email@domain.com>'
      from: fromAddress, 
      // ✅ CORRECTION 2: The 'to' field must be an array of strings.
      to: [contactEmail], 
      subject: 'Thank You for Your Generosity! 💖',
      html: `
        <div style="font-family: Arial, sans-serif;">
            <h2>Hi ${donorName},</h2>
            <p>Thank you for committing to donate: <strong>${itemToFulfill}</strong> to our wishlist!</p>
            <p>Your support makes a real difference in the lives of the children.</p>
            <p>Stay amazing! 🌟</p>
            <p>- The HelpOrphan Team</p>
        </div>
      `,
    });

    // Check for a Resend error response
    if (response.error) {
        console.error("❌ Resend API Error:", response.error.message);
        throw new Error(`Resend API Error: ${response.error.message}`);
    }

    console.log('✅ Email sent via Resend. ID:', response.data.id);

  } catch (error) {
    console.error('❌ Failed to send email via Resend (Client Error):', error.message);
    // Rethrow error to be caught by the .catch in server.js
    throw error;
  }
};

module.exports = { sendThankYouEmail };