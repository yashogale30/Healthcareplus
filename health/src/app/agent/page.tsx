"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AgentChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages
        })
      });

      const data = await res.json();

      if (data.type === "redirect") {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        setTimeout(() => {
          router.push(data.redirectTo);
        }, 1500);
      } else if (data.type === "answer") {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
      </div>

      {/* Chat Container */}
      <div className="relative z-10 flex flex-col h-screen max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A] mb-4">
            <span className="w-2 h-2 bg-[#94A7AE] rounded-full mr-2 animate-pulse"></span>
            AI Health Assistant
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-[#64766A]">
            How can I help you today?
          </h1>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#64766A]/60 text-lg font-light">
                Ask me anything about your health...
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[75%] p-4 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                  msg.role === "user"
                    ? "bg-[#64766A] text-white shadow-lg"
                    : "bg-white/80 text-[#64766A] border border-[#C0A9BD]/20 shadow-md"
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/80 backdrop-blur-sm border border-[#C0A9BD]/20 p-4 rounded-3xl shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#94A7AE] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#94A7AE] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-[#94A7AE] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <span className="ml-2 text-[#64766A]/70 font-light">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white/70 backdrop-blur-sm border border-[#C0A9BD]/30 rounded-full p-2 shadow-lg">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
              placeholder="Ask about your health..."
              className="flex-1 px-6 py-3 bg-transparent text-[#64766A] placeholder-[#64766A]/50 focus:outline-none font-light"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-[#64766A] text-white rounded-full font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-[#64766A]/50 text-sm mt-4 font-light">
          Powered by AI • Your health information is private and secure
        </p>
      </div>
    </div>
  );
}
