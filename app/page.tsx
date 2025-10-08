import { Suspense } from "react";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function Page() {
	return (
		<div className="min-h-screen bg-gray-1">
			<Suspense fallback={<div className="p-6 text-3 text-gray-a8">Loading dashboard…</div>}>
				<DashboardClient />
			</Suspense>
		</div>
	);
}
