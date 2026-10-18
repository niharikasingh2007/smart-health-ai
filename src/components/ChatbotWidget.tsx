import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, EssentialDrug, FacilityRecord, TacticalDomain } from '../types/healthGrid';
import { processHealthcareQuery } from '../utils/chatbotEngine';

interface ChatbotWidgetProps {
  drugs: EssentialDrug[];
  facilities: FacilityRecord[];
  onNavigateDomain: (domain: TacticalDomain) => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  drugs,
  facilities,
  onNavigateDomain
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Namaste! I am the District Healthcare AI Assistant. I can help you check medicine inventory, find vacant beds, locate diagnostic services, or guide you through daily staff reporting.',
      timestamp: 'Just now',
      suggestions: [
        'Which PHC has available paracetamol?',
        'Where is ARV anti-rabies vaccine available?',
        'How do I update bed counts?',
        'Where is blood pressure test available?',
        'Which hospital has vacant emergency beds?'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const response = processHealthcareQuery(query, drugs, facilities);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.relatedQuestions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Healthcare Operations AI Assistant Chatbot"
            className="flex items-center gap-2.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 cursor-pointer"
          >
            <div className="relative">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">
                smart_toy
              </span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" aria-hidden="true" />
            </div>
            <span className="font-semibold text-sm tracking-wide">
              Ask Health Assistant
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div
          role="complementary"
          aria-label="District Healthcare AI Chat Window"
          className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[400px] h-[540px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <span className="material-symbols-outlined text-xl" aria-hidden="true">smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Healthcare Operations AI
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                </h3>
                <span className="text-[11px] text-slate-300">
                  Live District Telemetry Support
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chatbot"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                      isUser
                        ? 'bg-sky-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block text-right ${isUser ? 'text-sky-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Suggestion Chips */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(sug)}
                          className="bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 hover:border-sky-300 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200 text-slate-400 w-fit text-xs">
                <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">sync</span>
                <span>Searching district records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask in simple words (e.g. paracetamol, beds)..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim()}
                aria-label="Send query"
                className="w-9 h-9 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">send</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
              <span>District PHC/CHC Knowledge Base</span>
              <span>Available 24/7</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
