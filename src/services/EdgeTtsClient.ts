import { EDGE_TTS_BOY_VOICE_CONFIG } from '../tts/edgeTtsBoyVoiceConfig';

export type EdgeTtsSpeakOptions = {
  volume?: number;
  rate?: string;
  pitch?: string;
  voice?: string;
  surpriseChime?: boolean;
};

type ApiResponse = {
  url: string;
  cacheKey: string;
  cached: boolean;
  tookMs: number;
};

const urlCache = new Map<string, string>();
const bufferCache = new Map<string, AudioBuffer>();

let audioCtx: AudioContext | null = null;
let currentNodes: {
  source?: AudioBufferSourceNode;
  master?: GainNode;
} | null = null;

const playSurpriseChime = async () => {
  if (typeof window === 'undefined') return;
  const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
  if (!AC) return;
  audioCtx = audioCtx || new AC();
  if (audioCtx.state === 'suspended') await audioCtx.resume();

  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  master.connect(audioCtx.destination);

  const makeTone = (freq: number, start: number, dur: number) => {
    const osc = audioCtx!.createOscillator();
    const g = audioCtx!.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(1, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(start);
    osc.stop(start + dur);
  };

  makeTone(440, now, 0.08);
  makeTone(587.33, now + 0.09, 0.11);
};

export async function edgeTtsSpeak(text: string, options: EdgeTtsSpeakOptions = {}) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const config = {
    ...EDGE_TTS_BOY_VOICE_CONFIG,
    voice: options.voice || EDGE_TTS_BOY_VOICE_CONFIG.voice,
    rate: options.rate || EDGE_TTS_BOY_VOICE_CONFIG.rate,
    pitch: options.pitch || EDGE_TTS_BOY_VOICE_CONFIG.pitch,
  };

  const cacheKey = JSON.stringify({ t: trimmed, v: config.voice, r: config.rate, p: config.pitch, o: config.outputFormat });
  const cachedBuffer = bufferCache.get(cacheKey);

  const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
  if (!AC) return;
  audioCtx = audioCtx || new AC();
  if (audioCtx.state === 'suspended') await audioCtx.resume();

  const stopCurrent = () => {
    if (!currentNodes) return;
    try {
      currentNodes.source?.stop();
    } catch {
    }
    currentNodes = null;
  };

  const createWarmImpulse = (durationSec: number, decay: number) => {
    const rate = audioCtx!.sampleRate;
    const length = Math.max(1, Math.floor(rate * durationSec));
    const impulse = audioCtx!.createBuffer(1, length, rate);
    const data = impulse.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
    return impulse;
  };

  const playBuffer = async (buffer: AudioBuffer) => {
    stopCurrent();

    if (options.surpriseChime !== false) {
      await playSurpriseChime();
    }

    const src = audioCtx!.createBufferSource();
    src.buffer = buffer;

    const now = audioCtx!.currentTime;
    src.detune.setValueAtTime(35, now);
    src.detune.exponentialRampToValueAtTime(1, now + 0.22);

    const lfo = audioCtx!.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 6.2;
    const lfoGain = audioCtx!.createGain();
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(src.detune);
    lfo.start();
    lfo.stop(now + Math.max(0.6, buffer.duration));

    const presence = audioCtx!.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.value = 3000;
    presence.Q.value = 0.9;
    presence.gain.value = 2.5;

    const lowpass = audioCtx!.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 9500;
    lowpass.Q.value = 0.7;

    const convolver = audioCtx!.createConvolver();
    convolver.buffer = createWarmImpulse(0.35, 2.8);

    const wet = audioCtx!.createGain();
    wet.gain.value = 0.09;

    const dry = audioCtx!.createGain();
    dry.gain.value = 1;

    const compressor = audioCtx!.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.2;

    const master = audioCtx!.createGain();
    master.gain.value = typeof options.volume === 'number' ? Math.min(Math.max(options.volume, 0), 1) : 0.82;

    src.connect(presence);
    presence.connect(lowpass);
    lowpass.connect(dry);
    lowpass.connect(convolver);
    convolver.connect(wet);
    dry.connect(compressor);
    wet.connect(compressor);
    compressor.connect(master);
    master.connect(audioCtx!.destination);

    currentNodes = { source: src, master };

    src.start();
    src.onended = () => {
      if (currentNodes?.source === src) currentNodes = null;
    };
  };

  if (cachedBuffer) {
    await playBuffer(cachedBuffer);
    return;
  }

  const cachedUrl = urlCache.get(cacheKey);
  if (cachedUrl) {
    const arr = await fetch(cachedUrl).then(r => r.arrayBuffer());
    const buffer = await audioCtx.decodeAudioData(arr.slice(0));
    bufferCache.set(cacheKey, buffer);
    await playBuffer(buffer);
    return;
  }

  const res = await fetch('/api/edge-tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: trimmed,
      config,
    }),
  });

  if (!res.ok) return;
  const data = (await res.json()) as ApiResponse;
  const url = data.url;
  urlCache.set(cacheKey, url);
  const arr = await fetch(url).then(r => r.arrayBuffer());
  const buffer = await audioCtx.decodeAudioData(arr.slice(0));
  bufferCache.set(cacheKey, buffer);
  await playBuffer(buffer);
}

export function edgeTtsStop() {
  if (!currentNodes) return;
  try {
    currentNodes.source?.stop();
  } catch {
  }
  currentNodes = null;
}
