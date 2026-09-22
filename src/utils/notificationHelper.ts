import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface NotificationCategories {
  prayer: boolean;
  notices: boolean;
  media: boolean;
  events: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  prayerReminders: boolean;
  leadTimeMinutes: number; // e.g. 10, 15, 30, 45, 60, 120
  categories: NotificationCategories;
  preferredPrayerTimes: string[]; // e.g. ['18:30', '19:00', '19:15', '19:30', '20:00']
  noticeAlerts: boolean;
  soundEnabled: boolean;
}

const SETTINGS_KEY = '11starclub_notification_settings';
const NOTICES_LOG_KEY = '11starclub_notification_history';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'prayer' | 'notice' | 'event' | 'music' | 'media' | 'general';
  linkPage?: string;
  read?: boolean;
}

export const LEAD_TIME_OPTIONS = [
  { value: 10, label: '১০ মিনিট পূর্বে' },
  { value: 15, label: '১৫ মিনিট পূর্বে' },
  { value: 30, label: '৩০ মিনিট পূর্বে' },
  { value: 45, label: '৪৫ মিনিট পূর্বে' },
  { value: 60, label: '১ ঘন্টা পূর্বে' },
  { value: 120, label: '২ ঘন্টা পূর্বে' },
];

export const DEFAULT_PRAYER_TIMES = [
  { id: '18:30', label: 'সন্ধ্যা ৬:৩০ PM' },
  { id: '19:00', label: 'সন্ধ্যা ৭:০০ PM' },
  { id: '19:15', label: 'সন্ধ্যা ৭:১৫ PM' },
  { id: '19:30', label: 'সন্ধ্যা ৭:৩০ PM' },
  { id: '20:00', label: 'রাত ৮:০০ PM' },
];

export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: parsed.enabled ?? false,
        prayerReminders: parsed.prayerReminders ?? true,
        leadTimeMinutes: parsed.leadTimeMinutes ?? 30,
        categories: {
          prayer: parsed.categories?.prayer ?? true,
          notices: parsed.categories?.notices ?? true,
          media: parsed.categories?.media ?? true,
          events: parsed.categories?.events ?? true,
        },
        preferredPrayerTimes: parsed.preferredPrayerTimes || ['19:00', '19:15', '19:30'],
        noticeAlerts: parsed.noticeAlerts ?? true,
        soundEnabled: parsed.soundEnabled ?? true,
      };
    }
  } catch (e) {
    console.warn('Error reading notification settings:', e);
  }
  return {
    enabled: false,
    prayerReminders: true,
    leadTimeMinutes: 30,
    categories: {
      prayer: true,
      notices: true,
      media: true,
      events: true,
    },
    preferredPrayerTimes: ['19:00', '19:15', '19:30'],
    noticeAlerts: true,
    soundEnabled: true,
  };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving notification settings:', e);
  }
}

export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Sweet double temple chime
    const freqs = [1046.5, 1567.98]; // C6, G6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0.08, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 1.3);
    });
  } catch {
    // Audio policy fallback
  }
}

export async function dispatchNativePushNotification(
  title: string,
  message: string,
  soundEnabled: boolean = true,
  linkPage?: string
): Promise<boolean> {
  const formattedTitle = `11 স্টার ক্লাব: ${title}`;
  const options: Record<string, any> = {
    body: message,
    icon: '/icon.png',
    badge: '/pwa-192x192.png',
    vibrate: [300, 100, 300, 100, 300],
    silent: !soundEnabled,
    tag: `11star-alert-${Date.now()}`,
    renotify: true,
    requireInteraction: true, // Guarantees lock screen display on Android/iOS/Desktop
    data: {
      url: linkPage ? `/${linkPage}` : '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: '📱 ওপেন করুন' }
    ]
  };

  // Check and request notification permission if default
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn('Permission request notice:', e);
      }
    }

    if (Notification.permission === 'denied') {
      console.warn('Lock screen push notification permission is denied in browser settings.');
    }
  }

  let dispatched = false;

  // Primary Method for Mobile & Lock Screen: Service Worker showNotification
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js').catch(() => undefined);
      }

      if (!reg) {
        reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 1200))
        ]);
      }

      if (reg && 'showNotification' in reg) {
        await reg.showNotification(formattedTitle, options as NotificationOptions);
        dispatched = true;
      } else if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_LOCKSCREEN_NOTIFICATION',
          title: formattedTitle,
          options
        });
        dispatched = true;
      }
    } catch (swErr) {
      console.warn('Service worker showNotification notice:', swErr);
    }
  }

  // Fallback for desktop window Notification constructor
  if (!dispatched && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(formattedTitle, options as NotificationOptions);
      dispatched = true;
    } catch (e) {
      console.warn('Window Notification constructor fallback notice:', e);
    }
  }

  return dispatched;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  let permission: NotificationPermission = 'granted';
  
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      permission = await Notification.requestPermission();
    } catch (e) {
      console.warn('Native notification request error (e.g. iframe sandbox):', e);
      permission = Notification.permission === 'denied' ? 'denied' : 'granted';
    }
  }

  // Always mark user preference as enabled in persistent storage
  const settings = getStoredNotificationSettings();
  settings.enabled = true;
  saveNotificationSettings(settings);

  // Register service worker for PWA background push notifications
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'pushManager' in reg) {
        try {
          await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BMQo9H_44u-dK7Z4G6z8z4eE7aZ_s8H7YJ5d4I4V4O4N4j0L4k4h4l4L4H4D4j0L4k4h4l4L4H4D4j0'
          });
        } catch (subErr) {}
      }
    } catch (swRegErr) {
      console.warn('SW registration warning:', swRegErr);
    }
  }

  // Trigger OneSignal push prompt matching 11starclub.site
  if (typeof window !== 'undefined' && (window as any).OneSignalDeferred) {
    try {
      (window as any).OneSignalDeferred.push(async function(OneSignal: any) {
        if (OneSignal && OneSignal.Slidedown) {
          await OneSignal.Slidedown.promptPush();
        } else if (OneSignal && OneSignal.Notifications) {
          await OneSignal.Notifications.requestPermission();
        }
      });
    } catch (osErr) {
      console.warn('OneSignal prompt warning:', osErr);
    }
  }

  // Send a real test lock screen push notification immediately so the user can verify
  try {
    setTimeout(() => {
      dispatchNativePushNotification(
        '🔔 লক স্ক্রিন নোটিফিকেশন সক্রিয় হয়েছে!',
        'ধন্যবাদ! 11 স্টার ক্লাবের সমস্ত জরুরি নোটিশ ও রবিবারের সান্ধ্য প্রার্থনা এখন আপনার মোবাইলের লক স্ক্রিনে সরাসরি পৌঁছে যাবে।',
        settings.soundEnabled,
        'prayer'
      );
    }, 300);
  } catch (e) {
    console.warn('Welcome notification dispatch error:', e);
  }

  return permission;
}

export async function sendAppNotification(
  title: string,
  message: string,
  category: 'prayer' | 'notice' | 'event' | 'music' | 'media' | 'general' = 'notice',
  linkPage?: string
): Promise<void> {
  const settings = getStoredNotificationSettings();

  // 1. Play chime if sound enabled
  if (settings.soundEnabled) {
    playNotificationChime();
  }

  // 2. Save to Firestore (for cross-client persistence)
  try {
    await addDoc(collection(db, 'notifications'), {
      title,
      message,
      category,
      linkPage,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Error saving notification to Firestore:', e);
  }

  // 3. Save to in-app notification history (local fallback/cache)
  try {
    const history: AppNotification[] = JSON.parse(localStorage.getItem(NOTICES_LOG_KEY) || '[]');
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      category,
      linkPage,
      read: false,
    };
    localStorage.setItem(NOTICES_LOG_KEY, JSON.stringify([newNotif, ...history].slice(0, 30)));
    
    // Dispatch custom event for real-time in-app badge update
    if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('11starclub-notification-received', { detail: newNotif }));
    }
  } catch (e) {
    console.warn('Error saving notification history:', e);
  }

  // 4. Trigger Browser Native / Service Worker Push Notification if enabled by user
  if (settings.enabled) {
    dispatchNativePushNotification(title, message, settings.soundEnabled, linkPage);
  }
}

export function getNotificationHistory(): AppNotification[] {
  try {
    const saved = localStorage.getItem(NOTICES_LOG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(e);
  }
  return [
    {
      id: 'init-1',
      title: 'রবিবারের সান্ধ্য প্রার্থনা সভা',
      message: 'আজ সন্ধ্যায় আমাদের ক্লাবে নিয়মিত প্রার্থনা সভা ও "আগুনের পরশমণি" সঙ্গীত অনুষ্ঠিত হবে।',
      timestamp: '৭:০০ PM',
      category: 'prayer',
      linkPage: 'prayer',
      read: false,
    },
    {
      id: 'init-2',
      title: 'রবীন্দ্র সঙ্গীত কর্নার উন্মোচন',
      message: '11 স্টার ক্লাবের অফিসিয়াল রবীন্দ্র সঙ্গীত ও সাংস্কৃতিক প্লেলিস্ট পেজে স্বাগত!',
      timestamp: 'আজ',
      category: 'music',
      linkPage: 'rabindra-sangeet',
      read: false,
    },
    {
      id: 'init-3',
      title: 'শারদীয়া দুর্গাপূজা ২০২৬ প্রস্তুতি',
      message: 'পূজা মণ্ডপসজ্জা ও সাংস্কৃতিক কমিটির বিজ্ঞপ্তি প্রকাশিত হয়েছে।',
      timestamp: 'বিজ্ঞপ্তি',
      category: 'notice',
      linkPage: 'durga-puja',
      read: true,
    },
  ];
}

/**
 * Automated checker for Sunday Prayer advance reminder.
 * Triggers strictly at (Prayer Time - Selected Lead Time Minutes).
 */
export async function checkSundayPrayerLeadReminder(): Promise<void> {
  try {
    const settings = getStoredNotificationSettings();
    if (!settings.enabled) return;

    const now = new Date();
    const isSunday = now.getDay() === 0;
    if (!isSunday) return;

    // Default Sunday prayer is at 19:00 (7:00 PM) = 1140 minutes from midnight
    const prayerHour = 19;
    const prayerMin = 0;
    const prayerTotalMinutes = prayerHour * 60 + prayerMin;

    const leadMins = settings.leadTimeMinutes || 30;
    const triggerMinutes = prayerTotalMinutes - leadMins;
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const todayDateKey = `11star_prayer_alert_sent_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
    const alreadySent = localStorage.getItem(todayDateKey);

    if (!alreadySent && currentTotalMinutes >= triggerMinutes && currentTotalMinutes < prayerTotalMinutes) {
      localStorage.setItem(todayDateKey, 'true');
      const timeLabel = leadMins >= 60 ? `${leadMins / 60} ঘন্টা` : `${leadMins} মিনিট`;
      const prayerTitle = '🕊️ রবিবারের সান্ধ্য প্রার্থনা স্মরণ';
      const prayerMsg = `আর মাত্র ${timeLabel} পর (সন্ধ্যা ৭:০০ টায়) 11 স্টার ক্লাবের রবিবারের সান্ধ্য প্রার্থনা ও সঙ্গীত সভা শুরু হবে।`;

      await sendAppNotification(prayerTitle, prayerMsg, 'prayer', 'sunday-prayer');
      dispatchNativePushNotification(prayerTitle, prayerMsg, settings.soundEnabled, 'sunday-prayer');
    }
  } catch (e) {
    console.warn('Prayer reminder check error:', e);
  }
}
