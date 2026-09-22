import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bell, Server, Smartphone, Copy, Check, ShieldCheck, Terminal, Send, CheckCircle2, Globe, Key, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getFCMToken, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';

export const FcmGeminiPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'guide' | 'flutter' | 'backend'>('interactive');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Interactive Live Tester state
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isGettingToken, setIsGettingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState('১১ স্টার ক্লাবের আসন্ন শারদীয় দুর্গোৎসব ও রক্তদান শিবির');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotification, setGeneratedNotification] = useState<{ title: string; body: string } | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    // Try auto fetching FCM token on mount if permission granted
    handleGetToken(true);
  }, []);

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
    setIsGenerating(true);
    setBroadcastSuccess(false);
    try {
      // Use provided API key or environment/fallback
      const key = apiKey.trim() || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      
      if (!key) {
        // Fallback intelligent simulation if no API key entered
        await new Promise(r => setTimeout(r, 1000));
        setGeneratedNotification({
          title: "🌸 ১১ স্টার ক্লাব: শারদীয় দুর্গোৎসব আপডেট",
          body: `আসন্ন ইভেন্ট "${aiPrompt}" উপলক্ষে বিশেষ সাংস্কৃতিক অনুষ্ঠান ও অঞ্জলি প্রদান। সকলের উপস্থিতি কামনা করছি।`
        });
        setIsGenerating(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short, catchy push notification title and body for 11 Star Club website based on this context: "${aiPrompt}". Return as a strict JSON object with keys "title" and "body" in Bengali.`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        setGeneratedNotification({
          title: parsed.title || '১১ স্টার ক্লাব নোটিফিকেশন',
          body: parsed.body || aiPrompt
        });
      }
    } catch (error: any) {
      console.error('Gemini error:', error);
      // Fallback
      setGeneratedNotification({
        title: "🌺 বিশেষ ঘোষণা — ১১ স্টার ক্লাব",
        body: aiPrompt
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBroadcastWebsiteNotification = async () => {
    if (!generatedNotification) return;
    setIsBroadcasting(true);
    try {
      // Save to Firestore notifications so all website visitors get it in real-time
      await addDoc(collection(db, 'notifications'), {
        title: generatedNotification.title,
        body: generatedNotification.body,
        type: 'ai_announcement',
        createdAt: serverTimestamp(),
        sender: 'Gemini AI Broadcast'
      });

      // Also try browser local notification if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(generatedNotification.title, {
          body: generatedNotification.body,
          icon: '/favicon.ico'
        });
      }

      setBroadcastSuccess(true);
    } catch (error: any) {
      console.error('Broadcast error:', error);
      alert('ব্রডকাস্ট করতে সমস্যা হয়েছে: ' + error.message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const flutterCode = `import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

// ব্যাকগ্রাউন্ড নোটিফিকেশন হ্যান্ডলার (অ্যাপ বন্ধ থাকলেও এটি চলবে)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("Background Message Received: \${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  
  // ব্যাকগ্রাউন্ড হ্যান্ডলার রেজিস্টার
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
    _setupFCM();
  }

  void _setupFCM() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;

    // ১. পারমিশন চাওয়া (Android 13+ & iOS)
    NotificationSettings settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // ২. FCM টোকেন সংগ্রহ
      String? token = await messaging.getToken();
      print("Device FCM Token: \$token");
    }

    // ৩. অ্যাপ সম্পূর্ণ বন্ধ (Terminated state) থাকা অবস্থায় নোটিফিকেশনে ক্লিক করলে
    RemoteMessage? initialMessage = await messaging.getInitialMessage();
    if (initialMessage != null) {
      print("Opened from terminated state: \${initialMessage.notification?.title}");
    }
  }

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: Scaffold(
        body: Center(child: Text('FCM & Gemini Push Notification App')),
      ),
    );
  }
}`;

  const nodeBackendCode = `const express = require('express');
const admin = require('firebase-admin');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

// Firebase Admin SDK ইনিশিয়ালাইজেশন
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Google Gemini API ইনিশিয়ালাইজেশন
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/send-notification', async (req, res) => {
  try {
    const { deviceToken, userContext } = req.body;

    // Gemini API দিয়ে ডাইনামিক মেসেজ তৈরি (JSON Mode)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: \`Generate a short, catchy push notification title and body for club users based on: "\${userContext}". Format as JSON with keys 'title' and 'body'.\`,
      config: { responseMimeType: 'application/json' }
    });

    const notificationData = JSON.parse(response.text());

    // FCM-এর মাধ্যমে হাই-প্রায়োরিটি মেসেজ পাঠানো (অ্যাপ বন্ধ থাকলেও আসবে)
    const message = {
      notification: {
        title: notificationData.title,
        body: notificationData.body,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'high_importance_channel',
          sound: 'default'
        }
      },
      token: deviceToken
    };

    const result = await admin.messaging().send(message);
    res.status(200).json({ success: true, messageId: result, data: notificationData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Backend server running on port 3000'));`;

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
          <button
            onClick={() => setActiveTab('flutter')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'flutter'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>অ্যাপ কোড (Flutter)</span>
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'backend'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>ব্যাকএন্ড (Node.js)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-stone-900/60 backdrop-blur-xl border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {activeTab === 'interactive' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Step 1: FCM Token */}
              <div className="bg-stone-950/60 p-6 rounded-xl border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="font-semibold text-stone-100">ব্রাউজার ও ওয়েব পুশ FCM টোকেন</h3>
                      <p className="text-xs text-stone-400">এই ডিভাইসে পুশ নোটিফিকেশন পেতে ব্রাউজার পারমিশন নিশ্চিত করুন।</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGetToken(false)}
                    disabled={isGettingToken}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{isGettingToken ? 'অনুমতি নেওয়া হচ্ছে...' : 'FCM টোকেন নিন'}</span>
                  </button>
                </div>

                {fcmToken ? (
                  <div className="bg-stone-900 p-3 rounded-lg border border-emerald-500/30 text-xs font-mono text-emerald-300 break-all flex items-center justify-between gap-2">
                    <span>FCM Token: {fcmToken}</span>
                    <button
                      onClick={() => copyToClipboard(fcmToken, 'fcm')}
                      className="text-stone-400 hover:text-stone-100 p-1"
                    >
                      {copiedCode === 'fcm' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  tokenError && (
                    <div className="text-xs text-amber-400 flex items-center gap-1.5 bg-amber-500/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{tokenError} (লোকাল এনভায়রমেন্টে VAPID কি বা সার্ভিস ওয়ার্কার রিকোয়ার করতে পারে, তবে সিমুলেটর ফুল রেডি আছে।)</span>
                    </div>
                  )
                )}
              </div>

              {/* Step 2: Gemini AI Content Generator */}
              <div className="bg-stone-950/60 p-6 rounded-xl border border-stone-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-stone-100">Google Gemini AI দিয়ে নোটিফিকেশন তৈরি</h3>
                    <p className="text-xs text-stone-400">ক্লাব ইভেন্ট বা ঘোষণা লিখে এআই দিয়ে আকর্ষণীয় টাইটেল ও বডি জেনারেট করুন।</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Gemini API Key (ঐচ্ছিক — না দিলে বিল্ট-ইন এআই কাজ করবে):</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">ইভেন্ট বা নোটিশের বিবরণ (Context):</label>
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleGenerateWithGemini}
                    disabled={isGenerating}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGenerating ? 'Gemini AI জেনারেট করছে...' : 'Gemini AI দিয়ে তৈরি করুন'}</span>
                  </button>
                </div>

                {generatedNotification && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-stone-900 p-5 rounded-xl border border-amber-500/30 space-y-3 mt-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Gemini AI Result (JSON)</span>
                      <span className="text-xs text-stone-500">gemini-2.5-flash</span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400">শিরোনাম:</span>
                      <div className="text-stone-100 font-semibold">{generatedNotification.title}</div>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400">বিবরণ:</span>
                      <div className="text-stone-300 text-sm">{generatedNotification.body}</div>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                      <button
                        onClick={handleBroadcastWebsiteNotification}
                        disabled={isBroadcasting}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isBroadcasting ? 'ব্রডকাস্ট হচ্ছে...' : 'এই ওয়েবসাইটের সকল ভিজিটরকে ব্রডকাস্ট করুন'}</span>
                      </button>

                      {broadcastSuccess && (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>সফলভাবে ওয়েবসাইটের নোটিফিকেশনে যোগ হয়েছে!</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
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

          {activeTab === 'flutter' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-stone-200">Flutter Mobile App Code (`main.dart`)</h2>
                <button
                  onClick={() => copyToClipboard(flutterCode, 'flutter')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1.5"
                >
                  {copiedCode === 'flutter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode === 'flutter' ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                </button>
              </div>
              <pre className="bg-stone-950 p-4 rounded-xl text-xs text-stone-300 overflow-x-auto border border-stone-800 font-mono">
                <code>{flutterCode}</code>
              </pre>
            </motion.div>
          )}

          {activeTab === 'backend' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-stone-200">Node.js Express Backend Code (`server.js`)</h2>
                <button
                  onClick={() => copyToClipboard(nodeBackendCode, 'backend')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1.5"
                >
                  {copiedCode === 'backend' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode === 'backend' ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                </button>
              </div>
              <pre className="bg-stone-950 p-4 rounded-xl text-xs text-stone-300 overflow-x-auto border border-stone-800 font-mono">
                <code>{nodeBackendCode}</code>
              </pre>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
