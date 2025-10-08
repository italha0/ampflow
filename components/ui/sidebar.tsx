"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
	label: string;
	href: string;
	icon: React.ReactNode;
}

const navItems: NavItem[] = [
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
			</svg>
		),
	},
	{
		label: "Automations",
		href: "/dashboard/automations",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 2c-1.1 0-2 .9-2 2v2.08a7.002 7.002 0 0 0-3.91 11.9l-1.44 1.44A1 1 0 0 0 5.1 20.9l1.44-1.44A7.002 7.002 0 0 0 12 19.92V22a2 2 0 1 0 4 0v-2.08a7.002 7.002 0 0 0 3.91-11.9l1.44-1.44A1 1 0 1 0 20.9 5.1l-1.44 1.44A7.002 7.002 0 0 0 14 6.08V4a2 2 0 0 0-2-2zm0 6a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" fill="currentColor"/>
			</svg>
		),
	},
	{
		label: "Logs",
		href: "/dashboard/logs",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
			</svg>
		),
	},
	{
		label: "Settings",
		href: "/settings",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
			</svg>
		),
	},
];

export function Sidebar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(true);

	return (
		<>
			{/* Mobile Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed top-0 left-0 h-screen bg-white border-r border-gray-a5 shadow-lg z-50 transition-all duration-300",
					isOpen ? "w-64" : "w-20",
					"lg:translate-x-0",
					!isOpen && "lg:w-20"
				)}
			>
				{/* Logo/Brand */}
				<div className="flex items-center justify-between p-6 border-b border-gray-a5">
					{isOpen ? (
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold">
								A
							</div>
							<span className="text-lg font-bold bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] bg-clip-text text-transparent">
								AmpFlow
							</span>
						</div>
					) : (
						<div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold mx-auto">
							A
						</div>
					)}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="p-2 rounded-lg hover:bg-gray-a3 transition-colors lg:block hidden"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className={cn("transition-transform", !isOpen && "rotate-180")}
						>
							<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
						</svg>
					</button>
				</div>

				{/* Navigation */}
				<nav className="p-4">
					<ul className="space-y-2">
						{navItems.map((item) => {
							const isActive = pathname === item.href || pathname?.startsWith(item.href);
							return (
								<li key={item.href}>
									<Link
										href={item.href}
										className={cn(
											"flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
											isActive
												? "bg-gradient-to-r from-[#DD2F6E] to-[#bb1e57] text-white shadow-lg"
												: "text-gray-a10 hover:bg-gray-a3 hover:text-[#DD2F6E]",
											!isOpen && "justify-center"
										)}
									>
										{item.icon}
										{isOpen && <span className="font-medium">{item.label}</span>}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* User Profile Section */}
				{isOpen && (
					<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-a5">
						<div className="flex items-center gap-3 p-3 rounded-lg bg-gray-a2">
							<div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
								U
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-semibold text-gray-12 truncate">User</p>
								<p className="text-xs text-gray-a8 truncate">Plan: Premium</p>
							</div>
						</div>
					</div>
				)}
			</aside>

			{/* Toggle button for mobile */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-4 right-4 z-40 lg:hidden w-14 h-14 rounded-full gradient-primary text-white shadow-lg flex items-center justify-center"
			>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
				</svg>
			</button>
		</>
	);
}