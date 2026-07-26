/*
 * Mini Arcade — shared runtime helpers.
 *
 * Every game had its own byte-identical copy of the WebAudio setup, the toast
 * animation, the fullscreen wiring and the localStorage best-score plumbing.
 * They live here now so a fix lands once instead of ten times.
 *
 * Games keep thin local wrappers over these, so their existing call sites are
 * unchanged.
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- audio ---
  let audioCtx = null;
  let soundGate = function () { return true; };

  function initAudio() {
    if (!audioCtx) audioCtx = new (global.AudioContext || global.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  /** Games with a sound toggle pass a predicate; everyone else stays audible. */
  function setSoundGate(fn) {
    soundGate = typeof fn === 'function' ? fn : function () { return true; };
  }

  function playTone(freq, type, duration, delay, vol) {
    if (!audioCtx || !soundGate()) return;
    delay = delay || 0;
    vol = vol === undefined ? 0.12 : vol;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
  }

  /** The four-note flourish every game plays on a new personal best. */
  function playBestJingle() {
    [523.25, 659.25, 783.99, 1046.50].forEach(function (f, i) {
      playTone(f, 'sine', 0.3, i * 0.13, 0.12);
    });
  }

  function audioContext() { return audioCtx; }

  // ---------------------------------------------------------------- toast ---
  const toastTimers = new WeakMap();

  function showToast(el, text, color, ms) {
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
    el.style.textShadow = '0 0 25px ' + color;
    el.classList.remove('show');
    void el.offsetWidth;           // restart the transition
    el.classList.add('show');
    clearTimeout(toastTimers.get(el));
    toastTimers.set(el, setTimeout(function () { el.classList.remove('show'); }, ms || 1000));
  }

  // ---------------------------------------------------------- best scores ---
  function bestScore(key) {
    return parseInt(global.localStorage.getItem(key) || '0', 10);
  }

  function setBestScore(key, value) {
    global.localStorage.setItem(key, String(Math.floor(value)));
  }

  /**
   * One-time carry-over from a game's pre-difficulty single high score, so a
   * long-time player's record doesn't appear to vanish when tiers arrive.
   */
  function migrateLegacyBest(legacyKey, targetKey, flagKey) {
    const legacy = parseInt(global.localStorage.getItem(legacyKey) || '0', 10);
    if (legacy > 0 && !global.localStorage.getItem(flagKey)) {
      if (legacy > bestScore(targetKey)) setBestScore(targetKey, legacy);
    }
    global.localStorage.setItem(flagKey, '1');
  }

  // ----------------------------------------------------------- fullscreen ---
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      const req = document.documentElement.requestFullscreen;
      if (req) req.call(document.documentElement).catch(function () {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  /** Relabels the button and re-runs the game's layout on enter/exit. */
  function wireFullscreen(btn, onChange) {
    if (!btn) return;
    if (!document.documentElement.requestFullscreen) {
      btn.style.display = 'none';
      return;
    }
    document.addEventListener('fullscreenchange', function () {
      btn.textContent = document.fullscreenElement ? '⤢ Exit' : '⛶ Full';
      if (typeof onChange === 'function') onChange();
    });
  }

  // ------------------------------------------------------------ auto-pause ---
  /** Pauses when the tab goes to the background. */
  function wireAutoPause(shouldPause, pause) {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && shouldPause()) pause();
    });
  }

  // ---------------------------------------------------------- dpr canvas ----
  /**
   * Sizes a canvas's backing store to its CSS box times devicePixelRatio and
   * returns the CSS-pixel rect, so callers can lay out in CSS pixels.
   */
  function fitCanvas(canvas, ctx) {
    const dpr = global.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return rect;
  }

  global.Arcade = {
    initAudio: initAudio,
    playTone: playTone,
    playBestJingle: playBestJingle,
    setSoundGate: setSoundGate,
    audioContext: audioContext,
    showToast: showToast,
    bestScore: bestScore,
    setBestScore: setBestScore,
    migrateLegacyBest: migrateLegacyBest,
    toggleFullscreen: toggleFullscreen,
    wireFullscreen: wireFullscreen,
    wireAutoPause: wireAutoPause,
    fitCanvas: fitCanvas
  };
})(window);
