import * as Sentry from "@sentry/nextjs";
import { resolveIntegrations, sentryOptions, type NextJsSentryOptions } from "./sentry.config";

const parseRate = (value: string | undefined, fallback: number) => {
	const rate = Number.parseFloat(value ?? "");
	return Number.isNaN(rate) ? fallback : rate;
};

const enableReplay = (process.env.NEXT_PUBLIC_SENTRY_ENABLE_REPLAY ?? "").toLowerCase() === "true";
const replaysSessionSampleRate = parseRate(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE, enableReplay ? 0.1 : 0);
const replaysOnErrorSampleRate = parseRate(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE, enableReplay ? 1 : 0);

const replayIntegration = enableReplay ? Sentry.replayIntegration() : undefined;

Sentry.init({
	...sentryOptions,
	integrations: (existing) => {
		const merged = resolveIntegrations(existing);
		const baseArray = typeof merged === "function" ? merged(existing ?? []) : merged ?? [];
		return replayIntegration ? [...baseArray, replayIntegration] : baseArray;
	},
	replaysSessionSampleRate,
	replaysOnErrorSampleRate,
});

if (!sentryOptions?.dsn) {
	// eslint-disable-next-line no-console
	console.warn("[sentry] NEXT_PUBLIC_SENTRY_DSN is not set. Client-side error reporting is disabled.");
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;