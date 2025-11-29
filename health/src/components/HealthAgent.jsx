'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

import { useAuth } from '../lib/authContext';

export default function HealthAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const TEST_USER_ID = 'cc6ecc1f-0b3d-441a-8f5c-8bb8fb03a724'; 
      
      console.log('Using user ID:', TEST_USER_ID);

      const response = await fetch('/api/chatbotAgent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          userId: TEST_USER_ID,  
          conversationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from agent');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);

      setCurrentReasoning(data.reasoning_steps || []);
      
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

    } catch (error) {
      console.error(' Agent error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('log in')) {
        errorMessage = ' Authentication Required\n\nPlease log in to your Healthcare+ account first before using the AI agent.\n\nGo to the login page and sign in, then come back here.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = ' Network Error\n\nCould not connect to the server. Please check:\n- Is your dev server running? (npm run dev)\n- Is the API route at /api/agent working?\n- Check the terminal for errors.';
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setCurrentReasoning([]);
  };

  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      {/* Navbar - Import your existing Navbar */}
      

      {/* Hero Section with AI Agent */}
      <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden px-6">
        {/* Background Elements - Same as homepage */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-12">
          {/* Left - Hero Text */}
          <div className="text-center lg:text-left flex-1 max-w-lg">
            <div className="mb-6 inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A]">
              <span className="w-2 h-2 bg-[#94A7AE] rounded-full mr-2 animate-pulse"></span>
              HealthCare+ AI Agent
            </div>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-[#64766A] mb-6 leading-tight">
              Your AI<br/><span className="text-[#C0A9BD]">Health Companion</span>
            </h1>
            <p className="text-xl text-[#64766A]/80 leading-relaxed mb-8 font-light">
              Get intelligent health insights, personalized recommendations, 
              and comprehensive analysis across all your health data.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="/"
                className="px-8 py-4 bg-[#64766A] text-white rounded-full text-lg font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Right - Chat Interface */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-md bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-2xl p-6 h-[70vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#C0A9BD]/20">
              <div>
                <h2 className="text-2xl font-semibold text-[#64766A]"> AI Health Agent</h2>
                <p className="text-sm text-[#64766A]/70">Your intelligent companion</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="text-xs bg-[#C0A9BD]/20 text-[#64766A] px-3 py-1.5 rounded-full hover:bg-[#C0A9BD]/30 transition-all duration-300"
                >
                   {showReasoning ? 'Hide' : 'Show'} Reasoning
                </button>
                <button
                  onClick={startNewConversation}
                  className="text-xs bg-[#94A7AE]/20 text-[#64766A] px-3 py-1.5 rounded-full hover:bg-[#94A7AE]/30 transition-all duration-300"
                >
                   New Chat
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6 mx-auto w-24 h-24 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center">
                    
                  </div>
                  <h3 className="text-xl font-semibold text-[#64766A] mb-4">
                    Welcome to your AI Health Agent
                  </h3>
                  <p className="text-[#64766A]/70 mb-8">
                    Ask about symptoms, medications, fitness, or nutrition
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
                    {[
                      "I've been feeling tired lately",
                      "Help me plan a healthy week", 
                      "Check my medication schedule",
                      "Analyze my fitness progress"
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(suggestion)}
                        className="p-3 bg-white/50 border border-[#C0A9BD]/20 rounded-xl hover:border-[#C0A9BD]/40 hover:bg-white/70 transition-all duration-300 text-left text-sm text-[#64766A]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#64766A] text-white'
                        : 'bg-white/90 text-[#64766A] border border-[#C0A9BD]/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold">
                        {msg.role === 'user' ? '👤 You' : '🤖 AI Agent'}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/90 p-4 rounded-2xl shadow-sm border border-[#C0A9BD]/20 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#64766A] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-[#64766A] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-[#64766A] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      <p className="text-sm text-[#64766A]/70">AI is analyzing your health data...</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reasoning Panel */}
            {showReasoning && currentReasoning.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-[#C0A9BD]/10 to-[#94A7AE]/10 border border-[#C0A9BD]/20 rounded-xl max-h-32 overflow-y-auto mb-4">
                <h4 className="font-semibold text-[#64766A] mb-3 text-sm flex items-center gap-2">
                   Agent Reasoning
                </h4>
                <div className="space-y-1">
                  {currentReasoning.map((step, idx) => (
                    <div key={idx} className="text-xs bg-white/60 p-2 rounded-lg border border-[#C0A9BD]/10">
                      <span className="font-mono text-[#64766A]/80">
                        {step.type?.toUpperCase()} {step.status === 'success' ? '✓' : '⚡'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="pt-4 border-t border-[#C0A9BD]/20">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about your health, symptoms, medications, or fitness..."
                  className="flex-1 p-3 bg-white/70 border border-[#C0A9BD]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent backdrop-blur-sm text-[#64766A] placeholder-[#64766A]/50"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 bg-[#64766A] text-white rounded-2xl font-medium hover:bg-[#64766A]/90 disabled:bg-[#64766A]/50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                    </div>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
              <p className="text-xs text-[#64766A]/60 mt-2 text-center">
                💡 AI can analyze symptoms, medications, nutrition, fitness & find clinics
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}