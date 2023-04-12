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

// Serve complaints list to staff
app.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.render('complaints', { complaints });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error getting complaints');
  }
});

// Close a complaint
app.post('/complaints/:id/close', async (req, res) => {
  const { id } = req.params;
  try {
    const complaint = await Complaint.findById(id);
    complaint.status = 'closed';
    await complaint.save();
    res.redirect('/complaints');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error closing complaint');
  }
});

// Start server
app.listen(3000, () => console.log('Server started on port 3000'));
