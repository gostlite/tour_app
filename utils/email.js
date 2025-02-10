const nodeMailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `John Adeleke <${process.env.GMAIL_USERNAME}>`;
  }
  newTransport() {
    return nodeMailer.createTransport({
      service: 'Gmail', //except you are using gmail
      host: process.env.GMAIL_HOST,
      port: process.env.GMAIL_PORT,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    //1)Render html based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //2) Define email options

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3) CREATE AN EMAIL TRANSPORT

    await this.newTransport().sendMail(mailOptions);
  }
  //4) Send the actual email
  async sendWelcomeMessage() {
    await this.send('welcome', 'Thanks for signing up with us ata Natours');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token is only valid for (10 mins)'
    );
  }
};
