import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bell, Server, Smartphone, Copy, Check, ShieldCheck, Terminal, Send, CheckCircle2, Globe, Key, AlertCircle, Eye, EyeOff, Lock, MessageSquare, Bot, User, RefreshCw, ExternalLink } from 'lucide-react';
import { getFCMToken, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import { sendAppNotification, dispatchNativePushNotification } from '../utils/notificationHelper';
import { AdminPhotoAuthModal } from '../components/AdminPhotoAuthModal';

export const FcmGeminiPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'guide'>('interactive');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Interactive Live Tester state
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isGettingToken, setIsGettingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState('১১ স্টার ক্লাবের ২০২৬ শারদীয় দুর্গোৎসবের সময়সূচী ও রক্তদান শিবিরের নোটিশ তৈরি করো');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState<string | null>(null);
  const [generatedNotification, setGeneratedNotification] = useState<{ title: string; body: string } | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Live Chat state
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'gemini'; text: string; timestamp: string }>>([
    {
      sender: 'gemini',
      text: 'নমস্কার! আমি Google Gemini AI — ১১ স্টার ক্লাবের অফিশিয়াল এআই অ্যাসিস্ট্যান্ট। আপনার Gemini API Key কানেক্ট করে যেকোনো প্রশ্ন করুন, আমি সঠিক উত্তর দেব এবং ব্রডকাস্টের উপযোগী নোটিফিকেশন টাইটেল বানিয়ে দেব!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    // Load saved API key from localStorage if available and verify it
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      const verifySaved = async () => {
        try {
          const testAi = new GoogleGenAI({ apiKey: savedKey });
          await testAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Test'
          });
          setIsKeyVerified(true);
        } catch {
          console.warn('Saved Gemini API key is no longer valid');
          localStorage.removeItem('gemini_api_key');
          setIsKeyVerified(false);
        }
      };
      verifySaved();
    }

    // Try auto fetching FCM token on mount if permission granted
    handleGetToken(true);
  }, []);

  const handleSaveApiKey = async () => {
    setApiError(null);
    const key = apiKey.trim();

    if (!key) {
      localStorage.removeItem('gemini_api_key');
      setIsKeyVerified(false);
      setIsKeySaved(false);
      setApiError('⚠️ দয়া করে একটি Gemini API Key ইনপুট করুন।');
      return;
    }

    setIsTestingKey(true);
    try {
      // Test the API key with a fast query to verify authenticity
      const testAi = new GoogleGenAI({ apiKey: key });
      await testAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Test connection'
      });

      // Verification successful
      localStorage.setItem('gemini_api_key', key);
      setIsKeyVerified(true);
      setIsKeySaved(true);
      setApiError(null);
      setTimeout(() => setIsKeySaved(false), 4000);
    } catch (err: any) {
      console.error('API Key Verification failed:', err);
      localStorage.removeItem('gemini_api_key');
      setIsKeyVerified(false);
      setIsKeySaved(false);
      setApiError('❌ আপনার দেওয়া Gemini API Key-টি সম্পূর্ণ ভুল বা অকার্যকর! গুগল সারভারে কানেকশন ব্যর্থ হয়েছে। দয়া করে উপরে দেওয়া লিঙ্ক থেকে সঠিক API Key সংগ্রহ করে বসান।');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleGetToken = async (silent = false) => {
    if (!silent) setIsGettingToken(true);
    setTokenError(null);
    try {
      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
      } else if (!silent) {
        setTokenError('ব্রাউজার নোটিফিকেশন পারমিশন মেলেনি অথবা VAPID key কনফিগারেশন প্রয়োজন।');
      }
    } catch (err: any) {
      if (!silent) setTokenError(err.message || 'টোকেন নিতে সমস্যা হয়েছে।');
    } finally {
      if (!silent) setIsGettingToken(false);
    }
  };

  const handleGenerateWithGemini = async () => {
    if (!aiPrompt.trim()) return;
    setApiError(null);

    const key = apiKey.trim();
    if (!key || !isKeyVerified) {
      setApiError('⚠️ আপনার কোনো বৈধ্য ও কানেক্টেড Gemini API Key নেই! দয়া করে সঠিক API Key বক্সে দিয়ে "কানেক্ট ও সেভ করুন" বাটনে চাপ দিন।');
      return;
    }

    setIsGenerating(true);
    setBroadcastSuccess(false);
    setGeneratedAnswer(null);
    setGeneratedNotification(null);

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are the Google Gemini AI Assistant for "11 Star Club" (১১ স্টার ক্লাব - সামাজিক, সেবা ও সাংস্কৃতিক সংগঠন).
Answer the user's input/question accurately, thoroughly, and nicely in Bengali with full context, bullet points, rules, advice, or schedule as required: "${aiPrompt}".

Also extract/generate a short push notification title and body based on your response.

Return strictly a valid JSON object with:
- "answer": "your complete, detailed, accurate answer in Bengali (using markdown like **bold**, bullet points, numbered lists)"
- "title": "short catchy notification title in Bengali with emoji"
- "body": "short push notification message body in Bengali (15 to 25 words)"`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          setGeneratedAnswer(parsed.answer || text);
          setGeneratedNotification({
            title: parsed.title || '১১ স্টার ক্লাব আপডেট',
            body: parsed.body || aiPrompt
          });
        } catch {
          setGeneratedAnswer(text);
          setGeneratedNotification({
            title: '১১ স্টার ক্লাব বিশেষ বার্তা',
            body: text.length > 80 ? text.substring(0, 80) + '...' : text
          });
        }
      } else {
        setApiError('Gemini API থেকে কোনো উত্তর পাওয়া যায়নি। অনুগ্রহ করে আপনার API Key সঠিক আছে কিনা পরীক্ষা করুন।');
      }
    } catch (error: any) {
      console.error('Gemini error:', error);
      setIsKeyVerified(false);
      localStorage.removeItem('gemini_api_key');
      setApiError('❌ Gemini API কানেকশন ত্রুটি! আপনার দেওয়া API Key-টি ভুল বা অকার্যকর। উপরে দেওয়া লিঙ্ক থেকে ফ্রি API Key নিয়ে "কানেক্ট ও সেভ করুন" বাটনে চাপ দিন।');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatSending) return;
    setApiError(null);

    const key = apiKey.trim();
    if (!key || !isKeyVerified) {
      setChatMessages(prev => [...prev, {
        sender: 'gemini',
        text: '⚠️ কোনো সঠিক ও ভেরিফাইড Gemini API Key কানেক্ট করা নেই! দয়া করে উপরে সঠিক API Key বসিয়ে "কানেক্ট ও সেভ করুন" চাপুন।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }

    const userMsg = chatInput.trim();
    setChatInput('');
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: now }]);
    setIsChatSending(true);

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are the official Google Gemini AI Assistant for "11 Star Club" (১১ স্টার ক্লাব). Answer the following question accurately, politely, and thoroughly in Bengali: "${userMsg}"`
      });

      const text = response.text || 'কোনো উত্তর পাওয়া যায়নি।';
      setChatMessages(prev => [...prev, { sender: 'gemini', text: text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err: any) {
      setIsKeyVerified(false);
      localStorage.removeItem('gemini_api_key');
      setChatMessages(prev => [...prev, { sender: 'gemini', text: '❌ Gemini API কানেক্ট করতে সমস্যা হয়েছে! আপনার দেওয়া API Key-টি ভুল বা মেয়াদোত্তীর্ণ। সঠিক API Key সেভ করে চেষ্টা করুন।', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleBroadcastWebsiteNotification = () => {
    if (!generatedNotification) return;
    setIsAdminAuthModalOpen(true);
  };

  const executeBroadcastNotification = async () => {
    if (!generatedNotification) return;
    setIsBroadcasting(true);
    setBroadcastSuccess(false);
    try {
      // 1. Broadcast via sendAppNotification (saves to Firestore notifications collection so ALL visitors receive lock screen push in real-time)
      await sendAppNotification(
        generatedNotification.title,
        generatedNotification.body,
        'notice',
        'notices'
      );

      // 2. Trigger Mobile-compatible Service Worker Push Notification for current device lock screen
      await dispatchNativePushNotification(
        generatedNotification.title,
        generatedNotification.body,
        true,
        'notices'
      );

      setBroadcastSuccess(true);
    } catch (error: any) {
      console.error('Broadcast error:', error);
      alert('ব্রডকাস্ট করতে সমস্যা হয়েছে: ' + (error?.message || 'অজানা ত্রুটি'));
    } finally {
      setIsBroadcasting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0e0a12] text-stone-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Firebase Cloud Messaging & Google Gemini AI Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-amber-200 mb-4 font-serif">
            ১১ স্টার ক্লাব — এআই পুশ নোটিফিকেশন সিস্টেম
          </h1>
          <p className="text-stone-300 max-w-2xl mx-auto text-base">
            এই ওয়েবসাইটে এবং আপনার মোবাইল অ্যাপে ব্যাকগ্রাউন্ড পুশ নোটিফিকেশন ও Gemini AI ইন্টিগ্রেশনের লাইভ টেস্ট এবং নির্দেশিকা।
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'interactive'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>লাইভ ওয়েবসাইট পুশ ও এআই স্টুডিও</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ধাপে ধাপে গাইড</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-stone-900/60 backdrop-blur-xl border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {activeTab === 'interactive' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Step 1: FCM Token & Browser Push Guide */}
              <div className="bg-stone-950/60 p-6 rounded-2xl border border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">1</div>
                    <div>
                      <h3 className="font-bold text-stone-100 text-base">ব্রাউজার ও মোবাইল লক-স্ক্রিন পুশ নোটিফিকেশন (FCM)</h3>
                      <p className="text-xs text-stone-400">মেম্বারদের লক-স্ক্রিনে সরাসরি মেসেজ পাঠাতে ব্রাউজার নোটিফিকেশন পারমিশন ও টোকেন নিন।</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGetToken(false)}
                    disabled={isGettingToken}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{isGettingToken ? 'অনুমতি নেওয়া হচ্ছে...' : 'FCM টোকেন নিন ও পারমিশন দিন'}</span>
                  </button>
                </div>

                {/* FCM Process Guide */}
                <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <Smartphone className="w-4 h-4" />
                    <span>মোবাইল ও ব্রাউজার লক-স্ক্রিন নোটিফিকেশন অন করার সহজ ৩টি নিয়ম:</span>
                  </div>
                  <ol className="text-xs text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>ব্রাউজারের অ্যাড্রেস বারের বাম পাশে <strong>তালা (🔒) বা সাইট সেটিংস</strong> আইকনে ক্লিক করুন।</li>
                    <li><strong>Notifications (নোটিফিকেশন)</strong> পারমিশনটি <strong>"Allow / অনুমতি দিন"</strong> নির্বাচন করুন।</li>
                    <li>উপরের <strong>"FCM টোকেন নিন ও পারমিশন দিন"</strong> বাটনে চাপ দিলে আপনার মোবাইল/ব্রাউজারে সরাসরি লক-স্ক্রিন নোটিফিকেশন সক্রিয় হবে!</li>
                  </ol>
                </div>

                {fcmToken ? (
                  <div className="bg-stone-900 p-3.5 rounded-xl border border-emerald-500/40 text-xs font-mono text-emerald-300 break-all flex items-center justify-between gap-2 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span><strong>FCM Token (সক্রিয়):</strong> {fcmToken}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(fcmToken, 'fcm')}
                      className="text-stone-400 hover:text-stone-100 p-1.5 bg-stone-800 rounded-lg shrink-0"
                    >
                      {copiedCode === 'fcm' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  tokenError && (
                    <div className="text-xs text-amber-400 flex items-center gap-2 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{tokenError}</span>
                    </div>
                  )
                )}
              </div>

              {/* Step 2: Gemini AI Studio & Universal Q&A Generator */}
              <div className="bg-stone-950/60 p-6 sm:p-7 rounded-2xl border border-stone-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">2</div>
                    <div>
                      <h3 className="font-bold text-stone-100 text-lg flex items-center gap-2">
                        <span>Google Gemini AI প্রশ্ন-উত্তর ও নোটিফিকেশন স্টুডিও</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">gemini-3.8-flash</span>
                      </h3>
                      <p className="text-xs text-stone-400">
                        ক্লাব উৎসব, ২০২৬ দুর্গোৎসব, যেকোনো প্রশ্ন বা নোটিশের নিখুঁত উত্তর পান এবং সরাসরি ব্রডকাস্ট করুন।
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    apiKey.trim() && isKeyVerified
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      apiKey.trim() && isKeyVerified ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse' : 'bg-rose-500'
                    }`} />
                    <span>
                      {apiKey.trim() && isKeyVerified ? 'Gemini API Key কানেক্টেড (সঠিক)' : 'API Key প্রয়োজন (কানেক্ট করা নেই)'}
                    </span>
                  </div>
                </div>

                {/* Instructions to get Free API Key */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <Key className="w-4 h-4" />
                    <span>ফ্রি Gemini API Key পাওয়ার সহজ ৩টি ধাপ:</span>
                  </div>
                  <ol className="text-xs text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>নিচের <strong>"ফ্রি Gemini API Key পান"</strong> বাটনে ক্লিক করে Google AI Studio পেজে সরাসরি যান।</li>
                    <li>আপনার গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করে <strong>"Create API key"</strong> বাটনে চাপ দিন।</li>
                    <li>তৈরি হওয়া API Key-টি কপি করে নিচের বক্সে বসিয়ে <strong>"কানেক্ট ও সেভ করুন"</strong> বাটনে চাপ দিন।</li>
                  </ol>
                  <div className="pt-1">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>🔑 ফ্রি Gemini API Key পান (Google AI Studio ডিরেক্ট লিংক)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* API Key Connection Card */}
                <div className="bg-stone-900/70 p-4 rounded-xl border border-stone-800/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>আপনার Gemini API Key বসিয়ে কানেক্ট করুন:</span>
                    </label>
                    {isKeySaved && isKeyVerified && (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> সফলভাবে কানেক্ট হয়েছে!
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setIsKeyVerified(false);
                          setApiError(null);
                        }}
                        placeholder="আপনার Gemini API Key এখানে পেস্ট করুন (AIzaSy...)"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-3 pr-10 py-2.5 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={handleSaveApiKey}
                      disabled={isTestingKey || !apiKey.trim()}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs border border-amber-400 transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {isTestingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{isTestingKey ? 'যাচাই করা হচ্ছে...' : 'কানেক্ট ও সেভ করুন'}</span>
                    </button>
                  </div>
                  {apiError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{apiError}</span>
                    </div>
                  )}
                </div>

                {/* Question or Event Context Input */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center justify-between">
                      <span>ইভেন্ট, নোটিশ বা যেকোনো প্রশ্ন/টপিক (Context & Question):</span>
                      <span className="text-[11px] text-stone-400 font-normal">Gemini AI যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত</span>
                    </label>
                    <textarea
                      rows={3}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="এখানে আপনার যেকোনো প্রশ্ন বা ক্লাবের কোনো ইভেন্টের বিবরণ লিখুন..."
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-stone-100 text-sm focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleGenerateWithGemini}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGenerating ? 'Gemini AI চিন্তা করছে ও উত্তর তৈরি করছে...' : 'Gemini AI দিয়ে উত্তর ও নোটিফিকেশন তৈরি করুন'}</span>
                  </button>
                </div>

                {/* Gemini AI Detailed Answer & Notification Output */}
                {(generatedAnswer || generatedNotification) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-2"
                  >
                    {/* Section 1: Detailed Answer */}
                    {generatedAnswer && (
                      <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 space-y-3">
                        <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                            <Bot className="w-4 h-4 text-amber-400" />
                            <span>১. Gemini AI-এর পূর্ণাঙ্গ ও সঠিক উত্তর</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(generatedAnswer, 'answer')}
                            className="text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1 bg-stone-800/80 px-2 py-1 rounded"
                          >
                            {copiedCode === 'answer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode === 'answer' ? 'কপি হয়েছে' : 'উত্তর কপি করুন'}</span>
                          </button>
                        </div>
                        <div className="text-stone-200 text-sm whitespace-pre-wrap leading-relaxed font-sans bg-stone-950/50 p-4 rounded-xl border border-stone-800/60">
                          {generatedAnswer}
                        </div>
                      </div>
                    )}

                    {/* Section 2: Auto-generated Push Notification */}
                    {generatedNotification && (
                      <div className="bg-stone-900/90 p-5 rounded-xl border border-amber-500/30 space-y-3">
                        <div className="flex justify-between items-center border-b border-stone-800/80 pb-2">
                          <span className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                            <Bell className="w-4 h-4" />
                            <span>২. ব্রডকাস্টের জন্য অটো-জেনারেটেড নোটিফিকেশন</span>
                          </span>
                          <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            প্রস্তুত (Ready to Send)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-stone-950/60 p-4 rounded-xl border border-stone-800">
                          <div>
                            <span className="text-[11px] text-stone-400 block mb-0.5 font-medium">নোটিফিকেশন টাইটেল:</span>
                            <div className="text-stone-100 font-bold text-sm text-amber-200">{generatedNotification.title}</div>
                          </div>
                          <div>
                            <span className="text-[11px] text-stone-400 block mb-0.5 font-medium">নোটিফিকেশন বার্তা:</span>
                            <div className="text-stone-300 text-xs leading-snug">{generatedNotification.body}</div>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          <button
                            onClick={handleBroadcastWebsiteNotification}
                            disabled={isBroadcasting}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="ক্লাবের অফিশিয়াল নোটিফিকেশন পাঠাতে অ্যাডমিন পাসওয়ার্ড আবশ্যক"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <Send className="w-3.5 h-3.5" />
                            <span>{isBroadcasting ? 'ব্রডকাস্ট হচ্ছে...' : 'সকল ভিজিটরকে লক-স্ক্রিন পুশ নোটিফিকেশন পাঠাও (অ্যাডমিন লক)'}</span>
                          </button>

                          {broadcastSuccess && (
                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>সফলভাবে সিস্টেম লক-স্ক্রিন পুশ নোটিফিকেশন ব্রডকাস্ট হয়েছে!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Section 3: Live Interactive Gemini AI Chatbox */}
                <div className="pt-6 border-t border-stone-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-stone-200 text-sm">💬 Gemini AI লাইভ প্রশ্ন-উত্তর চ্যাটবক্স (Ask Anything to Gemini)</h4>
                    </div>
                    <span className="text-[11px] text-stone-400">অনলাইন এআই সাপোর্ট</span>
                  </div>

                  <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3 max-h-80 overflow-y-auto">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'gemini' && (
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl space-y-1 ${
                            msg.sender === 'user'
                              ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-none'
                              : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-none leading-relaxed whitespace-pre-wrap'
                          }`}
                        >
                          <div>{msg.text}</div>
                          <div className={`text-[10px] ${msg.sender === 'user' ? 'text-stone-900/70 text-right' : 'text-stone-500'}`}>
                            {msg.timestamp}
                          </div>
                        </div>
                        {msg.sender === 'user' && (
                          <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isChatSending && (
                      <div className="flex items-center gap-2 text-stone-400 text-xs italic p-2">
                        <Bot className="w-4 h-4 animate-bounce text-amber-400" />
                        <span>Gemini AI টাইপ করছে...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      placeholder="এখানে যেকোনো প্রশ্ন লিখুন (যেমন: ২০২৬ পূজোর থিম কী?)..."
                      className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={isChatSending || !chatInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>পাঠান</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-semibold text-amber-200 font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                সম্পূর্ণ কার্যপ্রবাহ (Architecture Workflow)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-stone-950/50 p-5 rounded-xl border border-stone-800">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-3">1</div>
                  <h3 className="font-semibold text-stone-200 mb-2">ফ্রন্টএন্ড রেজিস্ট্রেশন</h3>
                  <p className="text-sm text-stone-400">
                    ইউজার অ্যাপ ওপেন করলে পারমিশন নেয় এবং টোকেন সংগ্রহ করে ব্যাকএন্ডে বা ডাটাবেজে সংরক্ষণ করে।
                  </p>
                </div>
                <div className="bg-stone-950/50 p-5 rounded-xl border border-stone-800">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-3">2</div>
                  <h3 className="font-semibold text-stone-200 mb-2">Gemini AI জেনারেশন</h3>
                  <p className="text-sm text-stone-400">
                    ব্যাকএন্ড সার্ভারে Google Gemini API (JSON মোড) ব্যবহার করে আকর্ষণীয় নোটিফিকেশন শিরোনাম ও বিবরণ তৈরি হয়।
                  </p>
                </div>
                <div className="bg-stone-950/50 p-5 rounded-xl border border-stone-800">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-3">3</div>
                  <h3 className="font-semibold text-stone-200 mb-2">FCM ব্যাকগ্রাউন্ড ডেলিভারি</h3>
                  <p className="text-sm text-stone-400">
                    Firebase Admin SDK উচ্চ প্রায়োরিটি (`priority: 'high'`) দিয়ে সেই মেসেজ ইউজারের ডিভাইসে পাঠায়।
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Admin Password Authentication Modal for Broadcasting */}
      <AdminPhotoAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={executeBroadcastNotification}
        actionTitle="অফিসিয়াল পুশ নোটিফিকেশন ব্রডকাস্ট"
        description="Gemini AI দ্বারা তৈরি নোটিফিকেশনটি ওয়েবসাইটের সকল ভিজিটরের ডিভাইসে ও লক-স্ক্রিনে ব্রডকাস্ট করতে ক্লাবের অ্যাডমিন পাসওয়ার্ড দিন।"
        submitButtonText="পাসওয়ার্ড যাচাই করে নোটিফিকেশন ব্রডকাস্ট করুন"
      />
    </div>
  );
};
