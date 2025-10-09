import type { init as sentryInit } from "@sentry/nextjs";

export type NextJsSentryOptions = Parameters<typeof sentryInit>[0];

function parseRate(value: string | undefined, fallback: number) {
	const rate = Number.parseFloat(value ?? "");
	return Number.isNaN(rate) ? fallback : rate;
}

const tracesSampleRate = parseRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 1);
const sentryDebug = (process.env.SENTRY_DEBUG ?? "").toLowerCase() === "true";

export const sentryOptions: NextJsSentryOptions = {
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? "development",
	enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
	tracesSampleRate,
	debug: sentryDebug,
};

export function resolveIntegrations(defaultIntegrations: NextJsSentryOptions["integrations"]): NextJsSentryOptions["integrations"] {
	const incomingIntegrations = sentryOptions.integrations;
	if (typeof incomingIntegrations === "function") {
		return incomingIntegrations(defaultIntegrations);
	}
	return [...(defaultIntegrations ?? []), ...(incomingIntegrations ?? [])];
}
