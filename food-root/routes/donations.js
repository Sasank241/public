// routes/donations.js
const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

// Create donation (POST /api/donations)
router.post('/', async (req, res) => {
  try {
    const { donor, contact, desc, location } = req.body;
    if (!donor || !contact || !desc || !location) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const donation = new Donation({ donor, contact, desc, location });
    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all donations (GET /api/donations)
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request a donation (POST /api/donations/:id/request)
router.post('/:id/request', async (req, res) => {
  try {
    const id = req.params.id;
    // optional: accept requester info in body
    const { requester } = req.body || {};
    const donation = await Donation.findById(id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.requested) {
      return res.status(400).json({ message: 'Donation already requested' });
    }
    donation.requested = true;
    if (requester) donation.requestedBy = requester;
    await donation.save();
    res.json({ message: 'Request successful', donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optional: delete a donation (DELETE /api/donations/:id)
router.delete('/:id', async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json({ message: 'Deleted', donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
