"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Connection {
  id: string;
  platform: "youtube" | "discord" | "telegram" | "whop";
  username: string;
  channelId: string;
  isConnected: boolean;
}

interface Automation {
  id?: string;
  userId: string;
  youtubeConnectionId: string;
  targetConnectionIds: string[];
  messageTemplate: string;
  isActive: boolean;
}

export default function AutomationPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [youtubeConnection, setYoutubeConnection] = useState<Connection | null>(null);
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [messageTemplate, setMessageTemplate] = useState("🚀 New Video! {{video_title}} {{video_url}}");
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [connectionsRes, automationRes] = await Promise.all([
        fetch("/api/connections"),
        fetch("/api/automations")
      ]);

      const connectionsData = await connectionsRes.json();
      const automationData = await automationRes.json();

      setConnections(connectionsData.connections || []);
      
      const youtube = connectionsData.connections?.find((c: Connection) => c.platform === "youtube");
      setYoutubeConnection(youtube || null);

      if (automationData.automation) {
        setAutomation(automationData.automation);
        setMessageTemplate(automationData.automation.messageTemplate);
        setSelectedTargets(automationData.automation.targetConnectionIds);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTargetToggle = (connectionId: string) => {
    setSelectedTargets(prev => 
      prev.includes(connectionId) 
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  const handleSave = async () => {
    if (!youtubeConnection || selectedTargets.length === 0) {
      alert("Please select at least one target platform");
      return;
    }

    setIsSaving(true);
    try {
      const method = automation ? "PUT" : "POST";
      const url = automation ? `/api/automations/${automation.id}` : "/api/automations";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeConnectionId: youtubeConnection.id,
          targetConnectionIds: selectedTargets,
          messageTemplate,
          isActive: automation?.isActive ?? true
        })
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to save automation");
      }
    } catch (error) {
      console.error("Failed to save automation:", error);
      alert("Failed to save automation");
    } finally {
      setIsSaving(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      youtube: "🔴",
      discord: "💬",
      telegram: "✈️",
      whop: "🎯",
    };
    return icons[platform as keyof typeof icons] || "🔗";
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!youtubeConnection) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">YouTube Connection Required</h1>
          <p className="text-gray-600 mb-6">Please connect your YouTube channel first to set up automation.</p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Connections
          </Button>
        </div>
      </div>
    );
  }

  const targetConnections = connections.filter(c => c.platform !== "youtube" && c.isConnected);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation Setup</h1>
        <p className="text-gray-600">Configure how your YouTube videos are distributed</p>
      </div>

      {/* Trigger Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Trigger</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900">
            <span className="font-semibold">WHEN</span> a new video is posted to 
            <span className="font-semibold"> {youtubeConnection.username}</span>...
          </p>
        </div>
      </Card>

      {/* Message Template Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Message Template</h2>
        <div className="space-y-4">
          <Textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            placeholder="Enter your message template..."
            className="min-h-[120px]"
          />
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-2">Available placeholders:</p>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="secondary">{{video_title}}</Badge>
              <Badge variant="secondary">{{video_url}}</Badge>
              <Badge variant="secondary">{{video_description}}</Badge>
              <Badge variant="secondary">{{channel_name}}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Target Platforms Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Distribution Targets</h2>
        <p className="text-gray-600 mb-4">Select where to automatically share your new videos</p>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] rounded flex items-center justify-center text-white text-sm font-bold">W</div>
            <div>
              <h4 className="font-semibold text-purple-900">Whop Communities</h4>
              <p className="text-sm text-purple-700">Your primary distribution platform - connect Whop first for best results</p>
            </div>
          </div>
        </div>
        
        {targetConnections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No connected platforms available</p>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Connect Platforms
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {targetConnections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getPlatformIcon(connection.platform)}</div>
                  <div>
                    <p className="font-semibold capitalize">{connection.platform}</p>
                    <p className="text-sm text-gray-600">{connection.username}</p>
                  </div>
                </div>
                <Switch
                  checked={selectedTargets.includes(connection.id)}
                  onCheckedChange={() => handleTargetToggle(connection.id)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
        >
          Back to Connections
        </Button>
        <Button
          onClick={handleSave}
          disabled={selectedTargets.length === 0 || isSaving}
          className="px-8"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Automation"
          )}
        </Button>
      </div>
    </div>
  );
}