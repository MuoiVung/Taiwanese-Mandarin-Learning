import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatResponse } from '../types';
import { Mic, Send, Volume2, Lightbulb } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

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
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          const content = msg.content;
          
          if (isAi && typeof content !== 'string') {
            const aiContent = content as ChatResponse;
            return (
              <div key={msg.id} className="flex flex-col items-start max-w-[90%]">
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-md border border-slate-100 text-slate-800 w-full">
                   {/* Feedback Section */}
                   {aiContent.feedback && (
                    <div className="mb-3 pb-2 border-b border-slate-100 text-sm text-slate-500 italic">
                      <span className="font-semibold text-teal-600 mr-1">Feedback:</span>
                      {aiContent.feedback}
                    </div>
                  )}

                  {/* Main Script */}
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="text-xl font-bold font-serif text-slate-900 leading-relaxed">
                      {aiContent.script}
                    </h3>
                    <button 
                      onClick={() => playAudio(aiContent.script)}
                      className="p-1 text-slate-400 hover:text-teal-600 transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                  
                  {/* Pinyin */}
                  <p className="text-teal-600 font-medium text-sm mb-2">{aiContent.pinyin}</p>
                  
                  {/* Translation */}
                  <p className="text-slate-600 text-sm">{aiContent.translation}</p>

                  {/* Suggestion (Optional) */}
                  {aiContent.suggestion && (
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200">
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mb-1">
                        <Lightbulb size={12} />
                        <span>Gợi ý trả lời:</span>
                      </div>
                      <p className="text-slate-500 text-xs italic">{aiContent.suggestion}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-teal-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-md max-w-[85%]">
                  <p className="text-base">{typeof content === 'string' ? content : ''}</p>
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
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 sm:p-4">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <button
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Mic size={24} />
          </button>
          
          <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 flex items-center focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu trả lời của bạn..."
              rows={1}
              className="w-full bg-transparent border-none focus:outline-none resize-none max-h-32 text-slate-800 placeholder-slate-400"
              style={{ minHeight: '24px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-all shadow-lg shadow-teal-200"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};