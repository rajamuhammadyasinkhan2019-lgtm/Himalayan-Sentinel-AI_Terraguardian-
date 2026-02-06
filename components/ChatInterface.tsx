
import React, { useState, useRef, useEffect } from 'react';
import { generateStructuralAnalysis, analyzeGeologicalImage, editTectonicImage } from '../services/gemini';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Himalayan Sentinel AI online. Upload a cross-section or ask about seismic hazards.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [lastUploadedImage, setLastUploadedImage] = useState<string | null>(null);
  
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
    
    // If we have a text input and a previously uploaded image, check if the user wants an edit
    const isEditRequest = lastUploadedImage && (
      input.toLowerCase().includes('edit') || 
      input.toLowerCase().includes('add') || 
      input.toLowerCase().includes('remove') || 
      input.toLowerCase().includes('filter') ||
      input.toLowerCase().includes('modify')
    );

    setInput('');
    setIsLoading(true);

    try {
      if (isEditRequest && lastUploadedImage) {
        const base64 = lastUploadedImage.split(',')[1];
        const editedImageUrl = await editTectonicImage(base64, input);
        if (editedImageUrl) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'Image modification complete. Structural visualization updated.', 
            type: 'image', 
            mediaUrl: editedImageUrl 
          }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: 'AI modification failed to generate image data.' }]);
        }
      } else {
        const response = await generateStructuralAnalysis(input, thinking);
        setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Intelligence link interrupted. Please retry.' }]);
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
      const imageUrl = event.target?.result as string;
      const base64 = imageUrl.split(',')[1];
      setLastUploadedImage(imageUrl);
      
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: `Uploaded structural data: ${file.name}`, 
        type: 'image', 
        mediaUrl: imageUrl 
      }]);
      
      try {
        const analysis = await analyzeGeologicalImage(base64, "Perform a comprehensive structural interpretation of this dataset. Identify faults, stratigraphic boundaries, and tectonic zones.");
        setMessages(prev => [...prev, { role: 'assistant', content: analysis }]);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Error processing multimodal image input." }]);
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
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Reasoning</span>
            <input 
              type="checkbox" 
              checked={thinking} 
              onChange={(e) => setThinking(e.target.checked)}
              className="w-3 h-3 rounded bg-slate-800 border-slate-700 checked:bg-blue-600 focus:ring-0"
            />
          </label>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100 border border-slate-700/50'
            }`}>
              {msg.mediaUrl && (
                <div className="mb-2 rounded overflow-hidden border border-white/10">
                  <img src={msg.mediaUrl} className="max-w-full" alt="tectonic data" />
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed text-[13px]">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 border border-slate-700/30 text-slate-400 rounded-lg p-3 text-xs animate-pulse">
              {thinking ? 'Deep reasoning engine active...' : 'Processing geoscience query...'}
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
            title="Upload geological imagery"
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
          >
            󰄄
          </button>
          <div className="relative flex-1">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={lastUploadedImage ? "Ask or 'Edit image'..." : "Query orogenic dynamics..."}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            {lastUploadedImage && (
               <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Image in context"></span>
               </div>
            )}
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 p-2 rounded-lg text-white transition-all shadow-lg"
          >
            󰒊
          </button>
        </div>
        {lastUploadedImage && !input && (
          <p className="text-[10px] text-slate-500 mt-2 italic">Tip: You can now ask the AI to "edit this image" to highlight structures.</p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
