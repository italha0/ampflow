'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Connection, Automation } from '@/lib/types';
import { Query, ID } from 'appwrite';

export default function AutomationsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedYoutubeConnection, setSelectedYoutubeConnection] = useState<string>('');
  const [messageTemplate, setMessageTemplate] = useState<string>('New video: {{video_title}}\n{{video_url}}');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await account.get();
      setUserId(user.$id);

      const [connectionsRes, automationsRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.CONNECTIONS, [
          Query.equal('userId', user.$id),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.AUTOMATIONS, [
          Query.equal('userId', user.$id),
        ]),
      ]);

      setConnections(connectionsRes.documents as any);
      setAutomations(automationsRes.documents as any);

      if (automationsRes.documents.length > 0) {
        const automation = automationsRes.documents[0] as any;
        setSelectedYoutubeConnection(automation.youtubeConnectionId);
        setMessageTemplate(automation.messageTemplate);
        setSelectedTargets(automation.targetConnectionIds);
        setIsActive(automation.isActive);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAutomation = async () => {
    if (!selectedYoutubeConnection || selectedTargets.length === 0) {
      alert('Please select a YouTube channel and at least one destination');
      return;
    }

    setIsSaving(true);
    try {
      const automationData = {
        userId,
        youtubeConnectionId: selectedYoutubeConnection,
        targetConnectionIds: selectedTargets,
        messageTemplate,
        isActive,
      };

      if (automations.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.AUTOMATIONS,
          automations[0].$id,
          automationData
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.AUTOMATIONS,
          ID.unique(),
          automationData
        );
      }

      alert('Automation saved successfully!');
      loadData();
    } catch (error) {
      console.error('Error saving automation:', error);
      alert('Failed to save automation');
    } finally {
      setIsSaving(false);
    }
  };

  const youtubeConnections = connections.filter((c) => c.platform === 'youtube');
  const targetConnections = connections.filter((c) => c.platform !== 'youtube');

  const toggleTarget = (connectionId: string) => {
    setSelectedTargets((prev) =>
      prev.includes(connectionId)
        ? prev.filter((id) => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  const placeholders = [
    { key: '{{video_title}}', description: 'Video title' },
    { key: '{{video_url}}', description: 'Video URL' },
    { key: '{{video_id}}', description: 'Video ID' },
  ];

  return (
    // <AuthGuard>
      <div className="flex h-screen bg-dark-950">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Automations</h1>
              <p className="text-dark-400">Configure your content distribution workflow</p>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-dark-800 rounded w-1/4 mb-4"></div>
                  <div className="h-10 bg-dark-800 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Trigger</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        WHEN a new video is posted to
                      </label>
                      <select
                        value={selectedYoutubeConnection}
                        onChange={(e) => setSelectedYoutubeConnection(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select YouTube channel</option>
                        {youtubeConnections.map((conn) => (
                          <option key={conn.$id} value={conn.$id}>
                            {conn.username || conn.channelId || 'YouTube Channel'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Action</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        ...THEN post this message
                      </label>
                      <textarea
                        value={messageTemplate}
                        onChange={(e) => setMessageTemplate(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                        placeholder="Enter your message template..."
                      />
                      <div className="mt-3">
                        <p className="text-xs text-dark-400 mb-2">Available placeholders:</p>
                        <div className="flex flex-wrap gap-2">
                          {placeholders.map((p) => (
                            <button
                              key={p.key}
                              onClick={() => setMessageTemplate((prev) => prev + ' ' + p.key)}
                              className="px-3 py-1 bg-dark-800 hover:bg-dark-700 text-primary-400 rounded-md text-xs font-mono transition-colors"
                            >
                              {p.key}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-3">
                        Destination platforms
                      </label>
                      <div className="space-y-2">
                        {targetConnections.map((conn) => (
                          <label
                            key={conn.$id}
                            className="flex items-center space-x-3 p-3 bg-dark-800 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTargets.includes(conn.$id)}
                              onChange={() => toggleTarget(conn.$id)}
                              className="w-4 h-4 text-primary-600 bg-dark-900 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
                            />
                            <span className="text-white capitalize">{conn.platform}</span>
                            <span className="text-dark-400 text-sm">
                              {conn.username || conn.channelId || 'Connected'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Activate Automation</h3>
                      <p className="text-sm text-dark-400">
                        Enable this automation to start distributing content
                      </p>
                    </div>
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        isActive ? 'bg-primary-600' : 'bg-dark-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveAutomation}
                  disabled={isSaving}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Automation'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    // </AuthGuard>
  );
}
