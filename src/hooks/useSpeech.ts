import { useCallback, useState, useEffect, useRef } from 'react';
import { AzureTTS } from '../services/AzureTTS';

/**
 * 封装浏览器原生的 SpeechSynthesis API，用于文本朗读
 * 升级：支持 Azure Cognitive Services 云端语音
 */
export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const azureTTS = useRef(AzureTTS.getInstance());
  
  // 停止播放的引用，用于在组件卸载或切换时打断
  const stopRef = useRef<(() => void) | null>(null);

  const speak = useCallback(async (text: string, style: string = 'cheerful') => {
    // 1. 尝试使用 Azure 云端语音
    if (azureTTS.current.isAvailable()) {
        try {
            // 停止之前的播放
            cancel();
            
            setIsSpeaking(true);
            stopRef.current = () => azureTTS.current.stop();
            
            await azureTTS.current.speak(text, style);
            
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
    const preferredVoices = [
        'Microsoft Xiaoxiao Online (Natural)', // Edge 晓晓
        'Microsoft Yunxi Online (Natural)',    // Edge 云希
        'Google 普通话（中国大陆）',             // Chrome
        'Ting-Ting',                           // macOS
        'Sin-Ji',                              // macOS
        'zh-CN',                               // 通用 fallback
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

        // 针对不同语音微调基础参数
        if (selectedVoice?.name.includes('Microsoft')) {
            rate = 1.0; 
            pitch = 1.0; 
        } else {
            rate = 0.9; 
            pitch = 1.1; 
        }

        // --- 情感微调 (Heuristic) ---
        // 根据标点符号和关键词微调当前句子的语调和语速
        const lastChar = sentence.trim().slice(-1);

        if (lastChar === '?' || lastChar === '？' || sentence.includes('吗') || sentence.includes('呢')) {
            // 疑问句：语调上扬，语速稍快
            pitch *= 1.1;
            rate *= 1.05;
        } else if (lastChar === '!' || lastChar === '！') {
            // 感叹句：语调高昂，语速有力
            pitch *= 1.2;
            rate *= 1.1;
        } else if (lastChar === ',' || lastChar === '，') {
            // 逗号：保持平稳
        } else if (lastChar === '.' || lastChar === '。') {
            // 句号：语调略降，表示结束
            pitch *= 0.95;
            rate *= 0.95;
        }

        // 限制参数范围，避免失真
        utterance.rate = Math.min(Math.max(rate, 0.5), 2.0);
        utterance.pitch = Math.min(Math.max(pitch, 0.5), 2.0);

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            // 句子间停顿控制
            let pauseTime = 0;
            if (lastChar === ',' || lastChar === '，') pauseTime = 200; // 短停顿
            else if (lastChar === '.' || lastChar === '。') pauseTime = 500; // 长停顿
            else if (lastChar === '?' || lastChar === '？') pauseTime = 600; // 思考停顿
            else if (lastChar === '!' || lastChar === '！') pauseTime = 600; // 情绪停顿
            
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
