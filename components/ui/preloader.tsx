"use client";

import { useEffect, useState } from "react";

export function Preloader() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Hide preloader after initial load
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	if (!isLoading) return null;

	return (
		<div className="preloader">
			<div className="sk-three-bounce">
				<div className="sk-bounce sk-bounce1"></div>
				<div className="sk-bounce sk-bounce2"></div>
				<div className="sk-bounce sk-bounce3"></div>
			</div>
		</div>
	);
}
