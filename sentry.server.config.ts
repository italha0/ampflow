// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./sentry.config";

Sentry.init(sentryOptions);

if (!sentryOptions?.dsn) {
	// eslint-disable-next-line no-console
	console.warn("[sentry] NEXT_PUBLIC_SENTRY_DSN is not set. Sentry server instrumentation is disabled.");
}
