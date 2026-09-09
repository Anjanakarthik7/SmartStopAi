/**
 * SmartStop AI — IoT & Sensor Telemetry Simulation Module
 * Simulates ESP32 edge processing, infrared passenger counting, GPS streaming, and cloud sync
 */

const TransitSensors = (function () {
  let passengerCount = 0;
  const historyWindow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let currentStation = null;
  let listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
  }

  function notify() {
    listeners.forEach(fn => fn({
      count: passengerCount,
      history: [...historyWindow],
      station: currentStation
    }));
  }

  function setPassengerCount(val) {
    passengerCount = Math.max(0, val);
    recordSample();
    notify();
  }

  function boardPassenger(delta = 1) {
    passengerCount += delta;
    recordSample();
    notify();
    return passengerCount;
  }

  function alightPassenger(delta = 1) {
    passengerCount = Math.max(0, passengerCount - delta);
    recordSample();
    notify();
    return passengerCount;
  }

  function recordSample() {
    historyWindow.push(passengerCount);
    if (historyWindow.length > 14) {
      historyWindow.shift();
    }
  }

  function getGPSCoordinates(stationName, lineName = 'Purple') {
    const stations = METRO_DATA.lines[lineName]?.stations || [];
    const station = stations.find(s => s.name === stationName);
    if (station) {
      // Add slight GPS satellite jitter (0.0002 deg ~ 20m)
      const jitterLat = (Math.random() - 0.5) * 0.0004;
      const jitterLon = (Math.random() - 0.5) * 0.0004;
      return {
        lat: (station.lat + jitterLat).toFixed(4),
        lon: (station.lon + jitterLon).toFixed(4),
        rawLat: station.lat,
        rawLon: station.lon,
        name: station.name,
        type: station.type,
        hub: station.hub || null
      };
    }
    return {
      lat: "12.9716",
      lon: "77.5946",
      name: stationName || "En Route",
      hub: null
    };
  }

  function renderMiniGraph(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const max = Math.max(...historyWindow, 5);
    const barsHtml = historyWindow.map(val => {
      const heightPercent = Math.max(8, Math.round((val / max) * 100));
      return `
        <div class="telemetry-bar-wrap" title="${val} PAX">
          <div class="telemetry-bar" style="height: ${heightPercent}%;"></div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="telemetry-graph-inner">${barsHtml}</div>`;
  }

  return {
    getPassengerCount: () => passengerCount,
    setPassengerCount,
    boardPassenger,
    alightPassenger,
    getGPSCoordinates,
    renderMiniGraph,
    subscribe,
    recordSample
  };
})();

// Bind to window for global access
window.TransitSensors = TransitSensors;

