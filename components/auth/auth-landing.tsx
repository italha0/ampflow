'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const benefits = [
	{
		title: "Single Whop sign-on",
		description:
			"Authenticate with the same Whop identity your community already trusts. No extra passwords to manage.",
	},
	{
		title: "Creator-first security",
		description:
			"Appwrite stores tokens securely while Whop keeps entitlements scoped to your memberships.",
	},
	{
		title: "Faster onboarding",
		description:
			"Launch into AmpFlow in seconds and connect YouTube plus Discord, Telegram, and Whop destinations.",
	},
	{
		title: "Automation ready",
		description:
			"Your next video trigger is ready as soon as you finish the Whop SSO handshake.",
	},
];

const highlights = [
	"Whop entitlement checks on every request",
	"Appwrite sessions & secrets managed server-side",
	"SOC 2 compliant infrastructure",
];

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			className={cn("h-4 w-4 text-[#6de7ff]", className)}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M20.285 5.70998L9.00002 17L3.71484 11.715"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function AuthLanding() {
	const baseLoginUrl = useMemo(() => process.env.NEXT_PUBLIC_WHOP_LOGIN_URL ?? "https://whop.com/login", []);
	const appId = useMemo(() => process.env.NEXT_PUBLIC_WHOP_APP_ID ?? "", []);
	const defaultRedirect = useMemo(() => process.env.NEXT_PUBLIC_APP_URL ?? "", []);

	const initialLoginUrl = useMemo(() => {
		try {
			const url = new URL(baseLoginUrl);
			if (appId) {
				url.searchParams.set("app", appId);
			}
			if (defaultRedirect) {
				url.searchParams.set("redirectUrl", defaultRedirect);
			}
			return url.toString();
		} catch (error) {
			console.warn("Invalid NEXT_PUBLIC_WHOP_LOGIN_URL", error);
			return "https://whop.com/login";
		}
	}, [appId, baseLoginUrl, defaultRedirect]);

	const [loginUrl, setLoginUrl] = useState(initialLoginUrl);

	useEffect(() => {
		try {
			const url = new URL(baseLoginUrl);
			if (appId) {
				url.searchParams.set("app", appId);
			}
			url.searchParams.set("redirectUrl", `${window.location.origin}`);
			setLoginUrl(url.toString());
		} catch (error) {
			console.warn("Failed to resolve Whop login URL", error);
		}
	}, [appId, baseLoginUrl]);

	const handleContinue = useCallback(() => {
		window.location.href = loginUrl;
	}, [loginUrl]);

	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-[#060510] text-gray-200">
			<div className="pointer-events-none absolute -left-1/4 top-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(103,77,255,0.38)_0%,_rgba(6,5,16,0)_70%)] blur-3xl" />
			<div className="pointer-events-none absolute -right-1/3 bottom-[-20%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(221,47,110,0.35)_0%,_rgba(6,5,16,0)_70%)] blur-3xl" />

			<div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
				<section className="flex w-full flex-col justify-between gap-16 px-8 py-10 sm:px-12 lg:w-1/2 lg:px-16 lg:py-16">
					<header className="flex items-center gap-3">
						<div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 backdrop-blur">
							<Image src="/logo.png" alt="AmpFlow logo" width={32} height={32} className="h-8 w-8" priority />
						</div>
						<div>
							<p className="text-sm uppercase tracking-[0.3em] text-[#6de7ff]">AmpFlow</p>
							<h1 className="text-3xl font-semibold text-white sm:text-4xl">Automate your launch day hype</h1>
						</div>
					</header>

					<div className="space-y-6">
						<p className="max-w-xl text-lg text-gray-300">
							Sign in with Whop to unlock AmpFlow. We verify your memberships instantly, then AmpFlow keeps your Appwrite session warm so automations fire the moment your next video drops.
						</p>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button
								variant="gradient"
								size="lg"
								className="w-full sm:w-auto"
								onClick={handleContinue}
							>
								Continue with Whop
							</Button>
							<Button
								variant="secondary"
								size="lg"
								className="w-full sm:w-auto"
								asChild
							>
								<Link href="https://dev.whop.com/introduction" target="_blank" rel="noreferrer">
									View developer docs
								</Link>
							</Button>
						</div>

						<p className="text-sm text-gray-500">
							Your account lives on Whop. AmpFlow never sees your password, and membership access controls every automation.
						</p>
					</div>

					<div className="grid gap-5 sm:grid-cols-2">
						{benefits.map((benefit) => (
							<div key={benefit.title} className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur transition hover:border-[#6de7ff]/40 hover:bg-white/10">
								<h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-gray-300">{benefit.description}</p>
							</div>
						))}
					</div>
				</section>

				<section className="flex w-full items-center justify-center px-8 pb-16 lg:w-1/2 lg:px-16 lg:pb-16">
					<div className="relative w-full max-w-xl">
						<div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[#2b1d63]/60 via-[#120f2a]/70 to-[#05040c]/80 blur-2xl" />
						<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
							<div className="border-b border-white/10 bg-white/5 px-6 py-4">
								<p className="text-sm font-medium text-[#6de7ff]">Realtime automation preview</p>
								<h2 className="text-2xl font-semibold text-white">New YouTube upload detected</h2>
							</div>
							<div className="grid gap-4 px-6 pb-8 pt-6">
								<div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-gray-200">
									<p className="text-xs uppercase tracking-[0.2em] text-gray-500">Trigger</p>
									<div className="mt-2 flex items-center justify-between">
										<span className="font-medium text-white">Upload posted to AstroBuilds</span>
										<span className="rounded-full bg-[#6de7ff]/10 px-3 py-1 text-xs text-[#6de7ff]">Ready</span>
									</div>
									<p className="mt-3 line-clamp-2 text-gray-400">&ldquo;Launching a 3D-printed satellite in under 48 hours&rdquo;</p>
								</div>

								<div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-gray-200">
									<p className="text-xs uppercase tracking-[0.2em] text-gray-500">Destinations</p>
									<ul className="space-y-2">
										<li className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
											<span className="flex items-center gap-2">
												<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF0000]">YT</span>
												<span>YouTube</span>
											</span>
											<span className="text-xs text-[#6de7ff]">Subscribed</span>
										</li>
										<li className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
											<span className="flex items-center gap-2">
												<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5865F2]/10 text-[#5865F2]">DC</span>
												<span>Discord #launch-updates</span>
											</span>
											<span className="text-xs text-[#6de7ff]">Scheduled</span>
										</li>
										<li className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
											<span className="flex items-center gap-2">
												<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#30A8D5]/10 text-[#30A8D5]">TG</span>
												<span>Telegram broadcast</span>
											</span>
											<span className="text-xs text-[#6de7ff]">Queued</span>
										</li>
									</ul>
								</div>

								<div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-200">
									<p className="text-xs uppercase tracking-[0.2em] text-gray-500">Why creators love this</p>
									{highlights.map((highlight) => (
										<p key={highlight} className="flex items-start gap-2 text-gray-300">
											<CheckIcon className="mt-[2px]" />
											<span>{highlight}</span>
										</p>
									))}
								</div>
							</div>
						</div>

						<div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 text-sm text-gray-200">
							<p className="text-sm text-white">
								“Whop SSO plus AmpFlow automations means we drop a new hardware video and our community gets the update everywhere in seconds.”
							</p>
							<p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">Nova Singh, Founder @ AstroBuilds</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
