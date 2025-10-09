"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Connection {
  id: string;
  platform: "youtube" | "discord" | "telegram" | "whop";
  username: string;
  channelId: string;
  isConnected: boolean;
}

interface PlatformCard {
  key: Connection["platform"];
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  background: string;
  icon: JSX.Element;
}

export default function DashboardPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const platformCards: PlatformCard[] = useMemo(
    () => [
      {
        key: "youtube",
        title: "Connect YouTube",
        subtitle: "Channel",
        description: "Keep your channel synced and deliver every upload to your members instantly.",
        accent: "from-[#ff5757] to-[#ff3434]",
        background: "from-white via-white to-[#fff5f5]",
        icon: (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff0000]/10 text-3xl">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12c0 1.8.2 3.6.5 5.3a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.3-1.7.5-3.5.5-5.3 0-1.8-.2-3.6-.5-5.3ZM9.6 15.5V8.5l6.2 3.5-6.2 3.5Z" fill="#FF0000" />
            </svg>
          </span>
        ),
      },
      {
        key: "discord",
        title: "Connect Discord",
        subtitle: "Server",
        description: "Drop announcements, automate roles, and welcome members without lifting a finger.",
        accent: "from-[#4f46e5] to-[#4338ca]",
        background: "from-white via-white to-[#eef2ff]",
        icon: (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5865F2]/10 text-3xl">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.37a16.6 16.6 0 0 0-4.085-1.27.06.06 0 0 0-.063.03c-.18.33-.38.76-.52 1.1-1.52-.23-3.04-.23-4.53 0-.14-.35-.34-.77-.53-1.1a.06.06 0 0 0-.063-.03c-1.4.26-2.77.69-4.08 1.27a.06.06 0 0 0-.028.024C1.78 9.044.9 13.58 1.23 18.06a.07.07 0 0 0 .027.05c1.718 1.26 3.39 2.02 5.02 2.53a.06.06 0 0 0 .067-.022c.39-.53.74-1.09 1.05-1.67a.06.06 0 0 0-.033-.084 10.7 10.7 0 0 1-1.54-.73.06.06 0 0 1-.006-.098c.103-.077.206-.156.305-.236a.06.06 0 0 1 .062-.007c3.23 1.48 6.72 1.48 9.9 0a.06.06 0 0 1 .063.007c.099.08.202.159.305.236a.06.06 0 0 1-.006.098c-.5.29-1.02.53-1.55.73a.06.06 0 0 0-.033.084c.33.58.68 1.14 1.05 1.67a.06.06 0 0 0 .067.022c1.65-.51 3.32-1.27 5.02-2.53a.06.06 0 0 0 .027-.05c.42-5.2-.7-9.71-3.26-13.67a.05.05 0 0 0-.028-.023ZM8.02 15.33c-.97 0-1.77-.9-1.77-2.01 0-1.12.77-2.02 1.77-2.02 1 0 1.8.9 1.78 2.02 0 1.11-.78 2.01-1.78 2.01Zm7.96 0c-.97 0-1.77-.9-1.77-2.01 0-1.12.77-2.02 1.77-2.02 1 0 1.8.9 1.78 2.02 0 1.11-.78 2.01-1.78 2.01Z" fill="#5865F2" />
          </svg>
          </span>
        ),
      },
      {
        key: "telegram",
        title: "Telegram",
        subtitle: "Channel",
        description: "Broadcast updates, drop content, and keep subscribers engaged in real-time.",
        accent: "from-[#38bdf8] to-[#0ea5e9]",
        background: "from-white via-white to-[#e0f2fe]",
        icon: (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0ea5e9]/10 text-3xl">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.94 2.19c-.33-.28-.79-.34-1.18-.16L2.24 10.34a.9.9 0 0 0-.54.84c.03.35.27.65.6.77l4.65 1.6 1.74 5.5c.12.37.44.64.83.69h.1c.36 0 .69-.18.87-.47l2.64-4.1 4.5 3.55c.17.14.39.21.61.21.12 0 .25-.02.37-.07.32-.12.56-.39.64-.72l3.34-14.2a.9.9 0 0 0-.3-.95ZM7.8 12.41 4.3 11.2l13.14-5.8-7.33 7A.9.9 0 0 0 9.9 13l.37 4.16-2.47-4.75Zm9.05 3.74-3.74-2.95 5.4-7.87-1.66 10.82Z" fill="#0EA5E9" />
          </svg>
          </span>
        ),
      },
    ],
    []
  );

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

  const connectedCount = connections.filter((c) => (c.isConnected ?? true)).length;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-5xl rounded-[32px] border border-white/60 bg-white/80 p-10 shadow-[0_32px_80px_rgba(15,23,42,0.15)] backdrop-blur">
          <div className="flex animate-pulse flex-col gap-8">
            <div className="h-8 w-2/3 rounded-full bg-slate-200" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-52 rounded-3xl bg-slate-200" />
              ))}
            </div>
            <div className="mx-auto h-12 w-60 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-10">
        <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-[#6366f1]/20 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-44 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_60%)]" />
        <div className="relative flex flex-col gap-10">
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-200 bg-white/70 text-slate-500"
            >
              {connectedCount > 0 ? `${connectedCount} platform${connectedCount > 1 ? "s" : ""} connected` : "No platforms connected yet"}
            </Button>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Welcome, Creator! Lets automate your content flow.
            </h1>
            <p className="max-w-2xl text-base text-slate-500 sm:text-lg">
              Connect your channels once and let AmpFlow distribute every update the moment it drops.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platformCards.map((platform) => {
              const connection = connections.find((c) => c.platform === platform.key);
              const isConnected = Boolean(connection ? (connection.isConnected ?? true) : false);

              return (
                <div
                  key={platform.key}
                  className={cn(
                    "group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-slate-100 p-6 transition-all duration-300",
                    "bg-gradient-to-br",
                    platform.background,
                    isConnected
                      ? "shadow-[0_20px_45px_rgba(99,102,241,0.18)]"
                      : "shadow-[0_10px_35px_rgba(15,23,42,0.05)] hover:shadow-[0_20px_45px_rgba(148,163,184,0.18)]"
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute right-0 top-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full opacity-30 transition-opacity duration-300 group-hover:opacity-60",
                      "bg-gradient-to-br",
                      platform.accent
                    )}
                  />
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      {platform.icon}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{platform.subtitle}</p>
                        <h3 className="text-xl font-semibold text-slate-900">{platform.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500">{platform.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                        isConnected ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-white text-slate-500"
                      )}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.00009 16.2L4.80009 12L3.40009 13.4L9.00009 19L21.0001 7.00002L19.6001 5.60002L9.00009 16.2Z"
                            fill={isConnected ? "#10B981" : "#cbd5f5"}
                          />
                        </svg>
                        {isConnected ? "Connected" : "Not connected"}
                      </span>
                      {isConnected && connection ? (
                        <div className="flex max-w-[8rem] flex-col items-end text-right text-xs text-slate-400">
                          <span className="truncate font-medium text-slate-600">{connection.username}</span>
                          <span className="truncate">{connection.channelId}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-start">
                    <Button
                      onClick={() =>
                        isConnected && connection
                          ? handleDisconnect(connection.id)
                          : handleConnect(platform.key)
                      }
                      variant="outline"
                      size="sm"
                      className={cn(
                        "rounded-full border-0 px-6",
                        isConnected
                          ? "bg-white/85 text-slate-600 shadow-inner hover:bg-white"
                          : "bg-gradient-to-r text-white shadow-[0_12px_30px_rgba(148,163,184,0.35)]",
                        isConnected ? undefined : platform.accent
                      )}
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => router.push("/dashboard/automations")}
              className="h-14 rounded-full bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#db2777] px-10 text-base font-semibold text-white shadow-[0_16px_40px_rgba(99,102,241,0.35)] transition-transform hover:scale-[1.02]"
            >
              Setup Your First Automation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}