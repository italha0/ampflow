// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./sentry.config";

Sentry.init({
	...sentryOptions,
	// Client bundles should never log debug output in production.
	debug: process.env.NODE_ENV === "development" ? sentryOptions?.debug ?? true : false,
});

if (!sentryOptions?.dsn) {
	// eslint-disable-next-line no-console
	console.warn("[sentry] NEXT_PUBLIC_SENTRY_DSN is not set. Client-side error reporting is disabled.");
}
