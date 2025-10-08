"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWhopAuth } from "@whop-apps/nextjs";

export function WhopAuthBoundary({ children }: PropsWithChildren) {
	const router = useRouter();
	const pathname = usePathname();
	const { user, isLoading, isEmbedded, error } = useWhopAuth();

	useEffect(() => {
		if (isLoading || user || isEmbedded) {
			return;
		}

		const returnTo = pathname ? encodeURIComponent(pathname) : null;
		const target = returnTo ? `/auth?returnTo=${returnTo}` : "/auth";
		router.replace(target);
	}, [isLoading, user, isEmbedded, router, pathname]);

	if (isLoading || (!user && isEmbedded)) {
		return (
			<div className="flex h-full flex-1 items-center justify-center bg-white">
				<div className="space-y-3 text-center">
					<div className="flex justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
					</div>
					<p className="text-sm font-medium text-gray-700">
						{isEmbedded ? "Waiting for Whop to confirm your session..." : "Redirecting to sign in..."}
					</p>
					{error ? <p className="text-xs text-red-500">{error.message}</p> : null}
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return <>{children}</>;
}
