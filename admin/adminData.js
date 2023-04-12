const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: Boolean
});

// Define user model
const User = mongoose.model('User', userSchema);

// Parse request body
app.use(bodyParser.urlencoded({ extended: false }));

// Configure session middleware
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Serve HTML file for admin login
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/admin-login.html');
});

// Handle admin login form submission
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('Invalid username or password');
    }
    // Check if user is an admin
    if (!user.isAdmin) {
      return res.status(401).send('Access denied');
    }
    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid username or password');
    }
    // Save user session
    req.session.user = user;
    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error logging in admin');
  }
});

// Serve HTML file for dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Access denied');
  }
  res.sendFile(__dirname + '/dashboard.html');
});

// Handle admin logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      res.status(500).send('Error logging out admin');
    } else {
      res.redirect('/');
    }
  });
});

// Start server
app.listen(3000, () => console.log('Server started on port 3000'));
