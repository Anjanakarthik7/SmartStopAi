/**
 * SmartStop AI — Central Application Coordinator & Journey Controller
 * Orchestrates views, state management, bidirectional route progression, and modular integration
 */

const App = (function () {
  // Application State
  const state = {
    user: localStorage.getItem('ss_user') || '',
    elderlyMode: localStorage.getItem('ss_elderly') === 'true',
    activeLine: 'Purple',
    history: JSON.parse(localStorage.getItem('ss_history') || JSON.stringify(METRO_DATA.seedHistory)),
    journey: {
      active: false,
      line: 'Purple',
      route: [],
      startIdx: -1,
      currentIdx: -1,
      targetIdx: -1,
      direction: 1, // +1 forward, -1 reverse
      srcName: '',
      destName: '',
      autoTimer: null
    },
    kpi: {
      onboard: 0,
      sos: 0,
      predictions: 0,
      stopsServed: 0
    }
  };

  /**
   * Initializes the application, sets up event listeners and restores persistent state
   */
  function init() {
    setupNavigation();
    setupForms();
    setupElderlyMode();
    setupSensors();

    // Check user session
    if (state.user) {
      applyUserSession(state.user);
    } else {
      showLoginModal();
    }

    // Initialize initial system logs
    DriverDashboard.logEvent("SmartStop AI Enterprise Suite initialised.", "success");
    DriverDashboard.logEvent("Namma Metro network data synchronized (Purple & Green lines).", "normal");
    DriverDashboard.logEvent("Edge sensor telemetry connected via ESP32 gateway.", "success");

    // Populate stations for passenger setup & driver PAX simulator
    populateLineOptions();
    populateDriverSimStops();
    updateKPIs();

    // Periodically update sensor telemetry samples
    setInterval(() => {
      TransitSensors.recordSample();
      TransitSensors.renderMiniGraph('count-graph');
    }, 4000);
  }

  // ─── Authentication & User Profile ──────────────────────────────
  function showLoginModal() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  function login(userName) {
    const name = (userName || document.getElementById('login-name')?.value || '').trim();
    if (!name) {
      showToast('Please enter your name to proceed', 'warning');
      return;
    }
    state.user = name;
    localStorage.setItem('ss_user', name);
    applyUserSession(name);

    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';

    showToast(`Welcome aboard, ${name}! AI assistant ready. 🚇`, 'success');
    DriverDashboard.logEvent(`Passenger "${name}" authenticated. Session initiated.`, 'success');

    // Run prediction if station already picked
    const srcSel = document.getElementById('src-sel');
    if (srcSel && srcSel.value) {
      triggerAIPrediction();
    }
  }

  function logout() {
    state.user = '';
    localStorage.removeItem('ss_user');
    document.getElementById('nav-name').textContent = 'Guest';
    document.getElementById('nav-avatar').textContent = '?';
    showLoginModal();
    showToast('Logged out of SmartStop session', 'info');
  }

  function applyUserSession(name) {
    const navName = document.getElementById('nav-name');
    const navAvatar = document.getElementById('nav-avatar');
    if (navName) navName.textContent = name;
    if (navAvatar) navAvatar.textContent = name.charAt(0).toUpperCase();

    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  // ─── View Routing ────────────────────────────────────────────────
  function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        const viewId = this.dataset.view;
        switchView(viewId, this);
      });
    });
  }

  function switchView(viewId, activeBtn) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.add('active');

    if (activeBtn) {
      activeBtn.classList.add('active');
    } else {
      const matchingBtn = document.querySelector(`.nav-tab[data-view="${viewId}"]`);
      if (matchingBtn) matchingBtn.classList.add('active');
    }

    // Hide login modal when navigating to administrative or informational tabs
    const overlay = document.getElementById('login-overlay');
    if (viewId !== 'passenger') {
      if (overlay) overlay.style.display = 'none';
    }

    if (viewId === 'driver') {
      DriverDashboard.renderDemandChart();
      DriverDashboard.renderLogs();
    } else if (viewId === 'sensor') {
      TransitSensors.renderMiniGraph('count-graph');
      updateSensorDisplay();
    } else if (viewId === 'elderly') {
      ElderlyAssist.renderMilestones();
    }
  }

  function closeLoginModal() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';
    if (!state.user) {
      state.user = 'Guest';
      applyUserSession('Guest');
      showToast('Continuing as Guest commuter', 'info');
    }
  }

  // ─── Station Setup & AI Triggering ──────────────────────────────
  function populateLineOptions() {
    const lineSel = document.getElementById('line-sel');
    if (!lineSel) return;

    lineSel.innerHTML = `
      <option value="Purple">🟣 Purple Line (Whitefield ↔ Challaghatta)</option>
      <option value="Green">🟢 Green Line (Madavara ↔ Silk Institute)</option>
    `;
    lineSel.value = state.activeLine;
    loadStationsForLine(state.activeLine);
  }

  function loadStationsForLine(line) {
    state.activeLine = line;
    const stations = STATIONS[line] || [];
    const srcSel = document.getElementById('src-sel');
    const destSel = document.getElementById('manual-sel');

    if (!srcSel) return;

    srcSel.innerHTML = '<option value="">— Select Boarding Station —</option>';
    if (destSel) destSel.innerHTML = '<option value="">— Select Destination —</option>';

    stations.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = st;
      srcSel.appendChild(opt);

      if (destSel) {
        const opt2 = document.createElement('option');
        opt2.value = st;
        opt2.textContent = st;
        destSel.appendChild(opt2);
      }
    });

    hideAIPredictionCard();
    hideManualCard();

    // Update hero stats stop count
    const stopsStat = document.getElementById('stat-stops');
    if (stopsStat) stopsStat.textContent = stations.length;
  }

  function triggerAIPrediction() {
    const line = state.activeLine;
    const origin = document.getElementById('src-sel')?.value;

    if (!line || !origin) {
      hideAIPredictionCard();
      return;
    }

    const prediction = SmartStopAI.predictDestination(state.user || 'Guest', line, origin, state.history);
    if (!prediction) return;

    // Display prediction in UI
    const aiBlock = document.getElementById('ai-block');
    const aiDestText = document.getElementById('ai-dest-text');
    const aiMetaText = document.getElementById('ai-meta-text');
    const aiConfLabel = document.getElementById('ai-conf-label');
    const aiConfFill = document.getElementById('ai-conf-fill');
    const aiAlts = document.getElementById('ai-alternatives');

    if (aiDestText) aiDestText.textContent = prediction.topDestination;
    if (aiMetaText) aiMetaText.textContent = prediction.rationale;
    if (aiConfLabel) aiConfLabel.textContent = `Confidence: ${prediction.confidence}% (Model: Bayesian + Flow)`;
    if (aiConfFill) {
      aiConfFill.style.width = '0%';
      setTimeout(() => {
        aiConfFill.style.width = `${prediction.confidence}%`;
      }, 50);
    }

    if (aiAlts && prediction.alternatives?.length) {
      aiAlts.innerHTML = `
        <div class="ai-alt-title">Alternative Inferences:</div>
        <div class="ai-alt-tags">
          ${prediction.alternatives.map(alt => `
            <button class="ai-alt-chip" onclick="App.selectAlternative('${alt.name}')">
              ${alt.name} <span class="alt-conf">${alt.confidence}%</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    if (aiBlock) aiBlock.style.display = 'block';
    hideManualCard();

    state.kpi.predictions++;
    updateKPIs();

    DriverDashboard.logEvent(`AI generated destination prediction for "${state.user}": ${prediction.topDestination} (${prediction.confidence}% confidence)`, 'success', 'ai');
  }

  function selectAlternative(destName) {
    const aiDestText = document.getElementById('ai-dest-text');
    if (aiDestText) aiDestText.textContent = destName;
    showToast(`Destination changed to ${destName}`, 'info');
  }

  function showManualSelect() {
    const aiBlock = document.getElementById('ai-block');
    const manualWrap = document.getElementById('manual-wrap');
    if (aiBlock) aiBlock.style.display = 'none';
    if (manualWrap) manualWrap.style.display = 'block';
  }

  function hideAIPredictionCard() {
    const aiBlock = document.getElementById('ai-block');
    if (aiBlock) aiBlock.style.display = 'none';
  }

  function hideManualCard() {
    const manualWrap = document.getElementById('manual-wrap');
    if (manualWrap) manualWrap.style.display = 'none';
  }

  // ─── Journey Initiation & Bidirectional Navigation ─────────────
  function confirmJourney(useAIPrediction = true) {
    const line = state.activeLine;
    const src = document.getElementById('src-sel')?.value;
    const dest = useAIPrediction 
      ? document.getElementById('ai-dest-text')?.textContent 
      : document.getElementById('manual-sel')?.value;

    if (!src || !dest || dest === '—' || src === dest) {
      showToast('Please pick distinct boarding and destination stations', 'warning');
      return;
    }

    const route = STATIONS[line] || [];
    const sIdx = route.indexOf(src);
    const dIdx = route.indexOf(dest);

    if (sIdx === -1 || dIdx === -1) {
      showToast('Station not recognized on the selected metro line', 'warning');
      return;
    }

    // CRITICAL: Determine direction of travel (+1 for forward, -1 for reverse!)
    const direction = dIdx > sIdx ? 1 : -1;
    const stopCount = Math.abs(dIdx - sIdx);

    state.journey = {
      active: true,
      line,
      route,
      startIdx: sIdx,
      currentIdx: sIdx,
      targetIdx: dIdx,
      direction,
      srcName: src,
      destName: dest,
      autoTimer: null
    };

    // Update fleet metrics & sensors
    DriverDashboard.recordDisembarkationDemand(dest, 1);
    TransitSensors.boardPassenger(1);
    state.kpi.onboard = TransitSensors.getPassengerCount();
    updateKPIs();

    // UI Updates
    document.getElementById('setup-form').style.display = 'none';
    document.getElementById('tracking-active').style.display = 'block';
    
    const mapCard = document.getElementById('map-card');
    if (mapCard) {
      mapCard.style.opacity = '1';
      mapCard.style.pointerEvents = 'auto';
    }

    const trackingDest = document.getElementById('tracking-dest');
    if (trackingDest) trackingDest.textContent = dest;

    const destDisplay = document.getElementById('dest-display');
    if (destDisplay) destDisplay.classList.add('locked');

    const trackingSub = document.getElementById('tracking-sub');
    if (trackingSub) trackingSub.textContent = `En route from ${src} to ${dest} (${stopCount} stops)`;

    // Elderly screen sync
    const elderDestText = document.getElementById('elder-dest-text');
    if (elderDestText) elderDestText.textContent = dest;
    ElderlyAssist.addMilestone('🚇', 'Journey Commenced', `Boarded at ${src} → Target ${dest}`);

    // Play transit departure chime
    TransitAudio.playStationChime();

    renderTimeline();
    updateGPSDisplay(src);

    DriverDashboard.logEvent(`Journey active: "${state.user}" boarded at ${src} heading to ${dest} (${direction > 0 ? 'Down' : 'Up'} line)`, 'success');
    showToast(`Journey started! Tracking to ${dest} 🎯`, 'success');

    if (state.elderlyMode) {
      TransitAudio.speak(`Safe Journey Mode active. Tracking your train to ${dest}. Next announcements will alert you.`, 0.9);
    }
  }

  /**
   * Advances the train to the next station in the proper direction (bidirectional)
   */
  function advanceStation() {
    if (!state.journey.active) return;

    const { route, currentIdx, targetIdx, direction, destName } = state.journey;

    // Check if already reached destination
    if (currentIdx === targetIdx) {
      handleArrival();
      return;
    }

    // Step forward along direction (+1 or -1)
    const nextIdx = currentIdx + direction;
    state.journey.currentIdx = nextIdx;
    const currentStation = route[nextIdx];

    state.kpi.stopsServed++;
    updateKPIs();
    renderTimeline();
    updateGPSDisplay(currentStation);

    DriverDashboard.logEvent(`Vehicle arrived at station: ${currentStation}`, 'normal');
    ElderlyAssist.addMilestone('📍', `Arrived at ${currentStation}`, new Date().toLocaleTimeString());

    // Play arrival chime
    TransitAudio.playStationChime();

    // Check for Proximity Alert (1 station away from destination)
    if (nextIdx === targetIdx - direction) {
      handleProximityAlert(destName);
    }

    // Check for final destination arrival
    if (nextIdx === targetIdx) {
      handleArrival();
    }
  }

  function handleProximityAlert(destName) {
    showToast(`🔔 NEXT STATION IS YOUR STOP: ${destName}! Prepare to disembark.`, 'warning', 6000);
    TransitAudio.playProximityAlert();
    TransitAudio.vibrate([300, 150, 300, 150, 500]);
    ElderlyAssist.addMilestone('🔔', 'Pre-Arrival Alert Sent', `Next station is ${destName}`);
    DriverDashboard.logEvent(`⚡ PROXIMITY ALERT triggered for "${state.user}" — Next station: ${destName}`, 'alert');

    const voiceMsg = `Attention please. The next station is your destination, ${destName}. Please prepare to disembark. Doors will open on the left.`;
    TransitAudio.speak(voiceMsg, 0.95);
  }

  function handleArrival() {
    const destName = state.journey.destName;
    stopAutoRide();

    showToast(`🎉 You have arrived at ${destName}! Thank you for riding Namma Metro.`, 'success', 8000);
    TransitAudio.playStationChime();
    TransitAudio.vibrate([500, 200, 500]);
    ElderlyAssist.addMilestone('✅', `Arrived at Destination: ${destName}`, 'Trip completed successfully');
    DriverDashboard.logEvent(`✅ Passenger "${state.user}" safely disembarked at destination: ${destName}`, 'success');

    const voiceMsg = `You have arrived at ${destName}. Please mind the gap while stepping off the train. Have a great day.`;
    TransitAudio.speak(voiceMsg, 0.95);

    // Save trip into Bayesian AI learning history
    state.history = SmartStopAI.learnTrip(state.user, state.journey.srcName, destName, state.history);
    localStorage.setItem('ss_history', JSON.stringify(state.history));

    // Release fleet demand & sensor pax
    DriverDashboard.releaseDisembarkationDemand(destName, 1);
    TransitSensors.alightPassenger(1);
    state.kpi.onboard = TransitSensors.getPassengerCount();
    updateKPIs();

    setTimeout(() => {
      resetJourney();
    }, 4500);
  }

  // ─── Automated Ride Simulation ──────────────────────────────────
  function toggleAutoRide() {
    if (!state.journey.active) {
      showToast('Please start a journey first to simulate', 'warning');
      return;
    }

    const autoBtn = document.getElementById('auto-sim-btn');

    if (state.journey.autoTimer) {
      stopAutoRide();
      showToast('Auto simulation paused', 'info');
    } else {
      if (autoBtn) {
        autoBtn.textContent = '⏸ Pause Simulation';
        autoBtn.classList.add('btn-amber');
      }
      showToast('Auto-simulation running: train will advance every 4 seconds', 'info');
      state.journey.autoTimer = setInterval(() => {
        if (!state.journey.active || state.journey.currentIdx === state.journey.targetIdx) {
          stopAutoRide();
        } else {
          advanceStation();
        }
      }, 4000);
    }
  }

  function stopAutoRide() {
    if (state.journey.autoTimer) {
      clearInterval(state.journey.autoTimer);
      state.journey.autoTimer = null;
    }
    const autoBtn = document.getElementById('auto-sim-btn');
    if (autoBtn) {
      autoBtn.textContent = '⚡ Auto-Simulate Journey';
      autoBtn.classList.remove('btn-amber');
    }
  }

  function resetJourney() {
    stopAutoRide();
    state.journey = {
      active: false,
      line: state.activeLine,
      route: [],
      startIdx: -1,
      currentIdx: -1,
      targetIdx: -1,
      direction: 1,
      srcName: '',
      destName: '',
      autoTimer: null
    };

    document.getElementById('setup-form').style.display = 'block';
    document.getElementById('tracking-active').style.display = 'none';
    hideAIPredictionCard();
    hideManualCard();

    const srcSel = document.getElementById('src-sel');
    if (srcSel) srcSel.value = '';

    const mapCard = document.getElementById('map-card');
    if (mapCard) {
      mapCard.style.opacity = '0.4';
      mapCard.style.pointerEvents = 'none';
    }

    const trackingDest = document.getElementById('tracking-dest');
    if (trackingDest) trackingDest.textContent = '—';

    const destDisplay = document.getElementById('dest-display');
    if (destDisplay) destDisplay.classList.remove('locked');

    const routePath = document.getElementById('route-path');
    if (routePath) routePath.innerHTML = '';

    const progFill = document.getElementById('prog-fill');
    if (progFill) progFill.style.width = '0%';

    const progPct = document.getElementById('prog-pct');
    if (progPct) progPct.textContent = '0%';
  }

  // ─── Timeline Rendering (Bidirectional) ─────────────────────────
  function renderTimeline() {
    const { route, startIdx, currentIdx, targetIdx, direction } = state.journey;
    const timelineEl = document.getElementById('route-path');
    if (!timelineEl) return;

    timelineEl.innerHTML = '';

    // Calculate progression stops in the direction of travel
    const stepCount = Math.abs(targetIdx - startIdx);
    const completedSteps = Math.abs(currentIdx - startIdx);
    const progressPercent = stepCount > 0 ? Math.min(100, Math.round((completedSteps / stepCount) * 100)) : 100;

    const progFill = document.getElementById('prog-fill');
    const progPct = document.getElementById('prog-pct');
    if (progFill) progFill.style.width = `${progressPercent}%`;
    if (progPct) progPct.textContent = `${progressPercent}%`;

    // Window around current station in travel order
    const orderedIndices = [];
    let ptr = startIdx;
    while (true) {
      orderedIndices.push(ptr);
      if (ptr === targetIdx) break;
      ptr += direction;
    }

    const curPositionInJourney = orderedIndices.indexOf(currentIdx);
    const displaySlice = orderedIndices.filter((idx, rank) => {
      return (rank >= curPositionInJourney - 2 && rank <= curPositionInJourney + 3) || rank === orderedIndices.length - 1;
    });

    let lastShownRank = -1;

    displaySlice.forEach(stationIdx => {
      const rank = orderedIndices.indexOf(stationIdx);
      if (lastShownRank !== -1 && rank - lastShownRank > 1) {
        const gap = document.createElement('div');
        gap.className = 'timeline-gap';
        gap.textContent = `· · · ${rank - lastShownRank - 1} stops in between · · ·`;
        timelineEl.appendChild(gap);
      }

      const stName = route[stationIdx];
      const isPassed = direction > 0 ? stationIdx < currentIdx : stationIdx > currentIdx;
      const isCurrent = stationIdx === currentIdx;
      const isTarget = stationIdx === targetIdx;

      let statusClass = '';
      let badgeHtml = '';

      if (isCurrent) {
        statusClass = 'current';
        badgeHtml = '<span class="stop-badge tag-aqua">CURRENT STOP</span>';
      } else if (isPassed) {
        statusClass = 'passed';
        badgeHtml = '<span class="stop-badge tag-emerald">PASSED</span>';
      } else if (isTarget) {
        statusClass = 'target';
        badgeHtml = '<span class="stop-badge tag-coral">DESTINATION</span>';
      }

      // Check if interchange station
      const isInterchange = stName.includes('Majestic');
      const interchangeTag = isInterchange ? '<span class="interchange-badge">TRANSFER HUB</span>' : '';

      const row = document.createElement('div');
      row.className = `stop-row ${statusClass}`;
      row.innerHTML = `
        <div class="stop-dot"></div>
        <div class="stop-meta">
          <span class="stop-name">${stName}</span>
          ${interchangeTag}
        </div>
        <div class="stop-status">${badgeHtml}</div>
      `;

      timelineEl.appendChild(row);
      lastShownRank = rank;
    });
  }

  // ─── Elderly & Accessibility Integration ─────────────────────────
  function setupElderlyMode() {
    const toggle = document.getElementById('elderly-toggle');
    if (toggle) {
      toggle.checked = state.elderlyMode;
      applyElderlyModeStyles(state.elderlyMode);
      toggle.addEventListener('change', function () {
        state.elderlyMode = this.checked;
        localStorage.setItem('ss_elderly', this.checked);
        applyElderlyModeStyles(this.checked);
        showToast(this.checked ? '👴 Elderly Mode Activated — High contrast & audio guidance enabled' : 'Standard display mode restored', 'info');
        DriverDashboard.logEvent(`Accessibility profile changed: Elderly mode ${this.checked ? 'ENABLED' : 'DISABLED'}`, 'normal');
      });
    }
  }

  function applyElderlyModeStyles(enabled) {
    if (enabled) {
      document.body.classList.add('elderly-mode-active');
    } else {
      document.body.classList.remove('elderly-mode-active');
    }
  }

  function triggerSOS() {
    state.kpi.sos++;
    updateKPIs();

    const currentStation = state.journey.active ? state.journey.route[state.journey.currentIdx] : (document.getElementById('src-sel')?.value || 'Majestic');
    const alertData = ElderlyAssist.triggerSOS(state.user || 'Passenger', currentStation, state.activeLine);

    DriverDashboard.logEvent(`🚨 CRITICAL EMERGENCY SOS: "${alertData.passenger}" at ${alertData.station} (GPS: ${alertData.coordinates})`, 'danger', 'sos');
    showToast('🚨 SOS DISTRESS BEACON BROADCAST! Station controller & emergency contacts alerted.', 'danger', 8000);
  }

  function voiceRepeatAnnouncement() {
    const { active, destName, currentIdx, route, direction } = state.journey;
    let msg = "";

    if (active) {
      const cur = route[currentIdx];
      msg = `Current station is ${cur}. Your target destination is ${destName}. The system is monitoring your stops.`;
    } else {
      msg = "SmartStop AI Safe Journey Mode is armed. Please select your boarding station to initiate automated guidance.";
    }

    TransitAudio.playStationChime();
    TransitAudio.speak(msg, 0.9);
    showToast('🔊 Voice alert spoken', 'info');
  }

  function notifyCaregiverAction(contactName) {
    const cur = state.journey.active ? state.journey.route[state.journey.currentIdx] : 'Boarding Gate';
    const dest = state.journey.active ? state.journey.destName : 'Scheduled Route';
    const dispatch = ElderlyAssist.notifyCaregiver(contactName, dest, cur);

    DriverDashboard.logEvent(`Caregiver notification dispatched to ${dispatch.recipient} (${dispatch.phone})`, 'success');
    showToast(`📲 Dispatched SMS alert to ${dispatch.recipient}!`, 'success');
  }

  // ─── Sensors & Hardware Simulation ──────────────────────────────
  function setupSensors() {
    TransitSensors.subscribe(data => {
      state.kpi.onboard = data.count;
      updateKPIs();
      updateSensorDisplay();
    });
  }

  function updateSensorDisplay() {
    const sensorCountEl = document.getElementById('sensor-count');
    if (sensorCountEl) {
      sensorCountEl.innerHTML = `${TransitSensors.getPassengerCount()} <span class="sensor-unit">PAX</span>`;
    }
    TransitSensors.renderMiniGraph('count-graph');
  }

  function updateGPSDisplay(stationName) {
    const coords = TransitSensors.getGPSCoordinates(stationName, state.activeLine);
    const gpsPosEl = document.getElementById('gps-pos');
    const gpsStopEl = document.getElementById('gps-stop');

    if (gpsPosEl) gpsPosEl.textContent = `${coords.lat}° N, ${coords.lon}° E`;
    if (gpsStopEl) gpsStopEl.textContent = coords.name + (coords.hub ? ` (${coords.hub})` : '');
  }

  function boardPaxButton() {
    TransitSensors.boardPassenger(1);
    TransitAudio.playStationChime();
    DriverDashboard.logEvent("Edge IR Sensor: Passenger boarded carriage (+1)", "normal", "sensor");
  }

  function alightPaxButton() {
    if (TransitSensors.getPassengerCount() > 0) {
      TransitSensors.alightPassenger(1);
      DriverDashboard.logEvent("Edge IR Sensor: Passenger alighted carriage (-1)", "normal", "sensor");
    }
  }

  // ─── Driver Passenger Simulator ─────────────────────────────────
  function populateDriverSimStops() {
    const simSel = document.getElementById('sim-stop');
    if (!simSel) return;

    simSel.innerHTML = '<option value="">— Select Station for Crowd Injection —</option>';
    const all = [...STATIONS.Purple, ...STATIONS.Green];
    const unique = [...new Set(all)].sort();

    unique.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      simSel.appendChild(opt);
    });
  }

  function injectSimulatedCrowd() {
    const simSel = document.getElementById('sim-stop');
    const stop = simSel?.value;
    if (!stop) {
      showToast('Select a station to inject passengers', 'warning');
      return;
    }

    const paxCount = Math.floor(Math.random() * 4) + 2;
    DriverDashboard.recordDisembarkationDemand(stop, paxCount);
    TransitSensors.boardPassenger(paxCount);
    updateKPIs();

    DriverDashboard.logEvent(`Simulated crowd injection: +${paxCount} passengers heading to ${stop}`, 'normal');
    showToast(`Added +${paxCount} passengers heading to ${stop}`, 'info');
  }

  // ─── Helper Utilities ────────────────────────────────────────────
  function updateKPIs() {
    const elements = {
      'kpi-onboard': state.kpi.onboard,
      'kpi-sos': state.kpi.sos,
      'kpi-pred': state.kpi.predictions,
      'kpi-stops': state.kpi.stopsServed,
      'stat-onboard': state.kpi.onboard
    };

    for (const [id, val] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }
  }

  function showToast(msg, type = 'info', duration = 3500) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.className = toast.className.replace('show', '').trim();
    }, duration);
  }

  function setupForms() {
    const lineSel = document.getElementById('line-sel');
    if (lineSel) {
      lineSel.addEventListener('change', function () {
        loadStationsForLine(this.value);
      });
    }

    const srcSel = document.getElementById('src-sel');
    if (srcSel) {
      srcSel.addEventListener('change', function () {
        triggerAIPrediction();
      });
    }
  }

  return {
    init,
    login,
    logout,
    switchView,
    confirmJourney,
    advanceStation,
    toggleAutoRide,
    resetJourney,
    triggerAIPrediction,
    selectAlternative,
    showManualSelect,
    triggerSOS,
    voiceRepeatAnnouncement,
    notifyCaregiverAction,
    boardPaxButton,
    alightPaxButton,
    injectSimulatedCrowd,
    showToast,
    closeLoginModal
  };
})();

// Bind explicitly to window for global access
window.App = App;

// Launch application on DOM ready
document.addEventListener('DOMContentLoaded', App.init);

