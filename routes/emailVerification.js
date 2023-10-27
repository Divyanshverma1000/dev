const fs = require('fs');
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const router = express.Router();
require('../config');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Initialize the nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'gotoappservice@gmail.com', 
    pass: process.env.GMAIL_PASS, 
  },
});

// Define a route for sending email verification
// router.post('/send-verification', (req, res) => {
  router.post('/send-verification', (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  fs.readFile('emailTemplates/emailOTP.html', 'utf8', (err, template) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error reading email template');
      return;
    }

    const formattedTemplate = template.replace('{{verificationCode}}', verificationCode);

    const mailOptions = {
      from: 'gotoappservice@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: formattedTemplate,  // Use the HTML content here
      // attachments: [
      //   {
      //     filename: 'goto-logo.png', // Change to your logo's filename
      //     path: 'icons/goto_logo_launcher.png', // Change to the actual path of your logo file
      //     cid: 'hello', // CID(content id ) reference used in the template
      //   },
      // ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send('Email sent successfully');
      }
    });
  });
});

module.exports = router;
