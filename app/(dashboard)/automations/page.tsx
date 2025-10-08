import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AutomationsClient } from "@/components/dashboard/automations-client";
import { whopSdk } from "@/lib/whop-sdk";

export default async function AutomationsPage() {
	try {
		const headersList = await headers();
		await whopSdk.verifyUserToken(headersList);
	} catch (error) {
		console.error("Missing or invalid Whop session", error);
		redirect("/auth");
	}

	return (
		<Suspense fallback={<div className="p-8 text-3 text-gray-a8">Loading automation builder…</div>}>
			<AutomationsClient />
		</Suspense>
	);
}
