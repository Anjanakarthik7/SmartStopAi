/**
 * SmartStop AI — Elderly & Accessibility Assistance Module
 * Manages high-contrast aids, voice guidance relays, caregiver dispatch, and SOS pipeline
 */

const ElderlyAssist = (function () {
  const caregivers = [
    { id: 1, name: "Ramesh Kumar", relation: "Son", phone: "+91 98450 12345", isPrimary: true },
    { id: 2, name: "Priya Sharma", relation: "Daughter", phone: "+91 99001 67890", isPrimary: false },
    { id: 3, name: "Metro Station Master", relation: "Transit Official", phone: "Toll-Free 1800-425-12345", isPrimary: false }
  ];

  const milestones = [];

  function addMilestone(icon, title, details) {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    milestones.unshift({ icon, title, details, time });
    renderMilestones();
  }

  function renderMilestones() {
    const feed = document.getElementById('milestone-feed');
    if (!feed) return;

    if (milestones.length === 0) {
      feed.innerHTML = `
        <div class="milestone-item empty">
          <div class="ms-icon">🚇</div>
          <div class="ms-text">
            <div class="ms-title">Awaiting journey initialization</div>
            <div class="ms-time">Safe journey mode ready</div>
          </div>
        </div>
      `;
      return;
    }

    feed.innerHTML = milestones.slice(0, 8).map(m => `
      <div class="milestone-item">
        <div class="ms-icon">${m.icon}</div>
        <div class="ms-text">
          <div class="ms-title">${m.title}</div>
          <div class="ms-time">${m.details ? m.details + ' · ' : ''}${m.time}</div>
        </div>
      </div>
    `).join('');
  }

  function notifyCaregiver(contactName, destination, currentStation) {
    const target = caregivers.find(c => c.name.toLowerCase().includes(contactName.toLowerCase())) || { name: contactName, phone: "Registered Contact" };
    
    // Play subtle confirmation chime
    TransitAudio.playStationChime();
    
    addMilestone('📲', `Alert Dispatched: ${target.name}`, `Status: At ${currentStation || 'Transit'}, En route to ${destination || 'Destination'}`);
    
    return {
      recipient: target.name,
      phone: target.phone,
      message: `[SmartStop AI Alert] Passenger is currently at ${currentStation || 'Transit'} en-route to ${destination || 'Destination'}. All telemetry normal.`
    };
  }

  function triggerSOS(user, currentStation, line) {
    TransitAudio.playSOSTone();
    TransitAudio.vibrate([400, 150, 400, 150, 600]);

    const coords = TransitSensors.getGPSCoordinates(currentStation, line);
    addMilestone('🚨', 'EMERGENCY SOS BROADCAST', `Loc: ${coords.lat}N, ${coords.lon}E near ${currentStation}`);

    // High priority voice guidance
    TransitAudio.speak("Emergency distress signal sent. Driver and station control have been alerted to your coach. Help is arriving.", 0.9, true);

    return {
      timestamp: new Date().toLocaleTimeString('en-IN'),
      passenger: user,
      station: currentStation,
      coordinates: `${coords.lat}° N, ${coords.lon}° E`,
      status: "EMERGENCY_DISPATCHED"
    };
  }

  return {
    caregivers,
    addMilestone,
    renderMilestones,
    notifyCaregiver,
    triggerSOS
  };
})();

// Bind to window for global access
window.ElderlyAssist = ElderlyAssist;

