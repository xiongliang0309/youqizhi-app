# Edge-TTS（小尾巴男童音）集成说明

本项目在开发环境下通过 `node-edge-tts` 调用 Microsoft Edge 在线语音服务，实现文本到语音（TTS）合成，并用于首页吉祥物“小尾巴”的播报。

## 1. API 说明

### `POST /api/edge-tts`

请求体（JSON）：

```json
{
  "text": "你好，小朋友，我是小尾巴...",
  "config": {
    "voice": "zh-CN-YunxiNeural",
    "lang": "zh-CN",
    "outputFormat": "audio-24khz-48kbitrate-mono-mp3",
    "rate": "+5%",
    "pitch": "+12%",
    "volume": "default",
    "timeout": 10000
  }
}
```

响应体（JSON）：

```json
{
  "url": "/_edge_tts_cache/<hash>.mp3",
  "cacheKey": "<sha256>",
  "cached": true,
  "tookMs": 12
}
```

说明：
- `url` 为可直接播放的 mp3 地址。
- `cached` 表示是否命中缓存。

## 2. 男童音配置

默认男童音配置位于：
- `src/tts/edgeTtsBoyVoiceConfig.ts`

可在前端调用 `edgeTtsSpeak(text, options)` 时覆盖：
- `voice`：指定音色（默认 `zh-CN-YunxiNeural`）
- `rate`：语速（例如 `-10%`、`+10%`）
- `pitch`：音调（例如 `+12%`）
- `volume`：播放音量（前端播放器音量 0~1）

为了让儿童听感更友好，前端播放阶段还会做轻量音频处理：
- 2~4kHz 轻微增强提升清晰度
- 高于 9~10kHz 轻微削峰降低刺耳感
- 轻微混响提升温暖空间感
- 动态压缩抑制尖锐峰值

## 3. 缓存机制

服务端缓存目录：
- `.cache/edge-tts`

缓存 key：
- 基于 `text + voice + rate + pitch + outputFormat` 的 sha256

命中缓存时，接口将直接返回已有文件 URL，避免重复合成。

## 4. 自检与性能验证

执行自检（会生成缓存文件）：

```bash
npm run test
```

自检内容：
- 不同长度中文文本合成
- 第二次调用命中缓存
- 命中缓存耗时 <= 1000ms

注意：首次合成速度受网络影响，主要通过“缓存后秒级响应”来保证交互流畅。
