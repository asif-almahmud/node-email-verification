const nodemailer = require("nodemailer");

exports.generateOTP = () => {
  let otp = "";
  for (let i = 0; i <= 3; i++) {
    otp += Math.round(Math.random() * 9);
  }
  return otp;
};

exports.mailTransport = () => {
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io", // ! for real mail addresses we will have to use services like sendgrid
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  return transport;
};
