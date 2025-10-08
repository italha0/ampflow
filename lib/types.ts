export type Platform = 'youtube' | 'discord' | 'telegram' | 'whop';

export interface Connection {
  $id: string;
  userId: string;
  platform: Platform;
  username?: string;
  channelId?: string;
  accessToken?: string;
  refreshToken?: string;
  botToken?: string;
  guildId?: string;
  createdAt: string;
}

export interface Automation {
  $id: string;
  userId: string;
  youtubeConnectionId: string;
  targetConnectionIds: string[];
  messageTemplate: string;
  isActive: boolean;
  createdAt: string;
}

export interface YouTubeSubscription {
  $id: string;
  youtubeChannelId: string;
  callbackUrl: string;
  hubSecret: string;
  status: 'pending' | 'subscribed' | 'unsubscribed';
  expiryDate: string;
  createdAt: string;
}

export interface VideoDetails {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
}
