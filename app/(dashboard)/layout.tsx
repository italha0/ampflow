import type { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";

export default function DashboardShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen bg-gray-1 text-gray-12">
			<Sidebar />
			<div className="flex flex-1 flex-col lg:ml-64">
				<Header />
				<main className="flex-1 lg:pl-4 xl:pl-8 pt-6 pb-16 lg:pr-10" style={{ marginLeft: "5rem" }}>
					{children}
				</main>
			</div>
		</div>
	);
}
