import { cn } from "@/lib/utils";
import { Card } from "./card";

interface StatCardProps {
	label: string;
	value: string | number;
	trend?: string;
	trendType?: "up" | "down" | "neutral";
	icon?: React.ReactNode;
	gradient?: "primary" | "success" | "warning" | "info";
	percentage?: string;
	className?: string;
}

export function StatCard({
	label,
	value,
	trend,
	trendType = "neutral",
	icon,
	gradient,
	percentage,
	className,
}: StatCardProps) {
	const trendColors = {
		up: "text-green-600",
		down: "text-red-600",
		neutral: "text-gray-a8",
	};

	if (gradient) {
		return (
			<Card variant="gradient" gradient={gradient} className={cn("stat-card", className)} hover>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<p className="text-xs uppercase tracking-wide text-white/80 mb-2">{label}</p>
						<p className="text-4xl font-bold text-white mb-1">{value}</p>
						{trend && (
							<div className="flex items-center gap-2">
								{percentage && (
									<span className="text-sm font-semibold text-white/90">{percentage}</span>
								)}
								<p className="text-xs text-white/70">{trend}</p>
							</div>
						)}
					</div>
					{icon && <div className="text-white/80 flex-shrink-0">{icon}</div>}
				</div>
			</Card>
		);
	}

	return (
		<Card className={cn("stat-card", className)} hover>
			<div className="flex items-start justify-between mb-3">
				<p className="text-2 uppercase tracking-wide text-gray-a7">{label}</p>
				{icon && <div className="text-gray-a8">{icon}</div>}
			</div>
			<p className="text-6 font-semibold text-gray-12 mb-2">{value}</p>
			{trend && (
				<div className="flex items-center gap-2">
					{percentage && (
						<span className={cn("text-sm font-semibold", trendColors[trendType])}>{percentage}</span>
					)}
					<p className="text-2 text-gray-a8">{trend}</p>
				</div>
			)}
		</Card>
	);
}
