const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

// Define user model
const User = mongoose.model('User', userSchema);

// Parse request body
app.use(bodyParser.urlencoded({ extended: false }));

// Serve HTML file for user registration
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle user registration form submission
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Create new user
    const user = new User({ name, email, password });
    // Save user to database
    await user.save();
    // Redirect to success page
    res.redirect('/success');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error registering user');
  }
});

// Serve success page after user registration
app.get('/success', (req, res) => {
  res.send('User registered successfully');
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
