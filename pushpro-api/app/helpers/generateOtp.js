exports.generateOtp = (size = 6) => {
  const digites = "0123456789";
  let OTP = "";
  for (let i = 0; i < size; i++) {
    OTP += digites[Math.floor(Math.random() * 10)];
  }
  return OTP;
};
