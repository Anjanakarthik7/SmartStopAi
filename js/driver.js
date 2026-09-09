/**
 * SmartStop AI — Driver Dashboard & Fleet Analytics Module
 * Renders off-boarding demand charts, system event terminal, and fleet metrics
 */

const DriverDashboard = (function () {
  let fleetDemandMap = {}; // { "Station Name": count }
  let eventLogs = [];
  let filterCategory = 'all';

  function recordDisembarkationDemand(destination, delta = 1) {
    fleetDemandMap[destination] = (fleetDemandMap[destination] || 0) + delta;
    renderDemandChart();
  }

  function releaseDisembarkationDemand(destination, delta = 1) {
    if (fleetDemandMap[destination]) {
      fleetDemandMap[destination] = Math.max(0, fleetDemandMap[destination] - delta);
      if (fleetDemandMap[destination] === 0) {
        delete fleetDemandMap[destination];
      }
    }
    renderDemandChart();
  }

  function logEvent(msg, type = 'normal', category = 'system') {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const logItem = { id: Date.now() + Math.random(), time, msg, type, category };
    eventLogs.unshift(logItem);

    if (eventLogs.length > 100) {
      eventLogs.pop();
    }

    renderLogs();
  }

  function setLogFilter(cat) {
    filterCategory = cat;
    renderLogs();
  }

  function renderLogs() {
    const terminal = document.getElementById('event-log');
    if (!terminal) return;

    const filtered = filterCategory === 'all' 
      ? eventLogs 
      : eventLogs.filter(l => l.type === filterCategory || l.category === filterCategory);

    if (filtered.length === 0) {
      terminal.innerHTML = '<div class="log-line empty">No logs in current view</div>';
      return;
    }

    terminal.innerHTML = filtered.map(l => `
      <div class="log-line fade-in">
        <span class="log-time">[${l.time}]</span>
        <span class="log-${l.type}">${l.msg}</span>
      </div>
    `).join('');
  }

  function renderDemandChart() {
    const container = document.getElementById('fleet-chart');
    if (!container) return;

    const entries = Object.entries(fleetDemandMap).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);

    if (!entries.length) {
      container.innerHTML = `
        <div class="empty-chart-notice">
          <div class="empty-icon">📊</div>
          <div>No active disembarkation demand recorded.</div>
          <div class="empty-sub">Passengers will populate this histogram when journeys start.</div>
        </div>
      `;
      return;
    }

    const maxVal = Math.max(...entries.map(([, v]) => v), 1);

    container.innerHTML = entries.slice(0, 10).map(([stop, count]) => {
      const pct = Math.round((count / maxVal) * 100);
      let barClass = 'load-normal';
      let loadTag = 'Light';

      if (count >= 12) {
        barClass = 'load-high';
        loadTag = 'High Demand';
      } else if (count >= 5) {
        barClass = 'load-medium';
        loadTag = 'Moderate';
      }

      return `
        <div class="fleet-item">
          <div class="fleet-meta">
            <span class="fleet-stop">${stop}</span>
            <span class="fleet-pill ${barClass}">${count} PAX (${loadTag})</span>
          </div>
          <div class="fleet-track">
            <div class="fleet-fill ${barClass}" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getDemandMap() {
    return fleetDemandMap;
  }

  function clearAllLogs() {
    eventLogs = [];
    renderLogs();
  }

  return {
    recordDisembarkationDemand,
    releaseDisembarkationDemand,
    logEvent,
    renderLogs,
    renderDemandChart,
    getDemandMap,
    setLogFilter,
    clearAllLogs
  };
})();

// Bind to window for global access
window.DriverDashboard = DriverDashboard;

