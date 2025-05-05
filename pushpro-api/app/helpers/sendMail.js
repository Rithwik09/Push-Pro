require("dotenv").config();
const { createTransport } = require("nodemailer");
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const testPhoneNumber = process.env.TEST_PHONE_NUMBER;

if (!accountSid || !authToken || !testPhoneNumber) {
  console.error("Twilio credentials not provided.");
}

const createEmailTransporter = () => {
  return createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, message, body, attachments }) => {
  try {
    const transporter = createEmailTransporter();
    let mailOptions = {
      from: process.env.MAIL_USER,
      to: to,
      subject: subject,
      text: message,
      html: body,
      attachments: attachments
    };
    let info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.message.includes("message exceeded max message size")) {
      console.error("Error sending email:", error);
    }
    console.error("Error sending email:", error);
  }
};

const sendSms = async (phone, message) => {
  const client = twilio(accountSid, authToken);
  phone = testPhoneNumber;
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phone
    });
    return { phone, status: "sent", sid: response.sid };
  } catch (error) {
    console.error(`Error sending SMS to ${phone}:`, error.message);
    throw new Error({ phone, status: "failed", error: error.message });
  }
};

module.exports = { sendEmail, sendSms };
