require('dotenv').config(); // Load .env variables
const { sendThankYouEmail } = require('./emailService');

const testDonor = {donorName: 'Bhanuprasad', contactEmail: 'kanugulabhanu012@gmail.com', itemId: '68f380ece30d4392e0ce806a', itemToFulfill: 'bags'}

sendThankYouEmail(testDonor)
  .then(() => console.log("✅ Test email sent successfully!"))
  .catch((err) => console.error("❌ Error sending test email:", err));
