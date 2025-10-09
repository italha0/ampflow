"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type WhopIframeView = "app" | "admin" | "analytics" | "preview";

type SessionPayload = {
  userId: string;
  sessionToken?: string;
  experienceId?: string;
  experienceRoute?: string;
  companyId?: string;
  companyRoute?: string;
  viewType?: WhopIframeView;
};

type UseWhopAuthState = {
  user: SessionPayload | null;
  isLoading: boolean;
  error: Error | null;
  isEmbedded: boolean;
  refresh: () => Promise<void>;
  signIn: (redirectOverride?: string) => void;
  signOut: () => void;
};

function detectEmbedding(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.self !== window.top;
  } catch {
    // Accessing window.top can throw cross-origin errors for embedded apps.
    return true;
  }
}

export function useWhopAuth(): UseWhopAuthState {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const mountedRef = useRef(true);
  const inflightRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      inflightRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    setIsEmbedded(detectEmbedding());
  }, []);

  const refresh = useCallback(async () => {
    inflightRef.current?.abort();
    const controller = new AbortController();
    inflightRef.current = controller;

    if (mountedRef.current) {
      setIsLoading(true);
    }

    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        signal: controller.signal,
        headers: {
          "cache-control": "no-store",
        },
      });

      if (!mountedRef.current || controller.signal.aborted) {
        return;
      }

      if (response.ok) {
        const data = (await response.json()) as SessionPayload;
        setUser(data);
        setError(null);
      } else {
        setUser(null);
        const info = await safeParseError(response);
        setError(info);
      }
    } catch (err) {
      if (!mountedRef.current || controller.signal.aborted) {
        return;
      }
      setUser(null);
      setError(err instanceof Error ? err : new Error("Failed to load Whop session"));
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const signIn = useCallback((redirectOverride?: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const params = searchParams ? new URLSearchParams(searchParams.toString()) : null;
    const returnToParam = params?.get("returnTo") ?? undefined;

    if (params) {
      params.delete("returnTo");
    }

    const remainingQuery = params && params.toString().length > 0 ? `?${params.toString()}` : "";
    const basePath = pathname ?? "/";
    const cleanedBase = basePath === "/auth" ? "/dashboard" : basePath;
    const derivedFallback = `${cleanedBase}${remainingQuery}` || "/dashboard";
    const redirectTarget = redirectOverride ?? returnToParam ?? derivedFallback;

    window.location.href = `/api/auth/whop?redirect=${encodeURIComponent(redirectTarget)}`;
  }, [pathname, searchParams]);

  const signOut = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const base = window.location.origin;
    window.location.href = `https://whop.com/logout?redirect=${encodeURIComponent(base)}`;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isEmbedded) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "object" || event.data === null) {
        return;
      }

      const originHost = getHostFromOrigin(event.origin);
      if (originHost && !originHost.endsWith("whop.com")) {
        return;
      }

      const type = (event.data as { type?: string; event?: string }).type ?? (event.data as { event?: string }).event;
      if (!type) {
        return;
      }

      const normalized = type.toLowerCase();
      if (normalized.includes("session")) {
        refresh();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isEmbedded, refresh]);

  return useMemo(
    () => ({
      user,
      isLoading,
      error,
      isEmbedded,
      refresh,
      signIn,
      signOut,
    }),
    [user, isLoading, error, isEmbedded, refresh, signIn, signOut],
  );
}

async function safeParseError(response: Response) {
  try {
    const payload = await response.json();
    const message = payload?.error ?? payload?.message ?? response.statusText;
    return new Error(message);
  } catch {
    return new Error(response.statusText || "Whop session not available");
  }
}

function getHostFromOrigin(origin: string | null | undefined) {
  if (!origin) {
    return null;
  }

  try {
    const { hostname } = new URL(origin);
    return hostname;
  } catch {
    return null;
  }
}
