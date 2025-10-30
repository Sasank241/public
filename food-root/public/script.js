// script.js - frontend to call backend API
// Toggle between sections
function showSection(id) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
  if (id === 'receiverSection') loadDonations();
}

// Form submit -> POST to backend
const foodForm = document.getElementById('foodForm');
foodForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const donor = document.getElementById('donorName').value.trim();
  const contact = document.getElementById('contact').value.trim();
  const desc = document.getElementById('foodDesc').value.trim();
  const location = document.getElementById('location').value.trim();

  try {
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donor, contact, desc, location })
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Error: ' + (err.message || res.status));
      return;
    }
    await res.json();
    alert('✅ Donation posted successfully!');
    foodForm.reset();
    // Optionally, switch to receiver view to see it
    showSection('receiverSection');
  } catch (err) {
    console.error(err);
    alert('Network error');
  }
});

// Load donations from backend
async function loadDonations() {
  const foodList = document.getElementById('foodList');
  foodList.innerHTML = '';
  try {
    const res = await fetch('/api/donations');
    if (!res.ok) {
      foodList.innerHTML = '<p>Failed to load donations.</p>';
      return;
    }
    const donations = await res.json();
    if (!donations.length) {
      foodList.innerHTML = '<p>No donations available right now.</p>';
      return;
    }
    donations.forEach(d => {
      const div = document.createElement('div');
      div.classList.add('card');
      div.innerHTML = `
        <h3>${escapeHtml(d.desc)}</h3>
        <p><strong>Donor:</strong> ${escapeHtml(d.donor)}</p>
        <p><strong>Contact:</strong> ${escapeHtml(d.contact)}</p>
        <p><strong>Location:</strong> ${escapeHtml(d.location)}</p>
        <p><strong>Status:</strong> ${d.requested ? 'Requested' : 'Available'}</p>
        <button ${d.requested ? 'disabled' : ''} onclick="requestFood('${d._id}')">Request</button>
      `;
      foodList.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    foodList.innerHTML = '<p>Error loading donations.</p>';
  }
}

// Request food -> POST to /api/donations/:id/request
async function requestFood(id) {
  try {
    const res = await fetch(`/api/donations/${id}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requester: 'Receiver' }) // optionally pass requester info
    });
    const data = await res.json();
    if (!res.ok) {
      alert('Error: ' + (data.message || res.status));
      return;
    }
    alert(`🍛 You have requested: "${data.donation.desc}" from ${data.donation.donor}`);
    loadDonations();
  } catch (err) {
    console.error(err);
    alert('Network error');
  }
}

// small helper to avoid XSS when inserting text
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
