const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define complaint schema
const complaintSchema = new mongoose.Schema({
  description: String,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Define complaint model
const Complaint = mongoose.model('Complaint', complaintSchema);

// Parse request body
app.use(bodyParser.urlencoded({ extended: false }));

// Serve HTML file for complaint submission
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/complaint-form.html');
});

// Handle complaint form submission
app.post('/complaints', async (req, res) => {
  const { description } = req.body;
  try {
    // Determine complaint severity based on description length
    let severity = 'low';
    if (description.length >= 100 && description.length < 500) {
      severity = 'medium';
    } else if (description.length >= 500) {
      severity = 'high';
    }
    // Create new complaint
    const complaint = new Complaint({
      description,
      severity
    });
    await complaint.save();
    res.send('Complaint submitted successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error submitting complaint');
  }
});

// Start server
app.listen(3000, () => console.log('Server started on port 3000'));

