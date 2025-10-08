"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

interface Connection {
  id: string;
  platform: "youtube" | "discord" | "telegram" | "whop";
  username: string;
  channelId: string;
  isConnected: boolean;
}

export default function DashboardPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections");
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (platform: string) => {
    window.location.href = `/api/auth/connect/${platform}`;
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      });
      fetchConnections();
    } catch (error) {
      console.error("Failed to disconnect:", error);
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

  const getPlatformColor = (platform: string) => {
    const colors = {
      youtube: "bg-red-500",
      discord: "bg-indigo-500",
      telegram: "bg-blue-500",
      whop: "bg-purple-500",
    };
    return colors[platform as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Connections</h1>
        <p className="text-gray-600 mb-4">Connect your platforms to start automating content distribution</p>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <div>
              <h3 className="font-semibold text-purple-900">Whop Primary Platform</h3>
              <p className="text-sm text-purple-700">Connect your Whop account first to distribute content to your community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {["whop", "youtube", "discord", "telegram"].map((platform) => {
          const connection = connections.find((c) => c.platform === platform);
          const isConnected = !!connection;
          const isPrimary = platform === "whop";

          return (
            <Card key={platform} className={`p-6 ${isPrimary ? 'ring-2 ring-purple-500 ring-offset-2 shadow-lg' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${isPrimary ? 'bg-gradient-to-r from-[#DD2F6E] to-[#f53c79]' : getPlatformColor(platform)} flex items-center justify-center text-white text-lg`}>
                    {getPlatformIcon(platform)}
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">
                      {platform}
                      {isPrimary && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Primary</span>}
                    </h3>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={isConnected}
                  onCheckedChange={() => 
                    isConnected 
                      ? handleDisconnect(connection.id)
                      : handleConnect(platform)
                  }
                />
              </div>
              
              {isConnected && (
                <div className="text-sm text-gray-600 mb-4">
                  <p className="truncate">{connection.username}</p>
                  <p className="text-xs text-gray-500">{connection.channelId}</p>
                </div>
              )}

              <Button
                onClick={() => isConnected ? handleDisconnect(connection.id) : handleConnect(platform)}
                variant={isConnected ? "outline" : isPrimary ? "default" : "default"}
                className={`w-full ${isPrimary && !isConnected ? 'bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] text-white hover:from-[#DD2F6E]/90 hover:to-[#f53c79]/90' : ''}`}
                size="sm"
              >
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => router.push("/automation")}
          disabled={connections.filter(c => c.platform !== "youtube").length === 0}
          className="px-8"
        >
          Continue to Automation Setup
        </Button>
      </div>
    </div>
  );
}