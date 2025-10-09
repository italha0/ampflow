"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

interface Job {
  $id: string;
  title: string;
  videoId: string;
  status: "pending" | "processing" | "completed" | "partial" | "failed";
  targetPlatforms: string[];
  results: any[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export default function LogsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "partial": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "processing": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "discord": return "💬";
      case "telegram": return "📱";
      case "whop": return "🌐";
      default: return "📍";
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Distribution Logs</h1>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-800 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-800 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Distribution Logs</h1>
        <button
          onClick={fetchJobs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No distribution logs yet</div>
          <div className="text-gray-500">When you upload YouTube videos, they'll appear here</div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.$id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                  <p className="text-gray-400 text-sm">Video ID: {job.videoId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span>Created: {format(new Date(job.createdAt), "MMM d, yyyy HH:mm")}</span>
                {job.completedAt && (
                  <span>Completed: {format(new Date(job.completedAt), "MMM d, yyyy HH:mm")}</span>
                )}
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Target Platforms:</div>
                <div className="flex gap-2">
                  {job.targetPlatforms.map((platform) => (
                    <span key={platform} className="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm">
                      <span>{getPlatformIcon(platform)}</span>
                      <span className="capitalize">{platform}</span>
                    </span>
                  ))}
                </div>
              </div>

              {job.results && job.results.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Distribution Results:</div>
                  <div className="space-y-2">
                    {job.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{getPlatformIcon(result.platform)}</span>
                          <span className="capitalize text-white">{result.platform}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <span className="text-green-400">✓ Success</span>
                          ) : (
                            <span className="text-red-400">✗ Failed</span>
                          )}
                          {result.error && (
                            <span className="text-red-400 text-sm">({result.error})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {job.error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <div className="text-red-400 text-sm">Error: {job.error}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}