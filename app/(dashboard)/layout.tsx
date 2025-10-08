import type { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { WhopAuthBoundary } from "@/components/auth/whop-auth-boundary";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<WhopAuthBoundary>
					{children}
				</WhopAuthBoundary>
			</main>
		</div>
	);
}