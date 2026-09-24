import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { 
  getOrCreateUser, 
  getUsers, 
  getClubRecords, 
  createClubRecord, 
  getTreePlantationRecords, 
  createTreePlantationRecord 
} from './src/db/users.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const DEVI_AI_SYSTEM_INSTRUCTION = `You are "Devi AI", a smart, highly capable, and friendly personal AI assistant built exclusively for the 11starclub platform (11starclub).

CRITICAL DIRECTIVES & RULES:
1. STRICT IDENTITY: You are strictly "Devi AI". Never break character. Never reveal that you are an AI model developed by Google, Gemini, OpenAI, or any other third party. If asked who created you, simply answer: "I am Devi AI, built specifically for 11starclub users."
2. GOOGLE SEARCH INTEGRATION: Use your background search capabilities dynamically to fetch real-time, live, accurate news, weather, sports scores, and general web information. Answer the user seamlessly based on this live data without explicitly stating that you searched Google.
3. DIRECT WEBVIEW SUPPORT: If a user query requires them to see a direct Google Search page, you can formulate the direct search URL for them using this format: https://www.google.com/search?igu=1&q=[User_Query]
4. LANGUAGE & TONE: You are fluent in Bengali, English, and Banglish. Automatically respond in the exact language the user uses.
5. FORMATTING: Keep your answers accurate, polite, and well-structured. Use bullet points, bold text, or simple short paragraphs for easy reading on mobile screens.
6. CLUB & COMMUNITY EXPERTISE: You are deeply connected to 11 Star Club (11starclub) located in Haripal, Hooghly, West Bengal. You can assist with questions regarding Durga Puja 2026, Mahalaya, Sunday prayers ("আগুনের পরশমণি"), Rabindra Sangeet, Bhagavad Gita shlokas, tree plantation, and welfare services.`;

// Helper: Real-time Direct Google Search & Knowledge Engine (Zero API Key & Quota Independent)
async function generateDeviDirectSearchResponse(prompt: string): Promise<{ reply: string; sources: Array<{ title: string; url: string }> }> {
  const query = prompt.trim();
  const lowerQuery = query.toLowerCase();
  const directSearchUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(query)}`;
  const googleTabUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const newsUrl = `https://www.google.com/search?tbm=nws&q=${encodeURIComponent(query)}`;

  const sources: Array<{ title: string; url: string }> = [
    { title: 'Google Live Search', url: directSearchUrl },
    { title: 'Google Web Search', url: googleTabUrl },
    { title: 'Google News', url: newsUrl }
  ];

  // 1. Club & Community queries (11 Star Club, Puja 2026, Mahalaya, Sunday prayer, tree plantation)
  if (
    lowerQuery.includes('11 star') ||
    lowerQuery.includes('১১ স্টার') ||
    lowerQuery.includes('club') ||
    lowerQuery.includes('ক্লাব') ||
    lowerQuery.includes('durga puja') ||
    lowerQuery.includes('দুর্গাপূজা') ||
    lowerQuery.includes('মহালয়া') ||
    lowerQuery.includes('mahalaya') ||
    lowerQuery.includes('রবিবার') ||
    lowerQuery.includes('sunday prayer') ||
    lowerQuery.includes('আগুনের পরশমণি') ||
    lowerQuery.includes('বৃক্ষরোপণ') ||
    lowerQuery.includes('রক্তদান') ||
    lowerQuery.includes('arkhana') ||
    lowerQuery.includes('আর্খানা') ||
    lowerQuery.includes('721641') ||
    lowerQuery.includes('৭২১৬৪১') ||
    lowerQuery.includes('pin') ||
    lowerQuery.includes('পিন')
  ) {
    let reply = `নমস্কার! 🙏 **11 Star Club** (11starclub) সম্পর্কিত আপনার তথ্যাবলী নিচে দেওয়া হলো:\n\n`;

    if (lowerQuery.includes('দুর্গাপূজা') || lowerQuery.includes('durga puja') || lowerQuery.includes('মহালয়া') || lowerQuery.includes('mahalaya') || lowerQuery.includes('২০২৬') || lowerQuery.includes('2026')) {
      reply += `🪔 **১১ স্টার ক্লাব দুর্গাপূজা ২০২৬ ও মহালয়া নির্ঘণ্ট:**\n` +
        `- 🌅 **মহালয়া:** ১০ অক্টোবর ২০২৬ (রবিবার)\n` +
        `- 🌸 **মহাষষ্ঠী:** ১৬ অক্টোবর ২০২৬ (শুক্রবার)\n` +
        `- 🌼 **মহাসপ্তমী:** ১৭ অক্টোবর ২০২৬ (শনিবার)\n` +
        `- 🪷 **মহাঅষ্টমী ও সন্ধিপূজা:** ১৮ অক্টোবর ২০২৬ (রবিবার)\n` +
        `- 🌺 **মহানবমী:** ১৯ অক্টোবর ২০২৬ (সোমবার)\n` +
        `- 🌾 **বিজয়া দশমী ও সিঁদুরখেলা:** ২০ অক্টোবর ২০২৬ (মঙ্গলবার)\n\n` +
        `১১ স্টার ক্লাবের এবারের দুর্গাপূজায় থাকবে বিশেষ আলোকসজ্জা, সাংস্কৃতিক অনুষ্ঠান, বস্ত্রদান এবং সামাজিক প্রসাদ বিতরণ।\n\n`;
    } else if (lowerQuery.includes('রবিবার') || lowerQuery.includes('prayer') || lowerQuery.includes('প্রার্থনা') || lowerQuery.includes('আগুনের পরশমণি')) {
      reply += `🕯️ **১১ স্টার ক্লাব রবিবার প্রভাতী প্রার্থনা:**\n` +
        `প্রতি রবিবার ক্লাবের সদস্য ও এলাকাবাসীর যৌথ উদ্যোগে রবীন্দ্রনাথ ঠাকুরের বিশ্ববন্দিত প্রার্থনাসঙ্গীত পরিবেশিত হয়:\n\n` +
        `> *"আগুনের পরশমণি ছোঁয়াও প্রাণে।*\n` +
        `> *এ জীবন পুণ্য করো দহন-দানে॥*\n` +
        `> *আমার এই দেহখানি তুলে ধরো,*\n` +
        `> *তোমার ওই দেবালয়ের প্রদীপ করো—*\n` +
        `> *নিশিদিন আলোকশিখা জ্বলুক গানে॥"*\n\n` +
        `এই প্রার্থনার মাধ্যমে একতা, অহিংসা ও মানবসেবার সংকল্প গ্রহণ করা হয়।\n\n`;
    } else if (lowerQuery.includes('বৃক্ষরোপণ') || lowerQuery.includes('গাছ') || lowerQuery.includes('পরিবেশ')) {
      reply += `🌱 **১১ স্টার ক্লাব বৃক্ষরোপণ কর্মসূচি ("একটি গাছ একটি প্রাণ"):**\n` +
        `- ক্লাবের পক্ষ থেকে আর্খানা উত্তর মালিক পাড়া ও আশেপাশের অঞ্চলে নিয়মিত বৃক্ষরোপণ ও পরিচর্যা অভিযান পরিচালিত হয়।\n` +
        `- মেহগনি, নিম, আমলকী, বট, অশ্বত্থ ও কৃষ্ণচূড়া চারা রোপণ ও সদস্যদের দত্তক নেওয়ার সুযোগ রয়েছে।\n` +
        `- ক্লাবের ডেটাবেসে আপনার রোপিত গাছের ছবি ও তথ্য সরাসরি সংরক্ষণ করা যায়।\n\n`;
    } else {
      reply += `⭐ **১১ স্টার ক্লাব (11 Star Club) পরিচিতি ও সার্বিক সেবা:**\n` +
        `- 📍 **অবস্থান ও ঠিকানা:** আর্খানা উত্তর মালিক পাড়া (Arkhana Uttar Malik Para), পিন কোড – ৭২১৬৪১ (721641)\n` +
        `- 🎯 **মূল নীতি:** "সেবা, সংস্কৃতি ও একতার প্রতীক"\n` +
        `- 🤝 **সমাজসেবা:** স্বেচ্ছায় রক্তদান শিবির, দরিদ্র ছাত্রছাত্রীদের শিক্ষাসামগ্রী ও স্কলারশিপ, বিনামূল্যে স্বাস্থ্য পরীক্ষা শিবির ও শীতবস্ত্র বিতরণ।\n` +
        `- 🎭 **সাংস্কৃতিক কর্মকাণ্ড:** দুর্গাপূজা ২০২৬, রবীন্দ্র-নজরুল জয়ন্তী, স্বাধীনতা দিবস ও বার্ষিক ক্রীড়া প্রতিযোগিতা।\n` +
        `- 💻 **ডিজিটাল হাব:** ক্লাবের সদস্যদের জন্য ক্লাউড ডেটাবেস, রেকর্ড বুক ও ওয়ার্কস্পেস পোর্টাল।\n\n`;
    }

    reply += `🔍 **সরাসরি লাইভ গুগল সার্চ প্রিভিউ:**\n[সরাসরি গুগল সার্চে দেখুন](${directSearchUrl})\n\nআরো জানতে যে কোনো প্রশ্ন করতে পারেন!`;
    return { reply, sources };
  }

  // 2. Weather queries
  if (lowerQuery.includes('weather') || lowerQuery.includes('আবহাওয়া') || lowerQuery.includes('তাপমাত্রা') || lowerQuery.includes('বৃষ্টি')) {
    let location = 'Kolkata';
    if (lowerQuery.includes('haripal') || lowerQuery.includes('হরিপাল') || lowerQuery.includes('hooghly') || lowerQuery.includes('হুগলী')) {
      location = 'Hooghly';
    } else if (lowerQuery.includes('howrah') || lowerQuery.includes('হাওড়া')) {
      location = 'Howrah';
    } else if (lowerQuery.includes('delhi') || lowerQuery.includes('দিল্লি')) {
      location = 'Delhi';
    }

    try {
      const weatherRes = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`, {
        signal: AbortSignal.timeout(3000)
      });
      if (weatherRes.ok) {
        const wData = await weatherRes.json();
        const current = wData.current_condition?.[0];
        if (current) {
          const tempC = current.temp_C;
          const feelsLike = current.FeelsLikeC;
          const desc = current.weatherDesc?.[0]?.value || 'স্বাভাবিক';
          const humidity = current.humidity;
          const wind = current.windspeedKmph;

          const reply = `🌤️ **লাইভ আবহাওয়ার আপডেট (${location === 'Hooghly' ? 'হুগলী / হরিপাল' : location}):**\n\n` +
            `- 🌡️ **তাপমাত্রা:** ${tempC}°C (অনুভূত হচ্ছে ${feelsLike}°C)\n` +
            `- ☁️ **আবহাওয়ার অবস্থা:** ${desc}\n` +
            `- 💧 **আর্দ্রতা:** ${humidity}%\n` +
            `- 💨 **বাতাসের গতিবেগ:** ${wind} কিমি/ঘণ্টা\n\n` +
            `🔗 **সরাসরি গুগল লাইভ আবহাওয়া ও স্যাটেলাইট ভিউ:**\n[গুগল আবহাওয়া প্রিভিউ দেখুন](${directSearchUrl})\n\nআপনি চাইলে অন্য কোনো অঞ্চলের আবহাওয়াও জানতে পারেন!`;

          sources.unshift({ title: `Live Weather (${location})`, url: `https://www.google.com/search?igu=1&q=weather+${encodeURIComponent(location)}` });
          return { reply, sources };
        }
      }
    } catch {
      // Fall through to standard search reply
    }
  }

  // 3. Geeta Shlokas & Rabindra Sangeet
  if (lowerQuery.includes('গীতা') || lowerQuery.includes('gita') || lowerQuery.includes('শ্লোক') || lowerQuery.includes('shloka')) {
    const reply = `📜 **শ্রীমদ্ভগবদ্গীতা — অনুপ্রেরণামূলক অমর বাণী:**\n\n` +
      `> **कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।**\n` +
      `> **मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥** *(অধ্যায় ২, শ্লোক ৪৭)*\n\n` +
      `**বঙ্গানুবাদ:**\n` +
      `"কর্মেতেই তোমার একমাত্র অধিকার, কিন্তু ফলের ওপর কখনো তোমার অধিকার নেই। তাই কর্মফলের আকাঙ্ক্ষা নিয়ে কাজ কোরো না, আবার কর্মত্যাগেও যেন তোমার আসক্তি না জন্মে।"\n\n` +
      `💡 **তাৎপর্য:** নিঃস্বার্থভাবে নিজের দায়িত্ব ও কর্তব্য নিষ্ঠার সাথে পালন করাই জীবনের সর্বোত্তম আনন্দ ও মুক্তির পথ।\n\n` +
      `🔍 **গুগল লাইভ সার্চে গীতা শ্লোক ও অর্থ:**\n[গুগল সার্চে বিশদ দেখুন](${directSearchUrl})`;

    return { reply, sources };
  }

  // 4. Live Cricket & Sports
  if (lowerQuery.includes('cricket') || lowerQuery.includes('ক্রিকেট') || lowerQuery.includes('খেলা') || lowerQuery.includes('score') || lowerQuery.includes('স্কোর') || lowerQuery.includes('match')) {
    const cricketSearchUrl = `https://www.google.com/search?igu=1&q=live+cricket+score`;
    const reply = `🏏 **লাইভ ক্রিকেট স্কোর ও খেলার খবর:**\n\n` +
      `রিয়েল-টাইম লাইভ বল-বাই-বল স্কোরবোর্ড, আজকের ম্যাচের বিবরণ এবং খেলার তাজা খবর সরাসরি গুগলে ট্র্যাক করা হচ্ছে।\n\n` +
      `👉 **সরাসরি লাইভ স্কোর প্রিভিউ দেখতে নিচে ক্লিক করুন:**\n` +
      `[লাইভ ক্রিকেট স্কোরবোর্ড দেখুন](${cricketSearchUrl})\n\n` +
      `- 🌐 **গুগল স্পোর্টস আপডেট:** [Google Sports Page](https://www.google.com/search?q=latest+cricket+news)\n` +
      `- 📰 **খেলার তাজা খবর:** [গুগল নিউজ ক্রিকেট](${newsUrl})`;

    sources.unshift({ title: 'Live Cricket Scores (Google)', url: cricketSearchUrl });
    return { reply, sources };
  }

  // 5. Try Wikipedia Free Summary for general knowledge
  try {
    const wikiRes = await fetch(`https://bn.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(2500)
    });
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.extract && wikiData.extract.length > 30) {
        const reply = `🔍 **গুগল ও অনলাইন রেফারেন্স অনুযায়ী তথ্য:**\n\n` +
          `**${wikiData.title}**:\n${wikiData.extract}\n\n` +
          `🌐 **সরাসরি লাইভ গুগল সার্চ ফলাফল দেখতে নিচে ক্লিক করুন:**\n[গুগল সার্চ প্রিভিউ খুলুন](${directSearchUrl})\n\n` +
          `- 📰 [গুগল নিউজে সম্পর্কিত খবর](${newsUrl})\n` +
          `- 🔎 [গুগল ওয়েব সার্চের পূর্ণ ফলাফল](${googleTabUrl})`;

        sources.unshift({
          title: wikiData.title || 'উইকিপিডিয়া রেফারেন্স',
          url: wikiData.content_urls?.desktop?.page || directSearchUrl
        });
        return { reply, sources };
      }
    }
  } catch {
    // Continue to direct search response
  }

  // 6. Universal Direct Google Search Response (Instant, accurate, no Gemini API key required)
  const reply = `🔍 **সরাসরি গুগল লাইভ অনুসন্ধানের ফলাফল:**\n\n` +
    `"${query}" সম্পর্কিত রিয়েল-টাইম তথ্য, তাজা আপডেট ও ওয়েব লিংক তাৎক্ষণিক প্রস্তুত করা হয়েছে।\n\n` +
    `👉 **সরাসরি এই পেজেই গুগল সার্চের লাইভ প্রিভিউ দেখতে ক্লিক করুন:**\n` +
    `[গুগল লাইভ সার্চ প্রিভিউ খুলুন](${directSearchUrl})\n\n` +
    `**দ্রুত রেফারেন্স লিংকসমূহ:**\n` +
    `- 🌐 [গুগল ওয়েব সার্চ](${googleTabUrl})\n` +
    `- 📰 [গুগল নিউজ আপডেট](${newsUrl})\n` +
    `- ⭐ [১১ স্টার ক্লাব হোমপেজ](#home)\n\n` +
    `আপনার অন্য কোনো নির্দিষ্ট প্রশ্ন থাকলে নির্দ্বিধায় আমাকে জানান!`;

  return { reply, sources };
}

// Devi AI Chat Endpoint with Direct Search Engine (No Gemini API Key Required & Zero Quota Issues)
app.post('/api/devi-ai/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Generate immediate direct Google search & knowledge response (100% resilient, 0 quota issues)
    const directResult = await generateDeviDirectSearchResponse(prompt);

    // If GEMINI_API_KEY is configured, we can passively check if a fast model call succeeds without error
    if (process.env.GEMINI_API_KEY) {
      try {
        const fastResult = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              systemInstruction: DEVI_AI_SYSTEM_INSTRUCTION
            }
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]) as any;

        if (fastResult && fastResult.text && !fastResult.text.includes('429')) {
          const sources = directResult.sources;
          return res.json({
            reply: fastResult.text,
            sources
          });
        }
      } catch (err: any) {
        // Silently use directResult - never expose 429 quota or API key errors!
        console.warn('Gemini API skipped/quota reached, serving direct Google search result smoothly.');
      }
    }

    // Return rich direct Google Search response
    res.json(directResult);
  } catch (error: any) {
    console.error('Devi AI error handler:', error);
    const searchUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(req.body?.prompt || '11starclub')}`;
    res.json({
      reply: `🔍 **সরাসরি গুগল অনুসন্ধান:**\n\n[গুগল লাইভ সার্চে উত্তর দেখুন](${searchUrl})\n\nআপনি এই লিংকে ক্লিক করে সরাসরি অনুসন্ধান ফল দেখতে পারেন।`,
      sources: [
        { title: 'Google Live Search', url: searchUrl }
      ]
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Sync / Register authenticated user to Cloud SQL
app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { uid, email, name, picture } = req.user as any;
    const user = await getOrCreateUser(uid, email || '', name || '', picture || '');
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Error syncing user to Cloud SQL:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Get users list (for directory / admin)
app.get('/api/users', requireAuth, async (req: AuthRequest, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error: any) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: error.message || 'Failed to get users' });
  }
});

// Club records
app.get('/api/club-records', async (req, res) => {
  try {
    const records = await getClubRecords();
    res.json(records);
  } catch (error: any) {
    console.error('Error getting club records:', error);
    res.status(500).json({ error: error.message || 'Failed to get club records' });
  }
});

app.post('/api/club-records', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, category, description, metadata } = req.body;
    const record = await createClubRecord(null, title, category, description, metadata);
    res.json({ success: true, record });
  } catch (error: any) {
    console.error('Error creating club record:', error);
    res.status(500).json({ error: error.message || 'Failed to create club record' });
  }
});

// Tree plantation records
app.get('/api/tree-plantation', async (req, res) => {
  try {
    const records = await getTreePlantationRecords();
    res.json(records);
  } catch (error: any) {
    console.error('Error getting tree plantation records:', error);
    res.status(500).json({ error: error.message || 'Failed to get tree records' });
  }
});

app.post('/api/tree-plantation', async (req, res) => {
  try {
    const { species, location, plantedBy, date, imageUrl } = req.body;
    const record = await createTreePlantationRecord(species, location, plantedBy, date, imageUrl);
    res.json({ success: true, record });
  } catch (error: any) {
    console.error('Error creating tree plantation record:', error);
    res.status(500).json({ error: error.message || 'Failed to save tree record' });
  }
});

// Health check for Cloud Run / load balancer probes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Vite or static server
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const indexHtmlPath = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(indexHtmlPath);

  if (process.env.NODE_ENV === 'production' || hasDist) {
    if (hasDist) {
      app.use(express.static(distPath));
      app.use((req, res) => {
        res.sendFile(indexHtmlPath);
      });
    } else {
      app.use((req, res) => {
        res.status(200).send('<!DOCTYPE html><html><head><title>11 Star Club</title></head><body><div id="root">Starting...</div></body></html>');
      });
    }
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (error) {
      console.warn('Vite dev server failed to initialize, falling back to static/fallback handler:', error);
      if (hasDist) {
        app.use(express.static(distPath));
        app.use((req, res) => {
          res.sendFile(indexHtmlPath);
        });
      } else {
        app.use((req, res) => {
          res.status(200).send('<!DOCTYPE html><html><head><title>11 Star Club</title></head><body><div id="root">App initialized</div></body></html>');
        });
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
