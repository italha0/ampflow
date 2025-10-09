"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface HeaderProps {
	userName?: string;
	userPlan?: string;
	className?: string;
}

export function Header({ userName = "User", userPlan = "Free", className }: HeaderProps) {
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);

	return (
		<header className={cn("bg-white border-b border-gray-a5 shadow-sm sticky top-0 z-30", className)}>
			<div className="flex items-center justify-between px-6 py-4">
				{/* Search Bar */}
				<div className="flex-1 max-w-2xl">
					<div className="relative">
						<input
							type="text"
							placeholder="Search posts, analytics..."
							className="w-full pl-10 pr-4 py-2 border border-gray-a5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD2F6E] focus:border-transparent transition-all"
						/>
						<svg
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-a8"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M21 21L16.65 16.65"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</div>

				{/* Right Side Icons */}
				<div className="flex items-center gap-4 ml-6">
					{/* Notifications */}
					<div className="relative">
						<button
							onClick={() => setShowNotifications(!showNotifications)}
							className="relative p-2 rounded-lg hover:bg-gray-a3 transition-colors"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="text-gray-a10"
							>
								<path
									d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
						</button>

						{showNotifications && (
							<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-a5 py-2 animate-fade-in">
								<div className="px-4 py-2 border-b border-gray-a5">
									<h3 className="font-semibold text-gray-12">Notifications</h3>
								</div>
								<div className="max-h-96 overflow-y-auto">
									<div className="px-4 py-3 hover:bg-gray-a2 cursor-pointer transition-colors">
										<p className="text-sm text-gray-12 font-medium">Post published successfully</p>
										<p className="text-xs text-gray-a8 mt-1">Your post &quot;Summer vibes&quot; is now live</p>
										<span className="text-xs text-gray-a7">2 hours ago</span>
									</div>
									<div className="px-4 py-3 hover:bg-gray-a2 cursor-pointer transition-colors">
										<p className="text-sm text-gray-12 font-medium">Scheduled post ready</p>
										<p className="text-xs text-gray-a8 mt-1">3 posts scheduled for tomorrow</p>
										<span className="text-xs text-gray-a7">5 hours ago</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Profile */}
					<div className="relative">
						<button
							onClick={() => setShowProfile(!showProfile)}
							className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-a3 transition-colors"
						>
							<div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
								{userName.charAt(0).toUpperCase()}
							</div>
							<div className="hidden md:block text-left">
								<p className="text-sm font-semibold text-gray-12">{userName}</p>
								<p className="text-xs text-gray-a8">{userPlan} Plan</p>
							</div>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="text-gray-a8"
							>
								<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</button>

						{showProfile && (
							<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-a5 py-2 animate-fade-in">
								<div className="px-4 py-3 border-b border-gray-a5">
									<p className="font-semibold text-gray-12">{userName}</p>
									<p className="text-xs text-gray-a8 mt-1">{userPlan} Plan</p>
								</div>
								<button className="w-full px-4 py-2 text-left text-sm text-gray-11 hover:bg-gray-a2 transition-colors flex items-center gap-2">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										<circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
									Profile
								</button>
								<button className="w-full px-4 py-2 text-left text-sm text-gray-11 hover:bg-gray-a2 transition-colors flex items-center gap-2">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
									Settings
								</button>
								<button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										<polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										<line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
									Logout
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
