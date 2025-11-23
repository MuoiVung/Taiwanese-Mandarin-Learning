import React, { useState } from 'react';
import { AppStage, TOCFLLevel, Topic, VocabularyItem, Message, ChatResponse } from './types';
import { generateTopics, generateVocabulary, sendChatMessage } from './services/geminiService';
import { LevelSelector } from './components/LevelSelector';
import { TopicSelector } from './components/TopicSelector';
import { VocabPrep } from './components/VocabPrep';
import { ChatInterface } from './components/ChatInterface';
import { RefreshCcw } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState<AppStage>(AppStage.LEVEL_SELECTION);
  const [level, setLevel] = useState<TOCFLLevel>('A1');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [vocab, setVocab] = useState<VocabularyItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // History for Gemini context
  const [history, setHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);

  const handleLevelSelect = async (selectedLevel: TOCFLLevel) => {
    setLevel(selectedLevel);
    setStage(AppStage.TOPIC_GENERATION);
    setIsLoading(true);
    try {
      const generatedTopics = await generateTopics(selectedLevel);
      setTopics(generatedTopics);
      setStage(AppStage.TOPIC_SELECTION);
    } catch (error) {
      console.error(error);
      // Fallback or retry logic could go here
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setStage(AppStage.VOCAB_PREP);
    try {
      const vocabulary = await generateVocabulary(level, topic.title);
      setVocab(vocabulary);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async () => {
    setStage(AppStage.CONVERSATION);
    
    // Initial welcome message from AI
    // We mock this slightly to kickstart the UI, but we could also ask Gemini to generate the greeting.
    // To ensure "Reflex" training, we start by prompting the user to say hello or the AI greeting first.
    // Let's have the AI greet first based on the topic.
    
    setIsLoading(true);
    // We send a hidden system prompt to start the roleplay
    const startPrompt = "Hãy bắt đầu cuộc hội thoại với câu chào mừng phù hợp.";
    
    try {
      const response = await sendChatMessage([], startPrompt, level, selectedTopic?.title || "");
      
      const initialAiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        content: response,
        timestamp: Date.now(),
      };
      
      setMessages([initialAiMessage]);
      setHistory([
        { role: 'user', parts: [{ text: startPrompt }] },
        { role: 'model', parts: [{ text: JSON.stringify(response) }] }
      ]);
    } catch (error) {
      console.error("Failed to start chat", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Current history for the API call
      const currentHistory = [...history];
      
      const response = await sendChatMessage(currentHistory, text, level, selectedTopic?.title || "");
      
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newAiMessage]);
      
      // Update history
      setHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: text }] },
        { role: 'model', parts: [{ text: JSON.stringify(response) }] }
      ]);

    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStage(AppStage.LEVEL_SELECTION);
    setMessages([]);
    setHistory([]);
    setTopics([]);
    setVocab([]);
  };

  return (
    <div className="h-full w-full max-w-lg mx-auto bg-slate-50 flex flex-col shadow-2xl relative">
      {/* Header */}
      <header className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
        <div className="font-bold text-lg text-teal-700">TW Mandarin AI</div>
        {stage !== AppStage.LEVEL_SELECTION && (
          <button onClick={handleReset} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Start Over">
            <RefreshCcw size={18} />
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {stage === AppStage.LEVEL_SELECTION && (
          <LevelSelector onSelect={handleLevelSelect} />
        )}
        
        {(stage === AppStage.TOPIC_GENERATION || stage === AppStage.TOPIC_SELECTION) && (
          <TopicSelector 
            level={level} 
            topics={topics} 
            isLoading={stage === AppStage.TOPIC_GENERATION}
            onSelect={handleTopicSelect} 
          />
        )}

        {stage === AppStage.VOCAB_PREP && selectedTopic && (
          <VocabPrep 
            topic={selectedTopic} 
            vocab={vocab} 
            isLoading={isLoading} 
            onStart={startConversation} 
          />
        )}

        {stage === AppStage.CONVERSATION && (
          <ChatInterface 
            messages={messages} 
            isProcessing={isLoading} 
            onSendMessage={handleSendMessage} 
          />
        )}
      </main>
    </div>
  );
}