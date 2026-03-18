# Edge-TTS 测试与性能评估（开发环境）

## 1. 测试目标

- 接口可用：中文文本可合成 mp3 并返回可播放 URL
- 缓存有效：相同文本与参数第二次请求命中缓存
- 性能目标：命中缓存的请求响应时间 <= 1 秒

## 2. 覆盖场景

- 短文本：问候语
- 中文本：短句多标点
- 长文本：多句组合

## 3. 复现步骤

1) 启动开发服务器：

```bash
npm run dev
```

2) 发起合成请求（首次）：

```bash
curl -s -X POST http://127.0.0.1:5173/api/edge-tts \
  -H 'Content-Type: application/json' \
  -d '{"text":"你好，小朋友，我是小尾巴！","config":{"voice":"zh-CN-YunxiNeural","rate":"+5%","pitch":"+12%","volume":"default"}}'
```

3) 再次请求同样参数（应命中缓存）：

```bash
curl -s -X POST http://127.0.0.1:5173/api/edge-tts \
  -H 'Content-Type: application/json' \
  -d '{"text":"你好，小朋友，我是小尾巴！","config":{"voice":"zh-CN-YunxiNeural","rate":"+5%","pitch":"+12%","volume":"default"}}'
```

## 4. 结果示例

- 首次：`cached=false`，耗时可能受网络影响
- 二次：`cached=true`，应接近 0~几十毫秒

## 5. 自检脚本

```bash
npm run test
```

该脚本将：
- 生成多条中文样本音频到 `.cache/edge-tts-selftest`
- 校验第二次命中缓存
- 校验命中缓存耗时 <= 1000ms

