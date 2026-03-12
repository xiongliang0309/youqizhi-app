import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

/**
 * Azure 语音合成服务封装
 */
export class AzureTTS {
  private static instance: AzureTTS;
  private synthesizer: sdk.SpeechSynthesizer | null = null;
  private player: sdk.SpeakerAudioDestination | null = null;
  
  // 默认配置：使用最自然的晓晓语音
  private config = {
    // 实际使用时，请替换为您自己的 Azure Speech Key 和 Region
    // 免费层级 (F0) 每月有 50万字符额度，足够开发测试
    subscriptionKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '', 
    serviceRegion: import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastasia', // 或 'westus' 等
    voiceName: 'zh-CN-XiaoxiaoNeural',
    style: 'cheerful', // 默认欢快风格
  };

  private constructor() {}

  public static getInstance(): AzureTTS {
    if (!AzureTTS.instance) {
      AzureTTS.instance = new AzureTTS();
    }
    return AzureTTS.instance;
  }

  /**
   * 初始化合成器
   */
  public init(key: string, region: string) {
    this.config.subscriptionKey = key;
    this.config.serviceRegion = region;
    this.recreateSynthesizer();
  }

  private recreateSynthesizer() {
    if (!this.config.subscriptionKey) return;

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      this.config.subscriptionKey,
      this.config.serviceRegion
    );
    
    speechConfig.speechSynthesisVoiceName = this.config.voiceName;
    
    // 创建音频播放器
    this.player = new sdk.SpeakerAudioDestination();
    const audioConfig = sdk.AudioConfig.fromSpeakerOutput(this.player);

    this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  }

  /**
   * 停止播放
   */
  public stop() {
    if (this.player) {
      this.player.pause();
    }
    if (this.synthesizer) {
      // close() 会释放资源，下次需要重新创建
      // 这里暂时只做 player 级别的暂停
      // this.synthesizer.close(); 
    }
  }

  /**
   * 朗读文本 (支持 SSML)
   * @param text 文本内容
   * @param style 情感风格 (cheerful, sad, story, etc.)
   * @param role 角色 (Girl, Boy, etc.)
   */
  public speak(text: string, style: string = 'cheerful', role?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesizer) {
        // 如果没有 Key，拒绝执行（外层应降级到本地 TTS）
        reject(new Error('Azure TTS not initialized'));
        return;
      }

      // 构建 SSML 以支持情感和角色
      // 详见: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-structure
      let ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">
          <voice name="${this.config.voiceName}">
            <mstts:express-as style="${style}" ${role ? `role="${role}"` : ''}>
              ${text}
            </mstts:express-as>
          </voice>
        </speak>
      `;

      this.synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve();
          } else {
            reject(new Error(`Synthesis failed: ${result.errorDetails}`));
          }
          // 播放完成后，虽然 synthesizer 不需要 close，但可以清理一些状态
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  /**
   * 检查是否可用
   */
  public isAvailable(): boolean {
    return !!this.config.subscriptionKey;
  }
}
