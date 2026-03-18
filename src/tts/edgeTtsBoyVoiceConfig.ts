export type EdgeTtsBoyVoiceConfig = {
  voice: string;
  lang: string;
  outputFormat: string;
  rate: string;
  pitch: string;
  volume: string;
  timeout: number;
};

export const EDGE_TTS_BOY_VOICE_CONFIG: EdgeTtsBoyVoiceConfig = {
  voice: 'zh-CN-YunxiNeural',
  lang: 'zh-CN',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
  rate: '-8%',
  pitch: '+24%',
  volume: 'default',
  timeout: 10000,
};
