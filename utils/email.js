const nodeMailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create a transporter
  const transporter = nodeMailer.createTransport({
    service: 'Gmail', //except you are using gmail
    host: process.env.GMAIL_HOST,
    port: process.env.GMAIL_PORT,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  //2) define email options,
  const mailOptions = {
    from: 'John Adeleke <dgcandxl@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3) send the email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
