const nodemailer = require('nodemailer');

async function sendMail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'sanket@bombaydc.com , arpit@bombaydc.com', 
    subject: 'Weekly Playwright Execution Report',
    text: 'Please find attached Playwright HTML report.',
    attachments: [
      {
        filename: 'playwright-report.zip',
        path: './playwright-report.zip'
      }
    ]
  });

  console.log('Email sent successfully');
}

sendMail();