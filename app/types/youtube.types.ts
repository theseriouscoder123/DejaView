
export type DurationBucket =
  | '<1min'
  | '1-3min'
  | '3-8min'
  | '8-15min'
  | '15-30min'
  | '30min+';

export type RecencyBucket =
  | '<24hrs'
  | '1-7 days'
  | '7-30 days'
  | '30+ days';

export interface PerformanceTier {
  label: 'Mega Viral' | 'Viral' | 'Trending' | 'Rising';
  color: 'bg-viral' | 'bg-success' | 'bg-warning' | 'bg-info';
}

export interface Video {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: Date;
  thumbnail: string;
  categoryId: string;
  channelId: string;
  lang: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
  ageInHours: number;
  viralVelocity: number;
  successScore: number;
  durationSeconds: number;
  durationBucket: DurationBucket;
  recencyBucket: RecencyBucket;
  performanceTier: PerformanceTier;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
}

export interface CategoryConfig {
  [key: string]: Category;
}

