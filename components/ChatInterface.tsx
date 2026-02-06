
import React, { useState, useRef, useEffect } from 'react';
import { generateStructuralAnalysis, analyzeGeologicalImage } from '../services/gemini';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Himalayan Sentinel AI online. Upload a cross-section or ask about seismic hazards.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateStructuralAnalysis(input, thinking);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Analysis failed. Please check network connectivity.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setMessages(prev => [...prev, { role: 'user', content: `Analyzed file: ${file.name}`, type: 'image', mediaUrl: event.target?.result as string }]);
      
      try {
        const analysis = await analyzeGeologicalImage(base64, "Analyze this geological structure/map and provide tectonic insights.");
        setMessages(prev => [...prev, { role: 'assistant', content: analysis }]);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Error processing image data." }]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-96">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-xs uppercase tracking-widest text-blue-400">Intelligence Link</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Thinking Mode</span>
          <input 
            type="checkbox" 
            checked={thinking} 
            onChange={(e) => setThinking(e.target.checked)}
            className="w-3 h-3 rounded bg-slate-800 border-slate-700 checked:bg-blue-600"
          />
        </label>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100'
            }`}>
              {msg.mediaUrl && <img src={msg.mediaUrl} className="mb-2 rounded max-w-full" alt="upload" />}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 rounded-lg p-3 text-sm animate-pulse">
              Computing tectonic models...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            accept="image/*"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400"
          >
            󰄄
          </button>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query orogenic dynamics..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-2 rounded-lg text-white"
          >
            󰒊
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
