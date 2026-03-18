import { useCallback, useState, useEffect, useRef } from 'react';
import { AzureTTS } from '../services/AzureTTS';

export type SpeechVoiceHint = 'boy' | 'girl' | 'male' | 'female';

export type SpeakOptions = {
  voiceHint?: SpeechVoiceHint;
};

/**
 * 封装浏览器原生的 SpeechSynthesis API，用于文本朗读
 * 升级：支持 Azure Cognitive Services 云端语音
 */
export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const azureTTS = useRef(AzureTTS.getInstance());
  
  // 停止播放的引用，用于在组件卸载或切换时打断
  const stopRef = useRef<(() => void) | null>(null);

  const speak = useCallback(async (text: string, style: string = 'cheerful', options: SpeakOptions = {}) => {
    // 1. 尝试使用 Azure 云端语音
    if (azureTTS.current.isAvailable()) {
        try {
            // 停止之前的播放
            cancel();
            
            setIsSpeaking(true);
            stopRef.current = () => azureTTS.current.stop();
            
            const voiceHint = options.voiceHint;
            const role = voiceHint === 'boy' || voiceHint === 'male' ? 'Boy' : voiceHint === 'girl' || voiceHint === 'female' ? 'Girl' : undefined;
            const voiceName = voiceHint === 'boy' || voiceHint === 'male'
              ? 'zh-CN-YunxiNeural'
              : voiceHint === 'girl' || voiceHint === 'female'
                ? 'zh-CN-XiaoxiaoNeural'
                : undefined;

            await azureTTS.current.speak(text, style, role, voiceName);
            
            setIsSpeaking(false);
            stopRef.current = null;
            return;
        } catch (e) {
            console.warn('Azure TTS failed, falling back to local TTS:', e);
            // 降级到本地
        }
    }

    // 2. 本地语音回退逻辑 (原逻辑)
    if (!('speechSynthesis' in window)) {
      console.warn('当前浏览器不支持语音合成功能');
      return;
    }

    // 每次朗读前重新获取最新的语音列表
    const voices = window.speechSynthesis.getVoices();

    // 优先选择更自然、更适合儿童的语音包
    // 根据需求调整为：优先匹配男童音色 (Boy Voice)
    const preferredVoices = options.voiceHint === 'boy' || options.voiceHint === 'male'
      ? [
          'Microsoft Yunxi Online (Natural)',
          'Microsoft Yunyang Online (Natural)',
          'Microsoft Xiaoxiao Online (Natural)',
          'Google 普通话（中国大陆）',
          'zh-CN',
        ]
      : [
          'Microsoft Xiaoxiao Online (Natural)',
          'Microsoft Yaoyao Online (Natural)',
          'Microsoft Yunxi Online (Natural)',
          'Google 普通话（中国大陆）',
          'zh-CN',
        ];

    let selectedVoice: SpeechSynthesisVoice | null = null;
    
    for (const pref of preferredVoices) {
        const found = voices.find(v => v.name.includes(pref) || v.lang === pref);
        if (found) {
            selectedVoice = found;
            break;
        }
    }

    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN')) || null;
    }

    window.speechSynthesis.cancel(); // 停止当前

    // --- 核心优化：智能分句与情感化处理 ---
    // 将长文本按标点符号切分为句子队列
    // 支持：逗号、句号、问号、感叹号、分号
    const sentences = text.match(/[^,，。.?？!！;；]+[,，。.?？!！;；]?/g) || [text];

    let currentIndex = 0;
    let isCancelled = false;

    // 注册停止回调
    stopRef.current = () => {
        isCancelled = true;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const playNextSentence = () => {
        if (isCancelled || currentIndex >= sentences.length) {
            setIsSpeaking(false);
            stopRef.current = null;
            return;
        }

        const sentence = sentences[currentIndex];
        const utterance = new SpeechSynthesisUtterance(sentence);
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.lang = 'zh-CN';

        // 基础参数
        let rate = 1.0;
        let pitch = 1.0;

        if (options.voiceHint === 'boy' || options.voiceHint === 'male') {
            if (selectedVoice?.name.includes('Yunxi') || selectedVoice?.name.includes('Yunyang')) {
                rate = 1.05;
                pitch = 1.3;
            } else if (selectedVoice?.name.includes('Microsoft') || selectedVoice?.name.includes('Google')) {
                rate = 1.03;
                pitch = 1.22;
            } else {
                rate = 1.0;
                pitch = 1.2;
            }
        } else {
            if (selectedVoice?.name.includes('Microsoft')) {
                rate = 1.05;
                pitch = 1.18;
            } else if (selectedVoice?.name.includes('Google')) {
                rate = 1.03;
                pitch = 1.15;
            } else {
                rate = 1.0;
                pitch = 1.12;
            }
        }

        // --- 情感微调 (Heuristic) ---
        // 根据标点符号和关键词微调当前句子的语调和语速，增强拟人化
        const lastChar = sentence.trim().slice(-1);

        if (lastChar === '?' || lastChar === '？' || sentence.includes('吗') || sentence.includes('呢')) {
            // 疑问句：语调上扬，显得好奇
            pitch *= 1.1;
            rate *= 1.05;
        } else if (lastChar === '!' || lastChar === '！') {
            // 感叹句：语调高昂，显得活泼、兴奋
            pitch *= 1.15;
            rate *= 1.1;
        } else if (lastChar === ',' || lastChar === '，') {
            // 逗号：保持平稳，略微停顿感
            pitch *= 1.02; 
        } else if (lastChar === '.' || lastChar === '。') {
            // 句号：语调自然降落，表示结束
            pitch *= 0.95;
            rate *= 0.95;
        }

        utterance.rate = Math.min(Math.max(rate, 0.5), 1.5);
        utterance.pitch = Math.min(Math.max(pitch, 0.5), 1.6);

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            // 句子间停顿控制 (拟人化呼吸节奏)
            let pauseTime = 0;
            if (lastChar === ',' || lastChar === '，') pauseTime = 300; // 短呼吸
            else if (lastChar === '.' || lastChar === '。') pauseTime = 600; // 长呼吸/换气
            else if (lastChar === '?' || lastChar === '？') pauseTime = 800; // 期待回答的停顿
            else if (lastChar === '!' || lastChar === '！') pauseTime = 500; // 情绪释放后的停顿
            
            setTimeout(() => {
                currentIndex++;
                playNextSentence();
            }, pauseTime);
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    // 开始播放第一句
    playNextSentence();

  }, []);

  const cancel = useCallback(() => {
    if (stopRef.current) {
        stopRef.current();
    }
    // 双重保险
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    AzureTTS.getInstance().stop();
    setIsSpeaking(false);
  }, []);

  // 组件卸载时取消语音
  useEffect(() => {
    return () => {
        cancel();
    };
  }, [cancel]);

  return { speak, cancel, isSpeaking };
};
