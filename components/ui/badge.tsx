import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "outline" | "gradient-primary" | "gradient-success" | "gradient-warning" | "gradient-info";

const styles: Record<BadgeVariant, string> = {
	default: "bg-gray-a4 text-gray-12",
	success: "bg-green-4 text-green-12",
	warning: "bg-amber-4 text-amber-12",
	danger: "bg-red-4 text-red-12",
	outline: "border border-gray-a6 text-gray-11",
	"gradient-primary": "badge-gradient-primary shadow-md",
	"gradient-success": "badge-gradient-success shadow-md",
	"gradient-warning": "gradient-warning text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md",
	"gradient-info": "gradient-info text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
	dot?: boolean;
}

export function Badge({ variant = "default", dot = false, className, children, ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2 font-medium transition-all",
				styles[variant],
				className,
			)}
			{...props}
		>
			{dot && (
				<span className={cn(
					"w-1.5 h-1.5 rounded-full",
					variant === "success" || variant === "gradient-success" ? "bg-green-500" :
					variant === "warning" || variant === "gradient-warning" ? "bg-yellow-500" :
					variant === "danger" ? "bg-red-500" :
					"bg-gray-500"
				)} />
			)}
			{children}
		</span>
	);
}
