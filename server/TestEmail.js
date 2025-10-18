require('dotenv').config(); // Load .env variables
const { sendThankYouEmail } = require('./emailService');

const testDonor = {
  donorName: "Veda vathi",
  contactEmail: "kanugulavedavathi15@gmail.com", // Replace with your personal email
  itemCommitted: "Test Item",
};

sendThankYouEmail(testDonor)
  .then(() => console.log("✅ Test email sent successfully!"))
  .catch((err) => console.error("❌ Error sending test email:", err));
