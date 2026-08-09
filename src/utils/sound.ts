// Web Audio API Synthesizer for high-performance workout audio cues

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (e) {
    /* ignore */
  }
}

export function playBeep(
  frequency = 880,
  durationMs = 150,
  type: OscillatorType = 'sine',
  volume = 0.3
) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

export function playCountdownBeep(secondsRemaining: number, soundEnabled = true) {
  if (!soundEnabled) return;
  unlockAudio();
  if (secondsRemaining === 3 || secondsRemaining === 2 || secondsRemaining === 1) {
    // Sharp alert pitch for 3s, 2s, 1s countdown in ALL workout phases
    playBeep(850, 160, 'square', 0.45);
  } else if (secondsRemaining === 0) {
    // High alert pitch for phase transition
    playBeep(1250, 320, 'triangle', 0.5);
  }
}

export function playPhaseChangeSound(
  newPhase: 'TRABALHO' | 'DESCANSO' | 'FINISHED',
  soundEnabled = true
) {
  if (!soundEnabled) return;
  unlockAudio();
  if (newPhase === 'TRABALHO') {
    // Energetic double high beep
    playBeep(880, 100, 'sine', 0.35);
    setTimeout(() => playBeep(1320, 250, 'sine', 0.45), 120);
  } else if (newPhase === 'DESCANSO') {
    // Descending soothing tone
    playBeep(800, 120, 'sine', 0.3);
    setTimeout(() => playBeep(520, 250, 'sine', 0.3), 120);
  } else if (newPhase === 'FINISHED') {
    // Victory fanfare arpeggio
    playBeep(523.25, 120, 'triangle', 0.3);
    setTimeout(() => playBeep(659.25, 120, 'triangle', 0.35), 130);
    setTimeout(() => playBeep(783.99, 120, 'triangle', 0.4), 260);
    setTimeout(() => playBeep(1046.5, 400, 'triangle', 0.5), 390);
  }
}
