const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  // 🌟 MANDATORY CHANGE 1: Use Port 465 🌟
  port: 465, 
  // 🌟 MANDATORY CHANGE 2: Set secure to TRUE for Port 465 🌟
  secure: true, // true for port 465, false for other ports (like 587)
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  connectionTimeout: 30000, // Keep these debug settings for now
  socketTimeout: 10000,
});

// ... rest of emailService.js (including transporter.verify and sendThankYouEmail)
// ... (Your sendThankYouEmail function remains the same)
// 🌟 CRITICAL: Verify Transporter Connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error("❌ Nodemailer Transporter Connection Failed:", error.message);
    console.error(`
      ⚠️ CRITICAL EMAIL WARNING ⚠️
      User: ${EMAIL_USER ? EMAIL_USER.replace(/@.*$/, '@***.com') : 'NOT LOADED'}
      Error: ${error.code} (EAUTH or ECONNREFUSED are common)
      Action: If EAUTH/Invalid Login, the App Password is wrong or not loaded.
    `);
  } else {
    console.log("✅ Server is ready to take messages (SMTP verified)");
  }
});


const sendThankYouEmail = async (donor) => {
  const { donorName, contactEmail, itemToFulfill } = donor;

  console.log("📧 Attempting to send email to:", contactEmail, "for item:", itemToFulfill); 
  
  if (!contactEmail || !EMAIL_USER) {
    console.error("❌ Email cannot be sent: Contact Email or Sender User is missing.");
    return;
  }

  const mailOptions = {
    from: `"HelpOrphan" <${EMAIL_USER}>`,
    to: contactEmail,
    subject: "Thank You for Your Generosity! 💖",
    // ... (HTML content unchanged) ...
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; padding: 25px; border-radius: 10px; border-top: 5px solid #00c497; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #00c497;">Hi ${donorName},</h2>
          <p style="font-size: 16px; color: #333;">Thank you for committing to donate:</p>
          <p style="font-size: 20px; font-weight: bold; color: #333; background-color: #e6fff7; padding: 10px; border-radius: 5px; text-align: center;">
            ${itemToFulfill}
          </p>
          <p style="font-size: 16px; color: #333;">Your support makes a real, tangible difference in the lives of the children. We will be in touch shortly with next steps for dropping off or delivering the item.</p>
          <p style="font-size: 16px; color: #333; margin-top: 20px;">Stay amazing! 🌟</p>
          <p style="font-size: 14px; color: #666; margin-top: 5px;">- The HelpOrphan Team</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    // Log the specific Nodemailer error code
    console.error("❌ Failed to send email (Nodemailer error):", err.message, "Code:", err.code);
    throw err; 
  }
};


module.exports = { sendThankYouEmail };