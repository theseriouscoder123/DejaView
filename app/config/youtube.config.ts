import {
  Sparkles,
  Gamepad2,
  Music,
  Film,
  Trophy,
  Target,
} from 'lucide-react';
import { Country, CategoryConfig } from '@/app/types/youtube.types';

export const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
export const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const COUNTRIES: Country[] = [
  { code: 'global', name: 'Global', flag: '🌍' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
];

export const CATEGORIES: CategoryConfig = {
  all: { id: 'all', name: 'Overall', icon: Sparkles },
  '20': { id: '20', name: 'Gaming', icon: Gamepad2 },
  '10': { id: '10', name: 'Music', icon: Music },
  '24': { id: '24', name: 'Entertainment', icon: Film },
  '17': { id: '17', name: 'Sports', icon: Trophy },
  '28': { id: '28', name: 'Science & Tech', icon: Target },
};

export const MAIN_TABS = [
  'overview',
  'leaderboard',
  'analytics',
  'intelligence',
  'explorer',
];

export const CHART_COLORS = {
  viral: '#FF3366',
  warning: '#FFB800',
  info: '#00D4FF',
  secondary: '#94A3B8',
  success: '#00F5A0',
};

