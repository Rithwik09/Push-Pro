require("dotenv").config();
const bcrypt = require("bcrypt");
const { generateOtp } = require("./generateOtp");
const { getToken } = require("./jwtHelpers");
const { sendEmail } = require("./emailSend");

const verifyEmailMessage = "Verify Your Email by Entering OTP";

exports.sendOtpHelper = async (payload = {}, message = verifyEmailMessage) => {
  const otp = generateOtp(process.env.OTP_LENGTH || 6);
  const hashOtp = await bcrypt.hash(otp, process.env.SALT_ROUNDS || 10);
  payload.hashOtp = hashOtp;
  const token = await getToken(payload);
  sendEmail({
    to: payload.email_address,
    subject: message,
    html: `<h1>${otp}</h1>`
  });
  return token;
};
