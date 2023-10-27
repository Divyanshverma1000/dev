const express = require('express');
const router = express.Router();
const passport = require('passport'); 
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs'); // Import the file system module
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

require('../config');
const ResetToken = require('../models/ResetToken');
require('./passport-config'); 
const apiKeyValidation = require('./apikeyValidation');
const User = require('../models/User'); 


// router.use(apiKeyValidation);

router.post('/register',apiKeyValidation ,async (req, res) => {

  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user instance
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  // Save the new user to the database
  try {
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});



router.post('/login',apiKeyValidation, (req, res, next) => {
  // Use Passport.js to authenticate the user
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Authentication failed
      return res.status(401).json({ message: 'Authentication failed' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Authentication succeeded, return user data or a success message
      return res.json({ user });
    });
  })(req, res, next);
});

router.get('/logout',apiKeyValidation ,(req, res) => {
  // req.logout(); // Log out the user
  req.logout(function(err) {
    // This is the callback function
    if (err) {
      // Handle the error, e.g., by sending an error response
      res.status(500).json({ message: 'Error logging out' });
    } else {
      // User has been logged out, send a success response
      res.json({ message: 'Logged out successfully' });
    }
  });
  
  // res.json({ message: 'Logged out successfully' });
});



module.exports = router;


// /auth
//     POST /auth/register - Register a new user
//     POST /auth/login - User login
//     POST /auth/logout - User logout
//     POST /auth/forgot-password - Send a password reset email
//     POST /auth/reset-password - Reset user password

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'gotoappservice@gmail.com', 
    pass: process.env.GMAIL_PASS, 
  },
});

const resetPasswordTemplate = fs.readFileSync(
  path.resolve(__dirname, '../emailTemplates/resetPassword.html'),
  'utf8'
);

router.post('/forgot-password', apiKeyValidation,async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send('User not found');
  }

  const resetToken = generateResetToken();

  saveResetToken(email, resetToken);

  const resetPasswordLink = `https://localhost:3000/auth/reset-password/${resetToken}`;

  const mailOptions = {
    from: 'gotoappservice@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: resetPasswordTemplate.replace('{{resetPasswordLink}}', resetPasswordLink),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent:', info.response);
      res.status(200).send('Password reset email sent successfully');
    }
  });
});


router.get('/reset-success', (req, res) => {
  // Render the 'reset-success' EJS template
  res.render('reset-success');
});

router.get('/reset-password/:token', async (req, res) => {
  try {
    const resetToken = req.params.token;

    // Find the reset token in your resetTokens collection
    const resetTokenDocument = await ResetToken.findOne({ token: resetToken });

    if (!resetTokenDocument) {
      return res.status(404).send('Reset token not found');
    }

    // Now that you have the resetTokenDocument, you can access the associated user's _id
    const emailId = resetTokenDocument.email;

    // Find the user based on the _id in the User collection
    // const user = await User.findById(emailId);
    const user = await User.findOne({ email: emailId });
    // const email = user.email
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Render the reset-password page with the user's email
    res.render('reset-password', { email:emailId , token: resetToken});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error finding user');
  }
});



router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (await isValidResetToken(email, token)) {
    await updatePassword(email, newPassword);
    await removeResetToken(email, token);
    // res.status(200).send('Password reset successfully');
    res.redirect('/auth/reset-success');
  } else {
    res.status(400).send('Invalid or expired reset token');
  }
});

module.exports = router;





function generateResetToken() {
  return crypto.randomBytes(20).toString('hex');
}

async function saveResetToken(email, resetToken) {
  // Calculate the token's expiration date (e.g., 1 hour from now)
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 1);

  // Create a new ResetToken document
  const resetTokenDoc = new ResetToken({
    email: email,
    token: resetToken,
    expirationDate: expirationDate,
  });

  // Save the document to the database
  await resetTokenDoc.save();
}


async function isValidResetToken(email, resetToken) {
  console.log(email);
  console.log(resetToken);
  const resetTokenDoc = await ResetToken.findOne({email: email,token: resetToken });
  console.log(resetTokenDoc);
  if (!resetTokenDoc|| resetTokenDoc.expirationDate < new Date() ) {
    // 
    return false; // Token is invalid or expired
  }
  return true;
}

async function updatePassword(email, newPassword) {
  // Hash the new password (use bcrypt or another hashing library)
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update the user's password in the database
  await User.updateOne({email: email }, { password: hashedPassword });
}

async function removeResetToken(email, resetToken) {
  await ResetToken.deleteOne({ email: email, token: resetToken });
}
