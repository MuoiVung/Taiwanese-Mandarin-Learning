
import React, { useState } from 'react';
import { AppStage, TOCFLLevel, Topic, VocabularyItem, Message } from './types';
import { generateTopics, generateVocabulary, sendChatMessage } from './services/geminiService';
import { LevelSelector } from './components/LevelSelector';
import { TopicSelector } from './components/TopicSelector';
import { VocabPrep } from './components/VocabPrep';
import { ChatInterface } from './components/ChatInterface';
import { 
  RefreshCcw, 
  LayoutDashboard, 
  MessageCircle, 
  BookA, 
  GraduationCap, 
  Menu
} from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState<AppStage>(AppStage.LEVEL_SELECTION);
  const [level, setLevel] = useState<TOCFLLevel>('A1');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [vocab, setVocab] = useState<VocabularyItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // History for Gemini context
  const [history, setHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);

  // Flow 1: Standard Path (Select Level -> Get Topic Suggestions)
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

  // Flow 2: Custom Topic Path (Enter Topic -> Select Level -> Jump to Vocab)
  const handleCustomStart = async (topicTitle: string, selectedLevel: TOCFLLevel) => {
    setLevel(selectedLevel);
    
    // Create a temporary topic object
    const customTopic: Topic = {
      id: Date.now(),
      title: topicTitle,
      vietnamese_title: topicTitle, 
      description: "Chủ đề tự chọn bởi người dùng"
    };

    setSelectedTopic(customTopic);
    setIsLoading(true);
    setStage(AppStage.VOCAB_PREP);
    
    try {
      const vocabulary = await generateVocabulary(selectedLevel, topicTitle);
      setVocab(vocabulary);
    } catch (error) {
      console.error("Error generating custom vocab:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async () => {
    setStage(AppStage.CONVERSATION);
    setIsLoading(true);
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
      const currentHistory = [...history];
      const response = await sendChatMessage(currentHistory, text, level, selectedTopic?.title || "");
      
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newAiMessage]);
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
    setSelectedTopic(null);
    setIsSidebarOpen(false);
  };

  // Sidebar Logic
  const NavItem = ({ active, icon: Icon, label, onClick, disabled }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center w-full p-3 rounded-lg mb-2 transition-all ${
        active 
          ? 'bg-teal-100 text-teal-800 font-semibold shadow-sm' 
          : disabled 
            ? 'opacity-50 cursor-not-allowed text-slate-400' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className="mr-3" />
      <span>{label}</span>
      {active && <div className="ml-auto w-2 h-2 rounded-full bg-teal-500" />}
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:relative z-30 flex flex-col w-72 h-full bg-white border-r border-slate-200 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 text-white p-2 rounded-lg">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 leading-tight">TW Mandarin</h1>
              <p className="text-xs text-slate-500">AI Tutor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Progress</div>
          
          <NavItem 
            icon={LayoutDashboard} 
            label="Bắt đầu" 
            active={stage === AppStage.LEVEL_SELECTION}
            onClick={handleReset}
          />
          <NavItem 
            icon={BookA} 
            label="Chọn chủ đề" 
            active={stage === AppStage.TOPIC_GENERATION || stage === AppStage.TOPIC_SELECTION}
            disabled={stage === AppStage.LEVEL_SELECTION || selectedTopic?.description === "Chủ đề tự chọn bởi người dùng"}
          />
          <NavItem 
            icon={BookA} 
            label="Từ vựng" 
            active={stage === AppStage.VOCAB_PREP}
            disabled={stage === AppStage.LEVEL_SELECTION || !selectedTopic}
          />
          <NavItem 
            icon={MessageCircle} 
            label="Hội thoại" 
            active={stage === AppStage.CONVERSATION}
            disabled={stage !== AppStage.CONVERSATION}
          />
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          {selectedTopic && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 mb-1 uppercase font-bold">Current Topic</div>
              <div className="text-sm font-medium text-slate-800 truncate">{selectedTopic.title}</div>
              <div className="text-xs text-slate-500 truncate">{selectedTopic.vietnamese_title}</div>
            </div>
          )}
          <button 
            onClick={handleReset}
            className="flex items-center justify-center w-full p-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <RefreshCcw size={16} className="mr-2" />
            Bắt đầu lại
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800">TW Mandarin AI</span>
          <div className="w-10"></div> {/* Spacer for balance */}
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-hidden relative">
          {stage === AppStage.LEVEL_SELECTION && (
            <LevelSelector 
              onSelect={handleLevelSelect} 
              onCustomStart={handleCustomStart}
            />
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
        </div>
      </main>
    </div>
  );
}
