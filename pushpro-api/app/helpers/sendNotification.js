require("dotenv").config();
const twilio = require("twilio");
const { createTransport } = require("nodemailer");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const mailHost = process.env.MAIL_HOST;
const mailPort = process.env.MAIL_PORT;
const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;

if (!accountSid || !authToken) {
  console.error("Twilio credentials not provided.");
  process.exit(1);
}

if (!mailHost || !mailPort || !mailUser || !mailPass) {
  console.error("Mail server credentials not provided.");
  process.exit(1);
}

const sendSms = async (phones, message) => {
  const client = twilio(accountSid, authToken);
  const promises = phones.map(async (phone) => {
    try {
      const response = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: phone
      });
      return { phone, status: "sent", sid: response.sid };
    } catch (error) {
      console.error(`Error sending SMS to ${phone}:`, error.message);
      return { phone, status: "failed", error: error.message };
    }
  });
  return Promise.all(promises);
};

const sendEmail = (
  to,
  cc,
  bcc,
  subject,
  textMessage,
  htmlBody,
  attachments
) => {
  const transporter = createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailPort,
    auth: {
      user: mailUser,
      pass: mailPass
    }
  });

  const mailOptions = {
    from: mailUser,
    to,
    cc,
    bcc,
    subject,
    text: textMessage,
    html: htmlBody,
    attachments: attachments
      ? Array.isArray(attachments)
        ? attachments
        : [attachments]
      : []
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return reject(error);
      }
      resolve(info);
    });
  });
};

module.exports = { sendSms, sendEmail };
