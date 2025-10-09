import type { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}