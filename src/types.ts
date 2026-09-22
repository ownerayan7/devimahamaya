export type PageId =
  | 'home'
  | 'durga-puja'
  | 'social-services'
  | 'medical'
  | 'needy'
  | 'scholarship'
  | 'tree-plantation'
  | 'donate'
  | 'videos'
  | 'mahalaya'
  | 'radio'
  | 'gita'
  | 'prayer'
  | 'rabindra-sangeet'
  | 'shopping'
  | 'contact'
  | 'about'
  | 'gallery'
  | 'settings';

export interface PrayerItem {
  id: string;
  title: string;
  bengaliTitle?: string;
  type: 'video' | 'audio' | 'photo';
  mediaSource: 'youtube' | 'facebook' | 'local' | 'drive';
  mediaUrl: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  lyrics?: string;
  authorName?: string;
  dateAdded?: string;
  scheduledTime?: string; // e.g., '৭:০০ PM'
  isCustom?: boolean;
}

export interface RabindraSongItem {
  id: string;
  title: string;
  category: 'puja' | 'prem' | 'prakriti' | 'swadesh' | 'prayer' | string;
  categoryBengali: string;
  mediaType: 'youtube' | 'facebook' | 'audio' | 'video';
  mediaUrl: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  artist?: string;
  duration?: string;
  description?: string;
  lyrics?: string;
  isCustom?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  tag: string;
  isImportant?: boolean;
  image?: string;
  driveFolderUrl?: string;
  driveFolderTitle?: string;
  isCustom?: boolean;
}

export interface PujaScheduleItem {
  event: string;
  dateBengali: string;
  dateEnglish: string;
  description: string;
  icon: string;
  highlight?: boolean;
}

export interface ServiceItem {
  id: PageId;
  title: string;
  englishTitle: string;
  description: string;
  icon: string;
  formUrl?: string;
  documents?: string[];
  features?: string[];
  color: string;
}

export interface MahalayaTrack {
  id: number;
  title: string;
  subtitle: string;
  artist: string;
  youtubeId: string;
  youtubeUrl: string;
  audioUrl?: string;
  duration: string;
  thumbnail: string;
}

export interface RadioStation {
  id: string;
  name: string;
  bengaliName: string;
  tagline: string;
  category: 'bengali' | 'kolkata' | 'akashvani' | 'bollywood' | 'classics' | 'devotional' | 'retro' | 'international' | 'all' | string;
  categoryLabel: string;
  language: string;
  frequency?: string;
  streamUrl: string;
  backupStreamUrl?: string;
  bitrate?: string;
  location?: string;
  featured?: boolean;
  color?: string;
  logoUrl?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeId?: string;
  youtubeUrl?: string;
  videoType?: 'youtube' | 'local' | 'direct';
  videoFileUrl?: string;
  thumbnailUrl?: string;
  category: 'durga-puja' | 'social' | 'cultural' | 'shorts' | 'theme' | string;
  duration?: string;
  tag?: string;
  isCustom?: boolean;
  createdAt?: number;
}

export interface MemberVideoItem {
  id: string;
  title: string;
  description?: string;
  authorName: string;
  authorRole?: string;
  youtubeId: string;
  youtubeUrl: string;
  videoType?: 'youtube' | 'local' | 'direct';
  videoFileUrl?: string;
  thumbnailUrl?: string;
  category: 'puja' | 'live' | 'cultural' | 'social' | 'shorts' | 'memories' | string;
  tag?: string;
  duration?: string;
  dateAdded: string;
  likes?: number;
  isCustom?: boolean;
  createdAt?: number;
}

export interface ActivityTimelineItem {
  year: string;
  title: string;
  bengaliTitle: string;
  description: string;
  tag: string;
  icon: string;
}

export interface GalleryPhotoItem {
  id: number | string;
  title: string;
  category: 'theme' | 'puja' | 'cultural' | 'social' | 'education' | string;
  subtitle: string;
  url: string;
  tag: string;
  isCustom?: boolean;
}

export interface TreePlantationPhotoItem {
  id: string;
  title: string;
  category: 'plantation' | 'distribution' | 'care' | 'awareness' | string;
  subtitle: string;
  url: string;
  tag: string;
  year: string;
  isCustom?: boolean;
}

export interface MemberPhotoItem {
  id: string;
  title: string;
  caption?: string;
  authorName?: string;
  authorRole?: string;
  url: string;
  category: 'puja' | 'plantation' | 'work' | 'social' | 'memories' | string;
  tag: string;
  year: string;
  dateAdded?: string;
  likes?: number;
  isCustom?: boolean;
}
