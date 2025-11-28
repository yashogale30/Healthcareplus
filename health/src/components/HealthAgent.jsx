'use client';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function HealthAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

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
    const TEST_USER_ID = '5d04d8ce-3d86-4664-aa16-ff634697c30d'; 
    
    console.log(' Using user ID:', TEST_USER_ID);

    const response = await fetch('/api/agent', {
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
    console.error('❌ Agent error:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('log in')) {
      errorMessage = '🔒 Authentication Required\n\nPlease log in to your Healthcare+ account first before using the AI agent.\n\nGo to the login page and sign in, then come back here.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = '🌐 Network Error\n\nCould not connect to the server. Please check:\n- Is your dev server running? (npm run dev)\n- Is the API route at /api/agent working?\n- Check the terminal for errors.';
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
    <div className="flex flex-col h-screen max-w-5xl mx-auto p-4 bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏥 Healthcare+ AI Agent</h1>
          <p className="text-sm text-gray-500">Your intelligent health companion</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
          >
            {showReasoning ? '🧠 Hide' : '🧠 Show'} Reasoning
          </button>
          <button
            onClick={startNewConversation}
            className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            ✨ New Chat
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to your AI Health Agent
            </h2>
            <p className="text-gray-500 mb-6">
              I can analyze your health data across multiple dimensions
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                "I've been feeling tired lately",
                "Help me plan a healthy week",
                "Check my medication interactions",
                "Analyze my fitness progress"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-sm text-left"
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
              className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold">
                  {msg.role === 'user' ? '👤 You' : '🤖 Health Agent'}
                </span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 max-w-[75%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                <p className="text-sm text-gray-600">Analyzing your health data...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reasoning Panel */}
      {showReasoning && currentReasoning.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
            <span>🧠</span> Agent Reasoning Process
          </h3>
          <div className="space-y-2">
            {currentReasoning.map((step, idx) => (
              <div key={idx} className="text-sm bg-white p-3 rounded border border-yellow-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    step.type === 'planning' ? 'bg-blue-100 text-blue-700' :
                    step.type === 'execution' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {step.type}
                  </span>
                  {step.tool && (
                    <span className="text-gray-600">→ {step.tool}</span>
                  )}
                  {step.status && (
                    <span className={`text-xs ${step.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {step.status === 'success' ? '✓' : '✗'}
                    </span>
                  )}
                </div>
                {step.action && (
                  <p className="text-gray-700 mt-1">{step.action}</p>
                )}
                {step.args && (
                  <pre className="text-xs text-gray-500 mt-1 overflow-x-auto">
                    {JSON.stringify(step.args, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about your health, symptoms, or get personalized recommendations..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-sm"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: I can analyze symptoms, check medications, review nutrition, assess fitness, and find nearby clinics
        </p>
      </div>
    </div>
  );
}
