const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // or your email provider
  port: 587,
  secure: false, // true for 465
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email app password
  },
});

const sendThankYouEmail = async (donor) => {
  const { donorName, contactEmail, itemCommitted } = donor;

  const mailOptions = {
    from: `"HelpOrphan" <${process.env.EMAIL_USER}>`,
    to: contactEmail,
    subject: "Thank You for Your Generosity! 💖",
    html: `
      <h2>Hi ${donorName},</h2>
      <p>Thank you for donating <strong>${itemCommitted}</strong> to our wishlist!</p>
      <p>Your support makes a real difference in the lives of orphans.</p>
      <p>Stay amazing! 🌟</p>
      <p>- The HelpOrphan Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendThankYouEmail };
