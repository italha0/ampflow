'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Connection, Platform } from '@/lib/types';
import { Query } from 'appwrite';

export default function DashboardPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await account.get();
      setUserId(user.$id);

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONNECTIONS,
        [Query.equal('userId', user.$id)]
      );

      setConnections(response.documents as any);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionByPlatform = (platform: Platform) => {
    return connections.find((c) => c.platform === platform);
  };

  const platforms = [
    {
      name: 'YouTube',
      platform: 'youtube' as Platform,
      icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.036v7.928a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4z',
      color: 'from-red-500 to-red-600',
    },
    {
      name: 'Discord',
      platform: 'discord' as Platform,
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      name: 'Telegram',
      platform: 'telegram' as Platform,
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Whop',
      platform: 'whop' as Platform,
      icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen bg-dark-950">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-dark-400">Manage your platform connections</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-dark-900 border border-dark-800 rounded-xl p-6 animate-pulse">
                    <div className="h-12 w-12 bg-dark-800 rounded-xl mb-4"></div>
                    <div className="h-6 bg-dark-800 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-dark-800 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {platforms.map((platform) => {
                  const connection = getConnectionByPlatform(platform.platform);
                  const isConnected = !!connection;

                  return (
                    <div
                      key={platform.platform}
                      className="bg-dark-900 border border-dark-800 rounded-xl p-6 hover:border-dark-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center`}>
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={platform.icon} />
                          </svg>
                        </div>
                        {isConnected && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Connected
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2">{platform.name}</h3>

                      {isConnected ? (
                        <div className="space-y-2">
                          <p className="text-sm text-dark-400">
                            {connection.username || connection.channelId || 'Connected'}
                          </p>
                          <button className="text-sm text-red-500 hover:text-red-400 font-medium">
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-dark-400 mb-3">Not connected</p>
                          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
                            Connect
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
