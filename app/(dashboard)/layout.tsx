import type { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen bg-[#e9edf7]">
			<Sidebar />
			<main className="ml-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_#f6faff,_transparent_55%)] p-6 sm:p-10 lg:ml-64">
				{children}
			</main>
		</div>
	);
}