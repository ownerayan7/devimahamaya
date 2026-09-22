import React, { useState, useEffect } from "react";
import { 
  X, Lock, ShieldCheck, Mail, Phone, Calendar, Trash2, 
  CheckCircle2, AlertCircle, Search, RefreshCw, KeyRound, ExternalLink, Download, MessageSquare, Eye, EyeOff
} from "lucide-react";
import { CLUB_INFO } from "../data/clubData";

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  replied?: boolean;
}

const STORAGE_KEY = "eleven_star_club_messages_v2";
const ADMIN_PASSWORD = "Ayan@2024";

// Sample initial messages so the inbox is never confusingly empty
const INITIAL_DEMO_MESSAGES: ContactMessage[] = [
  {
    id: "MSG-1001",
    name: "অয়ন মালিক",
    phone: "9876543210",
    subject: "পূজা প্রস্তুতি ও স্বাগতম বার্তা",
    message: "11 স্টার ক্লাবের অফিসিয়াল ওয়েবসাইট ও অ্যাডমিন ইনবক্স সক্রিয় হয়েছে। দর্শনার্থীদের সকল নতুন মেসেজ এখানে সরাসরি সংরক্ষিত হবে।",
    timestamp: "27/08/2026, 06:30 PM",
    read: true,
    replied: true,
  },
  {
    id: "MSG-1002",
    name: "সৌমেন জানা (দর্শনার্থী)",
    phone: "9832109876",
    subject: "দুর্গাপূজা ২০২৬ অঞ্জলির সময়সূচি",
    message: "নমস্কার, মহাষ্টমীর পুষ্পাঞ্জলি এবং সন্ধিপূজার সময় কখন শুরু হবে তা জানতে চাইছিলাম। ধন্যবাদ।",
    timestamp: "27/08/2026, 07:15 PM",
    read: false,
    replied: false,
  }
];

export const getStoredMessages = (): ContactMessage[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_MESSAGES));
      return INITIAL_DEMO_MESSAGES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_MESSAGES;
  }
};

export const saveMessageToStorage = (msg: { name: string; phone: string; subject: string; message: string }): ContactMessage => {
  const existing = getStoredMessages();
  const newMsg: ContactMessage = {
    id: "MSG-" + Math.floor(100000 + Math.random() * 900000),
    name: msg.name,
    phone: msg.phone || "তথ্য দেওয়া নেই",
    subject: msg.subject || "সাধারণ বার্তা",
    message: msg.message,
    timestamp: new Date().toLocaleString("bn-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    read: false,
    replied: false,
  };
  const updated = [newMsg, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("club_messages_updated"));
  } catch (e) {
    console.error("Storage error", e);
  }
  return newMsg;
};

interface AdminInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminInboxModal: React.FC<AdminInboxModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>("");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "replied">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadMessages = () => {
    setMessages(getStoredMessages());
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      setIsAuthenticated(false);
      setPinInput("");
      setShowPassword(false);
      setPinError("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => loadMessages();
    window.addEventListener("club_messages_updated", handleUpdate);
    return () => window.removeEventListener("club_messages_updated", handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput("");
  };

  const toggleReadStatus = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: !m.read } : m);
    setMessages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggleRepliedStatus = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, replied: !m.replied } : m);
    setMessages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDeleteConfirmId(null);
  };

  const clearAllMessages = () => {
    if (window.confirm("আপনি কি সব সংরক্ষিত বার্তা মুছে ফেলতে চান?")) {
      localStorage.removeItem(STORAGE_KEY);
      setMessages([]);
    }
  };

  const exportMessages = () => {
    const jsonStr = JSON.stringify(messages, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `11-star-club-messages-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.phone.includes(searchQuery) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "unread") return !msg.read;
    if (selectedFilter === "replied") return msg.replied;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div id="admin-inbox-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/70 p-4 sm:p-5 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-amber-300 font-serif-bengali">
                  🔒 11 স্টার ক্লাব • অ্যাডমিন ইনবক্স
                </h2>
                {isAuthenticated && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                    {unreadCount} নতুন
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {CLUB_INFO.nameBn} • ওয়েবসাইটে আসা সকল বার্তা ও অনুসন্ধানের তালিকা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                লগআউট
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="বন্ধ করুন"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Password Authentication Gate */
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-serif-bengali">
              অ্যাডমিন পাসওয়ার্ড ভেরিফিকেশন
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              ক্লাবের গোপন ইনবক্স ও সাধারণ দর্শনার্থীদের পাঠানো বার্তাগুলো দেখার জন্য আপনার পাসওয়ার্ড দিন।
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative">
                <KeyRound className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  value={pinInput || ""}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl py-3 pl-11 pr-12 text-white text-sm outline-none transition shadow-inner font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors p-1"
                  title={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/50 p-2.5 rounded-lg border border-red-800/50 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-3 px-4 rounded-xl transition shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 text-sm"
              >
                <ShieldCheck className="w-5 h-5 text-black" />
                <span>ইনবক্স আনলক করুন</span>
              </button>
            </form>

            <div className="mt-6 text-xs text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800 w-full text-center">
              🔒 <span className="text-slate-400">এই অংশটি শুধুমাত্র ক্লাবের অনুমোদিত কর্মকর্তাদের জন্য সংরক্ষিত।</span>
            </div>
          </div>
        ) : (
          /* Authenticated Messages View */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="p-3 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap gap-2.5 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="নাম, ফোন বা বিষয় দিয়ে খুঁজুন..."
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3 py-1 rounded-md transition ${selectedFilter === "all" ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  সব ({messages.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("unread")}
                  className={`px-3 py-1 rounded-md transition ${selectedFilter === "unread" ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  অপঠিত ({unreadCount})
                </button>
                <button
                  onClick={() => setSelectedFilter("replied")}
                  className={`px-3 py-1 rounded-md transition ${selectedFilter === "replied" ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  উত্তর সম্পন্ন
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={loadMessages}
                  className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={exportMessages}
                  disabled={messages.length === 0}
                  className="p-2 text-slate-400 hover:text-amber-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition disabled:opacity-40"
                  title="ব্যাকআপ ফাইল ডাউনলোড করুন"
                >
                  <Download className="w-4 h-4" />
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={clearAllMessages}
                    className="p-2 text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 rounded-lg transition"
                    title="সব বার্তা মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
                    <Mail className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-300 mb-1">
                    কোনো বার্তা পাওয়া যায়নি
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery ? "আপনার খোঁজার সাথে কোনো বার্তা মেলেনি।" : "ওয়েবসাইটে দর্শনার্থীরা যখনই কোনো বার্তা পাঠাবেন, তা সাথে সাথে এই ইনবক্সে জমা হবে।"}
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl border p-4 transition duration-200 ${
                      !msg.read 
                        ? "bg-gradient-to-r from-slate-900 to-amber-950/40 border-amber-500/60 shadow-lg" 
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        {!msg.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" title="নতুন বার্তা" />
                        )}
                        <span className="font-bold text-white text-sm sm:text-base font-serif-bengali">
                          {msg.name}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          {msg.id}
                        </span>
                        {msg.replied && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-medium">
                            ✓ উত্তর সম্পন্ন
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    {/* Subject Badge */}
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/50">
                        বিষয়: {msg.subject}
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs sm:text-sm text-slate-200 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 mb-3 whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                      {/* Sender Contacts */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${msg.phone}`}
                          className="flex items-center gap-1 text-slate-300 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>{msg.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/91${msg.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`নমস্কার ${msg.name}, 11 স্টার ক্লাবের পক্ষ থেকে আপনার "${msg.subject}" বার্তার প্রেক্ষিতে যোগাযোগ করছি।`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/50 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>WhatsApp-এ উত্তর দিন</span>
                        </a>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => toggleReadStatus(msg.id)}
                          className={`px-2.5 py-1 rounded border transition ${
                            msg.read 
                              ? "text-slate-400 border-slate-700 hover:text-white" 
                              : "text-amber-400 border-amber-600/50 bg-amber-950/40 font-semibold"
                          }`}
                        >
                          {msg.read ? "অপঠিত করুন" : "পঠিত চিহ্নিত করুন"}
                        </button>
                        <button
                          onClick={() => toggleRepliedStatus(msg.id)}
                          className={`px-2.5 py-1 rounded border transition ${
                            msg.replied 
                              ? "text-emerald-400 border-emerald-800 bg-emerald-950/30" 
                              : "text-slate-400 border-slate-700 hover:text-white"
                          }`}
                        >
                          {msg.replied ? "উত্তর সম্পন্ন ✓" : "উত্তর চিহ্নিত করুন"}
                        </button>

                        {deleteConfirmId === msg.id ? (
                          <div className="flex items-center gap-1 bg-red-950/80 p-0.5 rounded border border-red-800">
                            <span className="text-[11px] text-red-300 px-1">মুছবেন?</span>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="bg-red-600 text-white px-2 py-0.5 rounded text-[11px] font-bold"
                            >
                              হ্যাঁ
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-slate-400 px-1 text-[11px]"
                            >
                              না
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(msg.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Footer Info */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                মোট বার্তা: <strong className="text-white">{messages.length}</strong> টি
              </span>
              <span className="text-[11px] text-slate-500">
                অ্যাডমিন মোড সক্রিয়
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
