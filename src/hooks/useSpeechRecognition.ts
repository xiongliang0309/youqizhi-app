import { useState, useCallback, useRef } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export function useSpeechRecognition(lang: string = 'en-US') {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [hasError, setHasError] = useState(false); // 新增状态，用于标记是否发生错误或没听清
  
  const recognitionRef = useRef<any>(null);
  const shouldBeRecording = useRef(false); // 增加一个标志位，用于防抖和防止幽灵事件

  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onstart = () => {
      // 只有在期望录音时才设置为 true，防止由于快速点击导致 onstart 晚于 stop() 触发
      if (shouldBeRecording.current) {
        setIsRecording(true);
        setHasError(false);
      } else {
        try { recognition.stop(); } catch(e) {}
      }
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0];
      setTranscript(result.transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      shouldBeRecording.current = false;
      setHasError(true);
    };

    recognition.onend = () => {
      // 只有在没发生错误，且也没有拿到识别结果，且本来处于录音状态时，才认为是"没听清"
      if (!hasError && !transcript && isRecording) {
        setHasError(true);
      }
      setIsRecording(false);
      shouldBeRecording.current = false;
    };

    return recognition;
  }, [lang]);

  const startRecording = useCallback(() => {
    // 防止重复调用 start 导致的 DOMException (Failed to execute 'start' on 'SpeechRecognition': recognition has already started.)
    if (shouldBeRecording.current || isRecording) {
      return;
    }
    
    shouldBeRecording.current = true;
    setTranscript('');
    setHasError(false);
    setIsRecording(true); // 立即更新UI状态，提供快速反馈
    
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error: any) {
        // 如果是因为正在运行导致的错误，我们可以忽略它，如果是其他错误则需要重置状态
        if (error.name === 'InvalidStateError') {
          console.warn('Speech recognition is already running, stopping and restarting...');
          try {
            recognitionRef.current.stop();
          } catch(e) {}
        } else {
          console.error('Failed to start recording:', error);
          setIsRecording(false);
          shouldBeRecording.current = false;
          setHasError(true);
        }
      }
    }
  }, [initRecognition, isRecording]);

  const stopRecording = useCallback(() => {
    if (!shouldBeRecording.current && !isRecording) {
      return;
    }
    
    shouldBeRecording.current = false;
    
    // 如果停止时还没有结果，就手动标记一下
    if (!transcript) {
      setHasError(true);
    }
    
    setIsRecording(false); // 立即更新UI状态，防止松开后仍然显示"正在听你说"
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Failed to stop recording:', error);
      }
    }
  }, [isRecording, transcript]);

  return {
    isRecording,
    transcript,
    isSupported,
    hasError,
    startRecording,
    stopRecording
  };
}
