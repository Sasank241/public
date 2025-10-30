// models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: String, required: true },
  contact: { type: String, required: true },
  desc: { type: String, required: true },
  location: { type: String, required: true },
  requested: { type: Boolean, default: false },
  requestedBy: { type: String, default: null }, // optional: who requested
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);
