/**
 * SmartStop AI — Destination Prediction & Bayesian Inference Engine
 * Provides machine learning simulation for commuter destination forecasting
 */

const SmartStopAI = (function () {
  // Hub gravity score based on commercial/transit significance
  const HUB_SCORES = {
    "Majestic": 95,
    "Whitefield (Kadugodi)": 92,
    "Indiranagar": 88,
    "Mahatma Gandhi Road": 89,
    "Yeshwanthpur": 84,
    "Pattandur Agrahara": 80,
    "Jayanagar": 78,
    "KR Market": 76,
    "Krishnarajapura": 75,
    "Challaghatta": 65,
    "Silk Institute": 62
  };

  /**
   * Determine current commuter peak period
   * @returns {'morning_peak' | 'evening_peak' | 'off_peak'}
   */
  function getCurrentTimeSlot() {
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 11) return 'morning_peak';
    if (hour >= 16 && hour <= 21) return 'evening_peak';
    return 'off_peak';
  }

  /**
   * Calculates destination probabilities using Bayesian prior & conditional likelihood
   * @param {string} user Passenger ID/Name
   * @param {string} line "Purple" | "Green"
   * @param {string} origin Boarding Station Name
   * @param {Object} history User travel history store
   * @returns {Object} Top prediction, candidate ranking, confidence, and explainability breakdown
   */
  function predictDestination(user, line, origin, history = {}) {
    const stations = METRO_DATA.lines[line]?.stations || [];
    const stationNames = stations.map(s => s.name).filter(s => s !== origin);

    if (!stationNames.length) {
      return null;
    }

    const timeSlot = getCurrentTimeSlot();
    const userHistory = history[user] || {};
    const originHistory = userHistory[origin] || {};

    // Calculate total historical journeys from this origin
    const totalTripsFromOrigin = Object.values(originHistory).reduce((a, b) => a + b, 0);

    const candidates = [];

    stationNames.forEach(dest => {
      let score = 0;
      let habitFactor = 0;
      let timeFactor = 0;
      let gravityFactor = 0;

      // 1. Personal Historical Prior (Bayesian Weight)
      if (totalTripsFromOrigin > 0 && originHistory[dest]) {
        const freq = originHistory[dest] / totalTripsFromOrigin;
        habitFactor = freq * 60; // Up to 60 points
      }

      // 2. Temporal & Commute Pattern Heuristic
      const destStationObj = stations.find(s => s.name === dest);
      const destType = destStationObj ? destStationObj.type : 'residential';

      if (timeSlot === 'morning_peak') {
        if (destType === 'tech' || destType === 'commercial' || destStationObj?.hub) {
          timeFactor = 25;
        } else if (destType === 'educational' || destType === 'civic') {
          timeFactor = 18;
        } else {
          timeFactor = 8;
        }
      } else if (timeSlot === 'evening_peak') {
        if (destType === 'residential' || destType === 'transit-hub') {
          timeFactor = 26;
        } else if (destType === 'commercial') {
          timeFactor = 14;
        } else {
          timeFactor = 8;
        }
      } else {
        // Off-peak
        if (destType === 'commercial' || destType === 'cultural') {
          timeFactor = 20;
        } else {
          timeFactor = 12;
        }
      }

      // 3. Station Gravity & Interchange Pull
      const baseGravity = HUB_SCORES[dest] || 45;
      gravityFactor = (baseGravity / 100) * 15; // Up to 15 points

      // 4. Distance / Directional sanity penalty for immediate next station (commuters rarely take 1-stop metro)
      const origIdx = stations.findIndex(s => s.name === origin);
      const destIdx = stations.findIndex(s => s.name === dest);
      const stopDistance = Math.abs(destIdx - origIdx);
      if (stopDistance === 1) {
        gravityFactor -= 8;
      } else if (stopDistance >= 4 && stopDistance <= 18) {
        gravityFactor += 5; // typical commute distance
      }

      score = Math.max(5, habitFactor + timeFactor + gravityFactor);

      candidates.push({
        name: dest,
        score,
        habitFactor: Math.round(habitFactor),
        timeFactor: Math.round(timeFactor),
        gravityFactor: Math.round(gravityFactor),
        stopDistance,
        type: destType
      });
    });

    // Sort descending by score
    candidates.sort((a, b) => b.score - a.score);

    const topCandidate = candidates[0];
    const secondScore = candidates[1]?.score || 1;

    // Compute normalized confidence percentage
    let confidence = 0;
    let rationale = "";

    if (topCandidate.habitFactor > 20) {
      // High confidence repeat user
      confidence = Math.min(97, Math.round(75 + (topCandidate.habitFactor / 60) * 22));
      rationale = `Personalised Habit Inference: You have travelled to ${topCandidate.name} ${originHistory[topCandidate.name]} times from this station.`;
    } else {
      // Demographic & network pattern inference
      const ratio = topCandidate.score / (topCandidate.score + secondScore);
      confidence = Math.min(88, Math.max(68, Math.round(ratio * 115)));
      const timeDesc = timeSlot === 'morning_peak' ? 'Morning Peak Inbound' : timeSlot === 'evening_peak' ? 'Evening Peak Outbound' : 'Regular Off-Peak';
      rationale = `Predictive Commute Model (${timeDesc}): High probability transit destination based on ${topCandidate.type.toUpperCase()} density and passenger flow.`;
    }

    return {
      topDestination: topCandidate.name,
      confidence,
      rationale,
      timeSlot,
      breakdown: {
        habitWeight: topCandidate.habitFactor,
        timeWeight: topCandidate.timeFactor,
        gravityWeight: topCandidate.gravityFactor
      },
      alternatives: candidates.slice(1, 4).map(c => ({
        name: c.name,
        confidence: Math.round((c.score / topCandidate.score) * (confidence - 10))
      }))
    };
  }

  /**
   * Persists a completed journey to train the Bayesian history
   */
  function learnTrip(user, origin, destination, historyStore) {
    if (!historyStore[user]) historyStore[user] = {};
    if (!historyStore[user][origin]) historyStore[user][origin] = {};
    historyStore[user][origin][destination] = (historyStore[user][origin][destination] || 0) + 1;
    return historyStore;
  }

  return {
    predictDestination,
    learnTrip,
    getCurrentTimeSlot
  };
})();

// Bind to window for global access
window.SmartStopAI = SmartStopAI;

