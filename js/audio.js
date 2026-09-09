/**
 * SmartStop AI — Web Audio API Synthesizer & Speech Guidance
 * Generates synthetic transit chimes, emergency pulses, and voice announcements
 */

const TransitAudio = (function () {
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Play standard 3-tone rising metro transit chime (C5 -> E5 -> G5)
   */
  function playStationChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const tones = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = ctx.currentTime;

      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);

        gain.gain.setValueAtTime(0, now + idx * 0.16);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.16 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.46);
      });
    } catch (e) {
      console.warn("Audio chime prevented by browser autoplay policy:", e);
    }
  }

  /**
   * Urgent double-tone proximity warning chime
   */
  function playProximityAlert() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [880, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        gain.gain.setValueAtTime(0, now + idx * 0.18);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.18 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.36);
      });
    } catch (e) {
      console.warn("Proximity chime blocked:", e);
    }
  }

  /**
   * High-intensity SOS alert tone
   */
  function playSOSTone() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        const f = i % 2 === 0 ? 987.77 : 659.25; // B5 to E5 siren
        osc.frequency.setValueAtTime(f, now + i * 0.2);

        gain.gain.setValueAtTime(0.2, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.19);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.2);
      }
    } catch (e) {
      console.warn("SOS tone blocked:", e);
    }
  }

  /**
   * Natural speech announcement
   */
  function speak(text, rate = 0.95, priority = false) {
    if (!('speechSynthesis' in window)) return;

    if (priority) {
      window.speechSynthesis.cancel(); // Interrupt existing
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick an English Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
    if (indVoice) {
      utterance.voice = indVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Device haptic vibration
   */
  function vibrate(pattern = [200, 100, 200]) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  return {
    playStationChime,
    playProximityAlert,
    playSOSTone,
    speak,
    vibrate,
    init: getAudioContext
  };
})();

// Bind to window for global access
window.TransitAudio = TransitAudio;

