const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'alerts@childsafety.local',
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { sendMail };
