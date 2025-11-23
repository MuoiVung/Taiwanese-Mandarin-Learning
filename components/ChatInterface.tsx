import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatResponse, Segment } from '../types';
import { Mic, Send, Volume2, Lightbulb, StopCircle, Eye, EyeOff, Languages, ChevronRight } from 'lucide-react';

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
  const [showPinyin, setShowPinyin] = useState(false); // Global toggle for full Pinyin
  const [showTranslation, setShowTranslation] = useState(true); // Global toggle for Translation
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null); // Track which word is clicked

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Debug Voices
  useEffect(() => {
    const logVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // console.log("Voices loaded");
      }
    };
    window.speechSynthesis.onvoiceschanged = logVoices;
    logVoices();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, showPinyin, showTranslation, selectedSegmentId]);

  // Auto-play functionality
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'ai' && typeof lastMsg.content !== 'string') {
      const content = lastMsg.content as ChatResponse;
      const timer = setTimeout(() => {
        playAudio(content.script);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Initialize Speech Recognition logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'zh-TW';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            setInput(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        
        // Handle specific errors for user feedback
        if (event.error === 'not-allowed') {
            alert("Lỗi: Trình duyệt không được cấp quyền truy cập Micro.\n\nTrên Mac: Vào System Settings > Privacy & Security > Microphone và cấp quyền cho trình duyệt.");
        } else if (event.error === 'no-speech') {
            // Silently fail or show toast
        } else if (event.error === 'network') {
            alert("Lỗi kết nối mạng. Vui lòng kiểm tra internet.");
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    };
  }, []);

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      window.speechSynthesis.cancel();
      onSendMessage(input);
      setInput('');
      setSelectedSegmentId(null); // Reset selection
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    window.speechSynthesis.cancel();
    
    if (!recognitionRef.current) {
        alert("Trình duyệt của bạn không hỗ trợ nhập liệu bằng giọng nói. Vui lòng dùng Chrome hoặc Edge mới nhất.");
        return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition:", e);
        // Sometimes restarting the instance helps if it got stuck
        setIsListening(false);
      }
    }
  };

  const getBestVoice = (voices: SpeechSynthesisVoice[]) => {
    const zhVoices = voices.filter(v => v.lang.toLowerCase().includes('zh'));
    
    // Priority 1: Microsoft Edge Natural Voices (Taiwan)
    const msNaturalTw = zhVoices.find(v => 
      v.name.includes('HsiaoChen') || v.name.includes('YunJhe')
    );
    if (msNaturalTw) return msNaturalTw;

    // Priority 2: Google Chrome Standard Voice (Taiwan)
    const googleTw = zhVoices.find(v => 
      v.name.includes('Google') && (v.lang.includes('TW') || v.name.includes('台灣'))
    );
    if (googleTw) return googleTw;

    // Priority 3: Microsoft Online
    const msOnline = zhVoices.find(v => 
      v.name.includes('Microsoft') && v.name.includes('Online')
    );
    if (msOnline) return msOnline;

    // Priority 4: Apple
    const appleTw = zhVoices.find(v => v.name.includes('Mei-Jia'));
    if (appleTw) return appleTw;
    
    // Priority 5: Fallback
    const stdTw = zhVoices.find(v => v.lang === 'zh-TW' || v.lang === 'zh_TW');
    if (stdTw) return stdTw;

    const stdCn = zhVoices.find(v => v.lang === 'zh-CN' || v.lang === 'zh_CN');
    if (stdCn) return stdCn;

    return zhVoices[0];
  };

  const playAudio = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = getBestVoice(voices);

    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    
    utterance.lang = bestVoice ? bestVoice.lang : 'zh-TW';
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

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedSegmentId && !(event.target as Element).closest('.interactive-segment')) {
        setSelectedSegmentId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedSegmentId]);


  return (
    <div className="flex flex-col h-full bg-slate-50 w-full overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-8 w-full max-w-5xl mx-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          const content = msg.content;
          
          if (isAi && typeof content !== 'string') {
            const aiContent = content as ChatResponse;
            const segments = aiContent.segments || [{ text: aiContent.script, pinyin: aiContent.pinyin, meaning: aiContent.translation }];

            return (
              <div key={msg.id} className="flex flex-col items-start w-full">
                {/* AI Identifier */}
                <div className="text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">TW Companion</div>
                
                <div className="bg-white rounded-2xl rounded-tl-none p-0 shadow-md border border-slate-100 text-slate-800 w-full max-w-3xl overflow-visible">
                   
                   {/* Tool/Feedback Bar */}
                   <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 bg-slate-50/50 rounded-t-2xl">
                      {/* Feedback */}
                      <div className="text-sm text-slate-500 italic flex-1 mr-4">
                        {aiContent.feedback && aiContent.feedback !== 'Hao bang!' && (
                          <span className="text-amber-600 font-medium">✨ {aiContent.feedback}</span>
                        )}
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setShowPinyin(!showPinyin)}
                          className={`p-2 rounded-lg transition-colors ${showPinyin ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Toggle Full Pinyin"
                        >
                          <div className="text-[10px] font-bold leading-none mb-0.5">ā</div>
                          {showPinyin ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button 
                          onClick={() => setShowTranslation(!showTranslation)}
                          className={`p-2 rounded-lg transition-colors ${showTranslation ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Toggle Translation"
                        >
                           <Languages size={18} />
                        </button>
                        <button 
                          onClick={() => isPlaying ? stopAudio() : playAudio(aiContent.script)}
                          className={`p-2 rounded-lg transition-colors ${isPlaying ? 'text-teal-600 bg-teal-50 animate-pulse' : 'text-slate-400 hover:text-teal-600'}`}
                        >
                          {isPlaying ? <StopCircle size={18} /> : <Volume2 size={18} />}
                        </button>
                      </div>
                   </div>

                  <div className="p-5 md:p-6">
                    {/* Main Script with Interactive Segments */}
                    <div className="flex flex-wrap items-end gap-x-1 gap-y-2 mb-3 leading-relaxed relative z-0">
                       {segments.map((seg, idx) => {
                         const segmentId = `${msg.id}-${idx}`;
                         const isSelected = selectedSegmentId === segmentId;
                         
                         return (
                           <span 
                             key={idx}
                             className={`interactive-segment relative cursor-pointer px-1 -mx-1 rounded transition-colors duration-200 group
                               ${isSelected ? 'bg-slate-800 text-white z-20' : 'hover:bg-teal-50 text-slate-900'}
                             `}
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedSegmentId(isSelected ? null : segmentId);
                               if (!isSelected) {
                                 // Optional: Play audio for individual word
                                 // const u = new SpeechSynthesisUtterance(seg.text);
                                 // u.lang = 'zh-TW';
                                 // window.speechSynthesis.speak(u);
                               }
                             }}
                           >
                             <span className="text-2xl md:text-3xl font-serif font-bold">
                               {seg.text}
                             </span>
                             
                             {/* Popover / Tooltip */}
                             {isSelected && (
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[200px] z-50">
                                  <div className="bg-slate-900 text-white text-sm rounded-xl py-3 px-4 shadow-xl flex flex-col items-center gap-1 animate-in fade-in zoom-in duration-200">
                                     <div className="font-bold text-lg leading-none">{seg.text}</div>
                                     <div className="text-teal-400 font-medium">{seg.pinyin}</div>
                                     <div className="text-slate-300 text-xs border-t border-slate-700 pt-1 mt-1">{seg.meaning}</div>
                                     {/* Tooltip Arrow */}
                                     <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45"></div>
                                  </div>
                               </div>
                             )}
                           </span>
                         );
                       })}
                    </div>
                    
                    {/* Full Pinyin Line */}
                    {showPinyin && (
                       <p className="text-teal-600 font-medium text-lg mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                         {aiContent.pinyin}
                       </p>
                    )}
                    
                    {/* Translation Line */}
                    {showTranslation && (
                      <p className="text-slate-600 text-base border-t border-dashed border-slate-200 pt-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        {aiContent.translation}
                      </p>
                    )}

                    {/* Suggestion */}
                    {aiContent.suggestion && (
                      <div className="mt-4 pt-3">
                        <div className="flex items-center gap-2 text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">
                          <Lightbulb size={14} />
                          <span>Gợi ý trả lời</span>
                        </div>
                        <button 
                           onClick={() => setInput(aiContent.suggestion || '')}
                           className="text-left text-slate-600 text-sm md:text-base italic bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-100 transition-colors w-full group flex items-center justify-between"
                        >
                          <span>"{aiContent.suggestion}"</span>
                          <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                        </button>
                      </div>
                    )}
                  </div>
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
            <span>Đang soạn tin...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-white border-t border-slate-200 p-4 md:p-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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