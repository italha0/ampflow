import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExperiencePass {
	id: string;
	name: string;
	price?: number;
	currency?: string;
	billingInterval?: string;
	description?: string;
}

interface ExperienceDetails {
	id: string;
	name: string;
	tagline: string;
	description: string;
	coverImage: string | null;
	highlights: string[];
	passes: ExperiencePass[];
}

const DEFAULT_EXPERIENCE: ExperienceDetails = {
	id: "experience",
	name: "AmpFlow Experience",
	tagline: "Automated distribution for your Whop community",
	description:
		"AmpFlow keeps your members informed the moment you publish something new. Connect YouTube once and let us fan out announcements to Whop, Discord, and Telegram with smart templates and scheduling.",
	coverImage: "/logo.png",
	highlights: [
		"Real-time sync from YouTube uploads",
		"Whop-first announcements with beautiful cards",
		"Optional cross-posting to Discord and Telegram",
		"Message templates with personalization tokens",
	],
	passes: [
		{
			id: "pro",
			name: "Creator Pro",
			price: 49,
			currency: "USD",
			billingInterval: "month",
			description: "Best for solo creators automating 3+ channels.",
		},
		{
			id: "studio",
			name: "Studio",
			price: 129,
			currency: "USD",
			billingInterval: "month",
			description: "Teams that manage multiple communities and need advanced routing.",
		},
	],
};

const experienceCache = new Map<string, Promise<ExperienceDetails | null>>();

function pickString(source: Record<string, unknown>, keys: string[]): string | undefined {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === "string" && value.trim().length > 0) {
			return value.trim();
		}
	}
	return undefined;
}

function pickNumber(source: Record<string, unknown>, keys: string[]): number | undefined {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === "number" && Number.isFinite(value)) {
			return value;
		}
	}
	return undefined;
}

function pickArray(source: Record<string, unknown>, keys: string[]): unknown[] | undefined {
	for (const key of keys) {
		const value = source[key];
		if (Array.isArray(value)) {
			return value;
		}
	}
	return undefined;
}

function normalizePass(rawPass: unknown, index: number): ExperiencePass | null {
	if (typeof rawPass !== "object" || rawPass === null) {
		return null;
	}

	const record = rawPass as Record<string, unknown>;
	const cents = pickNumber(record, ["price_cents", "priceCents", "price_amount_cents"]);
	const whole = pickNumber(record, ["price", "price_amount", "amount"]);
	const price = typeof cents === "number" ? cents / 100 : whole;

	return {
		id: pickString(record, ["id", "pass_id", "slug"]) ?? `pass-${index}`,
		name: pickString(record, ["name", "display_name", "title"]) ?? "Access Pass",
		price: typeof price === "number" ? price : undefined,
		currency: pickString(record, ["currency", "price_currency"]) ?? "USD",
		billingInterval: pickString(record, ["billing_interval", "interval", "billingPeriod", "interval_unit"]),
		description: pickString(record, ["description", "summary", "tagline"]),
	};
}

async function fetchExperienceFromWhop(experienceId: string): Promise<ExperienceDetails | null> {
	const apiKey = process.env.WHOP_API_KEY;
	const apiBase = process.env.WHOP_API_BASE ?? "https://api.whop.com/api/v2";

	if (!apiKey) {
		return null;
	}

	try {
		const response = await fetch(`${apiBase}/experiences/${experienceId}`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});

		if (!response.ok) {
			if (response.status === 401 || response.status === 403) {
				console.warn(
					`Whop API returned ${response.status} for experience ${experienceId}. Serving default copy. ` +
					`Confirm your WHOP_API_KEY has experiences.read access or set WHOP_API_BASE for the dev proxy.`,
				);
				return null;
			}

			if (response.status === 404) {
				console.info(`Experience ${experienceId} was not found on Whop. Falling back to defaults.`);
				return null;
			}

			console.error(`Failed to load experience ${experienceId} from Whop: ${response.status}`);
			return null;
		}

		const payload = (await response.json()) as unknown;
		if (typeof payload !== "object" || payload === null) {
			return null;
		}

		const container = payload as Record<string, unknown>;
		const raw =
			typeof container.data === "object" && container.data !== null
				? (container.data as Record<string, unknown>)
				: container;

		const passesSource =
			pickArray(raw, ["passes", "access_passes", "accessPasses", "products"]) ??
			(typeof raw.products === "object" && raw.products !== null && Array.isArray((raw.products as Record<string, unknown>).data)
				? ((raw.products as Record<string, unknown>).data as unknown[])
				: undefined);

		const passes: ExperiencePass[] = Array.isArray(passesSource)
			? passesSource
				.map((item, index) => normalizePass(item, index))
				.filter((item): item is ExperiencePass => item !== null)
			: [];

		const highlightsSource = pickArray(raw, ["highlights", "features", "benefits", "bullets"]);
		const highlights = Array.isArray(highlightsSource)
			? highlightsSource.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
			: [];

		return {
			id: pickString(raw, ["id", "slug", "experience_id"]) ?? experienceId,
			name: pickString(raw, ["name", "title", "display_name"]) ?? DEFAULT_EXPERIENCE.name,
			tagline:
				pickString(raw, ["tagline", "subtitle", "headline", "short_description"])
				?? DEFAULT_EXPERIENCE.tagline,
			description:
				pickString(raw, ["description", "long_description", "body", "about"])
				?? DEFAULT_EXPERIENCE.description,
			coverImage:
				pickString(raw, [
					"cover_image", "cover_image_url", "hero_image", "hero_image_url", "banner_image", "banner"],
				) ?? DEFAULT_EXPERIENCE.coverImage,
			highlights: highlights.length > 0 ? highlights : DEFAULT_EXPERIENCE.highlights,
			passes: passes.length > 0 ? passes : DEFAULT_EXPERIENCE.passes,
		};
	} catch (error) {
		console.warn(`Unexpected error while loading experience ${experienceId}. Falling back to defaults.`, error);
		return null;
	}
}

async function getExperienceDetails(experienceId: string): Promise<ExperienceDetails | null> {
	if (!experienceCache.has(experienceId)) {
		experienceCache.set(experienceId, fetchExperienceFromWhop(experienceId));
	}

	return experienceCache.get(experienceId)!;
}

function formatPrice(pass: ExperiencePass): string {
	if (typeof pass.price !== "number") {
		return "Custom pricing";
	}

	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: pass.currency ?? "USD",
		})
			.format(pass.price)
			.concat(pass.billingInterval ? ` / ${pass.billingInterval}` : "");
	} catch {
		return `$${pass.price.toFixed(2)}`.concat(pass.billingInterval ? ` / ${pass.billingInterval}` : "");
	}
}

export async function generateMetadata({
	params,
}: {
	params: { experienceId: string };
}): Promise<Metadata> {
	const experience = await getExperienceDetails(params.experienceId);
	return {
		title: experience?.name ?? DEFAULT_EXPERIENCE.name,
		description: experience?.tagline ?? DEFAULT_EXPERIENCE.tagline,
	};
}

export default async function ExperiencePage({
	params,
}: {
	params: { experienceId: string };
}) {
	const experience = (await getExperienceDetails(params.experienceId)) ?? DEFAULT_EXPERIENCE;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/80 to-gray-950 text-white">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(221,47,110,0.2),_transparent_60%)]" aria-hidden />
			<div className="relative z-10">
				<header className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
					<div className="flex items-center justify-center gap-3 mb-6">
						<Image src="/logo.png" alt="AmpFlow logo" width={56} height={56} className="rounded-xl shadow-lg" priority />
						<div className="text-left">
							<p className="text-sm uppercase tracking-wide text-white/60">Experience</p>
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight">{experience.name}</h1>
						</div>
					</div>
					<p className="max-w-3xl mx-auto text-lg text-white/70">{experience.tagline}</p>
				</header>

				<main className="max-w-5xl mx-auto px-4 pb-24 space-y-12">
					<Card className="bg-white/5 border-white/10 backdrop-blur-md">
						<div className="grid gap-8 md:grid-cols-[2fr,1fr] p-8">
							<div>
								<h2 className="text-2xl font-semibold mb-4">What you get</h2>
								<p className="text-white/70 leading-relaxed mb-6">{experience.description}</p>
								<ul className="space-y-3">
									{experience.highlights.map((highlight) => (
										<li key={highlight} className="flex items-start gap-3 text-white/80">
											<span className="mt-1 text-lg">⚡</span>
											<span>{highlight}</span>
										</li>
									))}
								</ul>
							</div>
							<div className="space-y-6">
								<h3 className="text-xl font-semibold">Plans</h3>
								<div className="space-y-4">
									{experience.passes.map((pass) => (
										<Card key={pass.id} className="bg-white/5 border-white/10">
											<div className="p-5 space-y-3">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-lg font-semibold">{pass.name}</p>
														<p className="text-sm text-white/60">{pass.description ?? "Includes full automation suite"}</p>
													</div>
													<Badge className="bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] text-white border-none">
														{formatPrice(pass)}
													</Badge>
												</div>
												<Link href="/auth" className="block">
													<Button className="w-full bg-white text-gray-900 hover:bg-white/90">
														Start with this plan
													</Button>
												</Link>
											</div>
										</Card>
									))}
								</div>
							</div>
						</div>
					</Card>

					<Card className="bg-white/5 border-white/10 backdrop-blur-md p-8">
						<div className="grid gap-8 md:grid-cols-2">
							<div className="space-y-4">
								<h3 className="text-xl font-semibold">Why creators choose AmpFlow</h3>
								<p className="text-white/70">
									Built on Whop, AmpFlow allows you to connect multiple distribution channels, manage automations, and keep
									your community engaged without manual posting.
								</p>
								<div className="space-y-3 text-white/80">
									<p>• Unified dashboard for connections and automations</p>
									<p>• Secure OAuth flows and Appwrite-backed storage</p>
									<p>• Detailed delivery logs so you always know what shipped</p>
								</div>
							</div>
							<div className="bg-white/10 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
								<h4 className="text-lg font-semibold">Ready to dive deeper?</h4>
								<p className="text-white/70 text-sm">
									Launch the full AmpFlow dashboard to connect your channels, create automations, and start posting to your
									Whop experience in minutes.
								</p>
								<div className="flex flex-col sm:flex-row gap-3">
									<Link href="/auth" className="flex-1">
										<Button className="w-full bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] hover:from-[#DD2F6E]/90 hover:to-[#f53c79]/90">
											Open AmpFlow
										</Button>
									</Link>
									<Link href="/" className="flex-1">
										<Button variant="outline" className="w-full border-white/40 text-white hover:bg-white/10">
											Learn more
										</Button>
									</Link>
								</div>
							</div>
						</div>
					</Card>
				</main>
			</div>
		</div>
	);
}
