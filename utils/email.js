const nodemailer = require('nodemailer');
// const htmlTotext = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `HulumFurniture <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // Only on development

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

/*   // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlTotext.fromString(html),
    };
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  } */

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the HulumFurniture.com');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10  minutes)'
    );
  }
};

const sendEmail = async (options) => {
// 1) Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
// 2) Define the email options

const mailOptions = {
  from: 'Ell Solomon <ellon.solomon@gmail.com>',
  to: options.email,
  suject: options.subject,
  text: options.message,
  // html
};
// 3) Actually send the mail

await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
