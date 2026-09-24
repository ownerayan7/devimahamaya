import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  ExternalLink,
  Search,
  Globe,
  Flame,
  Music,
  Compass,
  Info,
  ChevronRight,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { PageId } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Array<{ title: string; url: string }>;
  timestamp: string;
}

interface DeviAiPageProps {
  onNavigate?: (page: PageId) => void;
}

const PRESET_PROMPTS = [
  {
    title: 'আজকের আবহাওয়া ও তাজা খবর',
    prompt: 'আজকের আবহাওয়া এবং প্রধান তাজা খবরগুলো জানাও।',
    icon: '🌤️'
  }
];

export function DeviAiPage({ onNavigate }: DeviAiPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `নমস্কার! 🙏 আমি **Devi AI** — **11 Star Club** (11starclub) প্ল্যাটফর্মের জন্য বিশেষভাবে তৈরি আপনার ব্যক্তিগত ও সার্বক্ষণিক স্মার্ট এআই সহকারী।

আমি গুগল লাইভ সার্চ ও ক্লাবের তথ্যের সাথে সরাসরি সংযুক্ত। আমি আপনাকে কীভাবে সাহায্য করতে পারি?
- 🌐 **রিয়েল-টাইম তথ্য:** তাজা খবর, লাইভ আবহাওয়া, ক্রিকেট স্কোর ও দেশ-বিদেশের যেকোনো প্রশ্ন।
- 🪔 **ক্লাব ও পূজা তথ্য:** ১১ স্টার ক্লাবের দুর্গাপূজা ২০২৬, রবিবার প্রার্থনা, রবীন্দ্র সঙ্গীত, সমাজসেবা ও অন্যান্য উদ্যোগ।
- 🔍 **সরাসরি ওয়েব সার্চ ও লিংক:** যেকোনো বিষয়ের তথ্য তাৎক্ষণিক সরাসরি গুগলে অনুসন্ধান করা।

যেকোনো ভাষায় (বাংলা, English বা বাংলিশ) আমাকে নির্দ্বিধায় প্রশ্ন করুন!`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [isWebViewExpanded, setIsWebViewExpanded] = useState(false);
  const [clearNotice, setClearNotice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || input).trim();
    if (!promptToSend || isLoading) return;

    // Check if input is a direct search query request
    if (promptToSend.startsWith('https://www.google.com/search?igu=1&q=')) {
      setWebViewUrl(promptToSend);
      setInput('');
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Build history for multi-turn chat
    const historyPayload = messages.slice(-10).map((m) => ({
      role: m.role,
      text: m.text
    }));

    try {
      const res = await fetch('/api/devi-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          history: historyPayload
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `সার্ভার ত্রুটি: ${res.status}`);
      }

      const data = await res.json();
      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।',
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, modelMessage]);

      // Check if model returned a direct Google search iframe/URL format
      const searchUrlMatch = modelMessage.text.match(/https:\/\/www\.google\.com\/search\?igu=1&q=[^\s\)\]]+/);
      if (searchUrlMatch) {
        // Option to view in webview
      }
    } catch (err: any) {
      console.warn('Devi AI client fetch fallback:', err);
      const directSearchUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(promptToSend)}`;
      const googleTabUrl = `https://www.google.com/search?q=${encodeURIComponent(promptToSend)}`;
      
      const fallbackMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: `🔍 **সরাসরি গুগল অনুসন্ধান ফলাফল:**\n\n"${promptToSend}" সম্পর্কিত লাইভ তথ্য ও ফলাফল সরাসরি গুগলে প্রস্তুত রয়েছে।\n\n👉 **সরাসরি এই পেজেই গুগল সার্চের লাইভ প্রিভিউ দেখতে ক্লিক করুন:**\n[গুগল লাইভ সার্চ প্রিভিউ খুলুন](${directSearchUrl})\n\n- 🌐 [গুগল ওয়েব সার্চে দেখুন](${googleTabUrl})\n- ⭐ [১১ স্টার ক্লাব হোমপেজ](#home)`,
        sources: [
          {
            title: 'Google Live Search',
            url: directSearchUrl
          },
          {
            title: 'Google Web Search',
            url: googleTabUrl
          }
        ],
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setInput('');
    setWebViewUrl(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `নমস্কার! 🙏 আমি **Devi AI** — **11 Star Club** (11starclub) এর সার্বক্ষণিক স্মার্ট ডিজিটাল সহকারী।

আমি গুগল লাইভ সার্চ ও ক্লাবের রিয়েল-টাইম তথ্যের সাথে সরাসরি সংযুক্ত। বলুন, আজ আপনাকে কী বিষয়ে তথ্য দিয়ে সাহায্য করতে পারি?
- 🔍 **সরাসরি গুগল সার্চ:** তাজা খবর, লাইভ আবহাওয়া, ক্রিকেট স্কোর ও দেশ-বিদেশের যেকোনো প্রশ্ন
- 🪔 **ক্লাব ও দুর্গাপূজা ২০২৬:** মহালয়া, রবিবার প্রার্থনা সঙ্গীত, বৃক্ষরোপণ ও সমাজসেবা
- 🌐 **লাইভ ওয়েবভিউ:** যেকোনো অনুসন্ধানের সরাসরি গুগল সার্চ পেজ এই স্ক্রিনেই দেখা যাবে`,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setClearNotice(true);
    setTimeout(() => setClearNotice(false), 2000);
  };

  // Helper to render formatted markdown text cleanly
  const renderMessageContent = (content: string) => {
    // Regex for direct Google search webview URLs or standard markdown links
    const lines = content.split('\n');

    return (
      <div className="space-y-2 leading-relaxed text-sm sm:text-base break-words">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const itemText = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span className="flex-1">{formatInline(itemText)}</span>
              </div>
            );
          }

          // Numbered list
          const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-amber-400 font-bold min-w-[1.2rem]">{numMatch[1]}.</span>
                <span className="flex-1">{formatInline(numMatch[2])}</span>
              </div>
            );
          }

          return <p key={idx}>{formatInline(line)}</p>;
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    // Check for direct Google Search webview link format
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Pattern for URLs and markdown links and bold text
    const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https:\/\/www\.google\.com\/search\?igu=1&q=[^\s\)\]]+|https?:\/\/[^\s\)\]]+)/g;
    
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchText = match[0];

      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        // Bold
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-amber-200">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('[') && matchText.includes('](')) {
        // Markdown link [Title](Url)
        const linkMatch = matchText.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          const [, linkTitle, linkUrl] = linkMatch;
          const isGoogleIgu = linkUrl.includes('google.com/search?igu=1');
          parts.push(
            <span key={keyIdx++} className="inline-flex items-center gap-1">
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-1"
              >
                {linkTitle}
                <ExternalLink className="w-3 h-3 inline" />
              </a>
              {isGoogleIgu && (
                <button
                  onClick={() => setWebViewUrl(linkUrl)}
                  className="px-2 py-0.5 ml-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs rounded border border-cyan-500/40 inline-flex items-center gap-1 cursor-pointer transition-all"
                  title="এই পেজেই সরাসরি সার্চ দেখুন"
                >
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>ওয়েবভিউ খুলুন</span>
                </button>
              )}
            </span>
          );
        }
      } else if (matchText.startsWith('https://www.google.com/search?igu=1')) {
        // Direct webview link
        parts.push(
          <span key={keyIdx++} className="inline-flex items-center gap-1.5 flex-wrap my-1">
            <button
              onClick={() => setWebViewUrl(matchText)}
              className="px-3 py-1 bg-gradient-to-r from-cyan-900 to-blue-900 hover:from-cyan-800 hover:to-blue-800 text-cyan-100 rounded-lg text-xs font-semibold border border-cyan-400/50 shadow-md inline-flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Search className="w-3.5 h-3.5 text-cyan-300" />
              <span>সরাসরি গুগল সার্চ প্রিভিউ দেখুন</span>
            </button>
            <a
              href={matchText}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-400 hover:text-stone-200 underline inline-flex items-center gap-1"
            >
              নতুন ট্যাবে খুলুন <ExternalLink className="w-3 h-3" />
            </a>
          </span>
        );
      } else if (matchText.startsWith('http')) {
        // Plain URL
        parts.push(
          <a
            key={keyIdx++}
            href={matchText}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-0.5 break-all"
          >
            {matchText}
            <ExternalLink className="w-3 h-3 inline ml-0.5" />
          </a>
        );
      } else {
        parts.push(matchText);
      }

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-6 sm:pt-8 pb-24">
      {/* Top Devi AI Branding Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#120a22] via-[#0d1629] to-[#091e24] border border-cyan-500/30 p-4 sm:p-6 mb-5 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        {/* Divine Glow Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-amber-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center">
                <div className="w-full h-full bg-[#0d091a] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-300 animate-pulse" />
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0d091a]"></span>
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-200 via-white to-amber-200 bg-clip-text text-transparent">
                  Devi AI
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm flex items-center gap-1">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  লাইভ ওয়েব কানেক্টেড
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                  11starclub Exclusive
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
                ১১ স্টার ক্লাব পরিবারের জন্য রিয়েল-টাইম জ্ঞান, সার্বক্ষণিক অনুসন্ধান ও সহায়তা সহকারী।
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 self-end md:self-center">
            {clearNotice && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>কথোপকথন ক্লিয়ার হয়েছে</span>
              </span>
            )}
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/60 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="সমস্ত কথোপকথন মুছে নতুন করে শুরু করুন"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>চ্যাট ক্লিয়ার</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Stream & Optional WebView Embed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chat Area (Full width or split when webview is open) */}
        <div className={webViewUrl ? 'lg:col-span-6 flex flex-col' : 'lg:col-span-12 flex flex-col'}>
          {/* Chat Container */}
          <div className="bg-[#0e0a16]/90 rounded-2xl border border-stone-800/80 shadow-2xl flex flex-col h-[600px] sm:h-[650px] overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-5 custom-scrollbar">
              {messages.map((message) => {
                const isUser = message.role === 'user';
                const isDevi = message.role === 'model';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2.5 sm:gap-3.5 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-md ${
                        isUser
                          ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-black'
                          : 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white'
                      }`}
                    >
                      {isUser ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-cyan-200" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-stone-100 ${
                        isUser
                          ? 'bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-yellow-950/70 border border-amber-500/30 rounded-tr-none text-right'
                          : 'bg-[#151024]/95 border border-cyan-500/20 rounded-tl-none shadow-lg'
                      }`}
                    >
                      {/* Name & Time Header */}
                      <div
                        className={`flex items-center gap-2 mb-1.5 text-[11px] font-medium text-stone-400 ${
                          isUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className={isUser ? 'text-amber-300' : 'text-cyan-300 font-bold'}>
                          {isUser ? 'আপনি' : 'Devi AI'}
                        </span>
                        <span>•</span>
                        <span>{message.timestamp}</span>
                      </div>

                      {/* Content */}
                      <div className={isUser ? 'text-left' : 'text-left'}>
                        {renderMessageContent(message.text)}
                      </div>

                      {/* Web Grounding Sources (if available) */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-stone-700/50">
                          <div className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1 mb-1.5">
                            <Globe className="w-3 h-3 text-cyan-400" />
                            <span>তথ্যসূত্র ও লাইভ ওয়েব রেফারেন্স:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {message.sources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 rounded bg-stone-900/90 hover:bg-stone-800 text-[11px] text-cyan-200 hover:text-cyan-100 border border-cyan-500/30 inline-flex items-center gap-1 transition-all"
                              >
                                <span>{src.title || 'ওয়েব লিংক'}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Quick Tools for Model Message */}
                      {isDevi && (
                        <div className="mt-3 pt-2 flex items-center gap-2 text-stone-400 text-xs">
                          <button
                            onClick={() => handleCopy(message.text, message.id)}
                            className="p-1 hover:text-white rounded hover:bg-stone-800/80 transition-all cursor-pointer inline-flex items-center gap-1"
                            title="উত্তর কপি করুন"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400">কপি হয়েছে</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[10px]">কপি</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" />
                  </div>
                  <div className="bg-[#151024]/95 border border-cyan-500/20 rounded-2xl rounded-tl-none p-3.5 text-stone-300 text-xs sm:text-sm flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>দেবী এআই রিয়েল-টাইম তথ্য অনুসন্ধান করছে...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2 sm:px-4 bg-[#0a0711] border-t border-stone-800/60 overflow-x-auto custom-scrollbar flex items-center gap-2">
              <span className="text-[11px] font-semibold text-stone-400 shrink-0 hidden sm:inline">
                প্রস্তাবিত:
              </span>
              {PRESET_PROMPTS.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  disabled={isLoading}
                  onClick={() => handleSend(preset.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-cyan-200 text-xs border border-stone-700/50 hover:border-cyan-500/40 shrink-0 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-[#0a0711] border-t border-stone-800/80">
              <div className="flex items-end gap-2 bg-[#140e22] border border-stone-700/70 focus-within:border-cyan-500/60 rounded-xl p-1.5 sm:p-2 transition-all shadow-inner">
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Devi AI-কে যেকোনো প্রশ্ন করুন"
                  rows={1}
                  className="flex-1 bg-transparent border-0 resize-none text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none max-h-28 py-1.5 px-1 font-bengali leading-relaxed"
                />

                {/* Send Button */}
                <button
                  type="button"
                  disabled={!input.trim() || isLoading}
                  onClick={() => handleSend()}
                  className="p-2 sm:px-3.5 sm:py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 shadow-md"
                  title="বার্তা পাঠান"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">পাঠান</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 px-1">
                <span>Enter চাপলে পাঠানো হবে • Shift + Enter নতুন লাইন</span>
                <span className="text-cyan-500/70 font-mono">Devi AI Engine 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Search WebView Preview Panel (When triggered) */}
        {webViewUrl && (
          <div className="lg:col-span-6 flex flex-col h-[600px] sm:h-[650px] bg-[#0d0a17] rounded-2xl border border-cyan-500/40 shadow-2xl overflow-hidden">
            {/* Webview Header */}
            <div className="bg-[#130d24] px-4 py-3 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-semibold text-stone-200 truncate">
                  সরাসরি গুগল সার্চ প্রিভিউ (Live WebView)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={webViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white text-xs transition-all"
                  title="নতুন ট্যাবে খুলুন"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setWebViewUrl(null)}
                  className="p-1.5 rounded-lg hover:bg-red-950/80 text-stone-400 hover:text-red-300 text-xs transition-all cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Iframe */}
            <div className="flex-1 w-full bg-white relative">
              <iframe
                src={webViewUrl}
                title="Google Live Search View"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        )}
      </div>

      {/* Feature Highlights Footer Banner */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#130e22] to-[#0e0a16] border border-cyan-500/20 flex items-start gap-3 shadow-md">
          <div className="p-2.5 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100">লাইভ গুগল সার্চ ইন্টিগ্রেশন</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              সর্বশেষ খবর, আবহাওয়া, ক্রিকেট স্কোর এবং সাধারণ ওয়েব তথ্য মুহূর্তেই সংগৃহীত হয়।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-[#130e22] to-[#0e0a16] border border-amber-500/20 flex items-start gap-3 shadow-md">
          <div className="p-2.5 rounded-lg bg-amber-950/70 border border-amber-500/30 text-amber-300">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100">১১ স্টার ক্লাব সার্বিক তথ্য</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              দুর্গাপূজা ২০২৬, রবিবার প্রার্থনা সঙ্গীত, বৃক্ষরোপণ এবং রক্তদান সেবা সম্পর্কিত তথ্যাবলী।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-[#130e22] to-[#0e0a16] border border-indigo-500/20 flex items-start gap-3 shadow-md">
          <div className="p-2.5 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-300">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100">ভয়েস ও অডিও স্পিচ সাপোর্ট</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              বাংলা ও ইংরেজিতে কথা বলে প্রশ্ন করার সুবিধা।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
