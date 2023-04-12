const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  resetToken: String,
  resetTokenExpiration: Date
});

// Define user model
const User = mongoose.model('User', userSchema);

// Parse request body
app.use(bodyParser.urlencoded({ extended: false }));

// Serve HTML file for user login
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Handle user login form submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }
    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password');
    }
    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error logging in user');
  }
});

// Serve HTML file for forgot password
app.get('/forgot-password', (req, res) => {
  res.sendFile(__dirname + '/forgot-password.html');
});

// Handle forgot password form submission
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body});
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Email not found');
    }
    // Generate reset token
    const token = uuidv4();
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();
    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_password'
      }
    });
    const mailOptions = ({
      from: 'your_email@gmail.com',
        to: email});
  }
  
