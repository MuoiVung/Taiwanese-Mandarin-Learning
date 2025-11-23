
import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatResponse } from '../types';
import { Mic, Send, Volume2, Lightbulb, StopCircle } from 'lucide-react';

interface Props {
  messages: Message[];
  isProcessing: boolean;
  onSendMessage: (text: string) => void;
}

// Add types for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const ChatInterface: React.FC<Props> = ({ messages, isProcessing, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Debug Voices: Log available voices to help user identify what's available
  useEffect(() => {
    const logVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.group("🎤 TTS Debug: Available Voices");
        const zhVoices = voices.filter(v => v.lang.toLowerCase().includes('zh'));
        console.log("🇨🇳 All Chinese Voices:", zhVoices.map(v => `[${v.lang}] ${v.name} ${v.default ? '(Default)' : ''}`));
        console.groupEnd();
      }
    };

    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = logVoices;
    logVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Auto-play functionality
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'ai' && typeof lastMsg.content !== 'string') {
      const content = lastMsg.content as ChatResponse;
      // Short timeout to ensure UI is rendered and doesn't conflict with incoming sound
      const timer = setTimeout(() => {
        playAudio(content.script);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'zh-TW'; // Taiwanese Mandarin
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      }
    }
  }, []);

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      // Stop any playing audio when user sends a message
      window.speechSynthesis.cancel();
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    // Stop audio if user wants to speak
    window.speechSynthesis.cancel();
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  // 2. Smart Voice Selection Logic
  const getBestVoice = (voices: SpeechSynthesisVoice[]) => {
    const zhVoices = voices.filter(v => v.lang.toLowerCase().includes('zh'));
    
    // Priority 1: Microsoft Edge Natural Voices (Taiwan)
    // "HsiaoChen" is the female natural voice, "YunJhe" is male natural voice
    const msNaturalTw = zhVoices.find(v => 
      v.name.includes('HsiaoChen') || v.name.includes('YunJhe')
    );
    if (msNaturalTw) return msNaturalTw;

    // Priority 2: Google Chrome Standard Voice (Taiwan)
    // Usually named "Google 國語 (台灣)" or "Google zh-TW"
    const googleTw = zhVoices.find(v => 
      v.name.includes('Google') && (v.lang.includes('TW') || v.name.includes('台灣'))
    );
    if (googleTw) return googleTw;

    // Priority 3: Any Microsoft Online Voice (High Quality)
    // Fallback for other MS voices if specific TW natural ones aren't found
    const msOnline = zhVoices.find(v => 
      v.name.includes('Microsoft') && v.name.includes('Online')
    );
    if (msOnline) return msOnline;

    // Priority 4: iOS/macOS (Mei-Jia is the standard high quality TW voice)
    const appleTw = zhVoices.find(v => v.name.includes('Mei-Jia'));
    if (appleTw) return appleTw;
    
    // Priority 5: Standard System TW Voice
    const stdTw = zhVoices.find(v => v.lang === 'zh-TW' || v.lang === 'zh_TW');
    if (stdTw) return stdTw;

    // Priority 6: Fallback to CN voice if no TW voice exists
    // Try to find a voice that might be female/neutral
    const stdCn = zhVoices.find(v => v.lang === 'zh-CN' || v.lang === 'zh_CN');
    if (stdCn) return stdCn;

    // Last resort: Any Chinese voice
    return zhVoices[0];
  };

  const playAudio = (text: string) => {
    window.speechSynthesis.cancel(); // Stop previous

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = getBestVoice(voices);

    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    
    // Ensure the lang is set to the voice's lang or default to zh-TW
    utterance.lang = bestVoice ? bestVoice.lang : 'zh-TW';
    
    // 3. Natural Rate
    utterance.rate = 0.9; 
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative w-full overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-8 pb-32 w-full max-w-5xl mx-auto">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          const content = msg.content;
          
          if (isAi && typeof content !== 'string') {
            const aiContent = content as ChatResponse;
            return (
              <div key={msg.id} className="flex flex-col items-start w-full">
                {/* AI Avatar or Identifier */}
                <div className="text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">TW Companion</div>
                
                <div className="bg-white rounded-2xl rounded-tl-none p-5 md:p-6 shadow-md border border-slate-100 text-slate-800 w-full max-w-3xl">
                   {/* Feedback Section */}
                   {aiContent.feedback && (
                    <div className="mb-4 pb-3 border-b border-slate-100 text-sm md:text-base text-slate-500 italic bg-amber-50/50 -mx-5 md:-mx-6 -mt-5 md:-mt-6 p-5 md:p-6 rounded-t-2xl">
                      <span className="font-semibold text-amber-600 mr-2">Feedback:</span>
                      {aiContent.feedback}
                    </div>
                  )}

                  {/* Main Script */}
                  <div className="flex items-start gap-4 mb-3">
                    <h3 className="text-xl md:text-2xl font-bold font-serif text-slate-900 leading-relaxed flex-1">
                      {aiContent.script}
                    </h3>
                    <button 
                      onClick={() => isPlaying ? stopAudio() : playAudio(aiContent.script)}
                      className="shrink-0 p-3 rounded-full bg-slate-100 text-teal-600 hover:bg-teal-100 transition-colors shadow-sm"
                      title="Play Audio"
                    >
                      {isPlaying ? <StopCircle size={24} className="animate-pulse" /> : <Volume2 size={24} />}
                    </button>
                  </div>
                  
                  {/* Pinyin */}
                  <p className="text-teal-600 font-medium text-base md:text-lg mb-2">{aiContent.pinyin}</p>
                  
                  {/* Translation */}
                  <p className="text-slate-600 text-sm md:text-base">{aiContent.translation}</p>

                  {/* Suggestion (Optional) */}
                  {aiContent.suggestion && (
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                      <div className="flex items-center gap-2 text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">
                        <Lightbulb size={14} />
                        <span>Gợi ý trả lời</span>
                      </div>
                      <p className="text-slate-600 text-sm md:text-base italic bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block">
                        "{aiContent.suggestion}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="flex justify-end w-full">
                <div className="bg-teal-600 text-white rounded-2xl rounded-tr-none px-6 py-4 shadow-md max-w-[85%] md:max-w-2xl word-break-break-word">
                  <p className="text-base md:text-lg leading-relaxed">{typeof content === 'string' ? content : ''}</p>
                </div>
              </div>
            );
          }
        })}
        {isProcessing && (
          <div className="flex items-center gap-2 text-slate-400 text-sm italic ml-4">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span>Đang trả lời...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:p-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-end gap-3 md:gap-4">
          <button
            onClick={toggleListening}
            className={`p-4 rounded-full transition-all shrink-0 ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Mic size={24} />
          </button>
          
          <div className="flex-1 bg-slate-100 rounded-2xl px-5 py-3 flex items-center focus-within:ring-2 focus-within:ring-teal-500 transition-all border border-transparent focus-within:border-teal-500 focus-within:bg-white">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="w-full bg-transparent border-none focus:outline-none resize-none max-h-32 text-slate-800 placeholder-slate-400 text-base md:text-lg"
              style={{ minHeight: '28px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-all shadow-lg shadow-teal-100 shrink-0 flex items-center justify-center"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
