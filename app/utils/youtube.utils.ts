import {
  DurationBucket,
  RecencyBucket,
  PerformanceTier,
} from '@/app/types/youtube.types';

export const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match?.[1] || '0');
  const minutes = parseInt(match?.[2] || '0');
  const seconds = parseInt(match?.[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const getDurationBucket = (seconds: number): DurationBucket => {
  if (seconds <= 60) return '<1min';
  if (seconds < 180) return '1-3min';
  if (seconds < 480) return '3-8min';
  if (seconds < 900) return '8-15min';
  if (seconds < 1800) return '15-30min';
  return '30min+';
};

export const getRecencyBucket = (hours: number): RecencyBucket => {
  if (hours < 24) return '<24hrs';
  if (hours < 168) return '1-7 days';
  if (hours < 720) return '7-30 days';
  return '30+ days';
};

export const getPerformanceTier = (views: number): PerformanceTier => {
  if (views >= 10000000) return { label: 'Mega Viral', color: 'bg-viral' };
  if (views >= 1000000) return { label: 'Viral', color: 'bg-success' };
  if (views >= 100000) return { label: 'Trending', color: 'bg-warning' };
  return { label: 'Rising', color: 'bg-info' };
};

