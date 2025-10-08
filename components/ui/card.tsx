import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	title?: string;
	action?: React.ReactNode;
	containerClassName?: string;
	variant?: "default" | "gradient" | "bordered" | "flat";
	hover?: boolean;
	gradient?: "primary" | "success" | "warning" | "info";
}

export function Card({ 
	title, 
	action, 
	children, 
	className, 
	containerClassName, 
	variant = "default",
	hover = false,
	gradient,
	...props 
}: CardProps) {
	const baseStyles = "rounded-2xl p-6 transition-all duration-300";
	
	const variantStyles = {
		default: "border border-gray-a5 bg-white shadow-sm shadow-gray-a4",
		gradient: gradient === "primary" ? "gradient-primary text-white border-0 shadow-lg" :
				  gradient === "success" ? "gradient-success text-white border-0 shadow-lg" :
				  gradient === "warning" ? "gradient-warning text-white border-0 shadow-lg" :
				  gradient === "info" ? "gradient-info text-white border-0 shadow-lg" :
				  "gradient-primary text-white border-0 shadow-lg",
		bordered: "border-2 border-gray-a6 bg-white",
		flat: "bg-gray-a2 border-0",
	};
	
	const hoverStyles = hover ? "card-hover cursor-pointer" : "";
	
	return (
		<section
			className={cn(
				baseStyles,
				variantStyles[variant],
				hoverStyles,
				"animate-fade-in",
				containerClassName,
			)}
			{...props}
		>
			{title ? (
				<header className="mb-4 flex items-center justify-between gap-4">
					<h3 className={cn(
						"text-5 font-semibold",
						variant === "gradient" ? "text-white" : "text-gray-12"
					)}>
						{title}
					</h3>
					{action}
				</header>
			) : null}
			<div className={cn("space-y-4", className)}>{children}</div>
		</section>
	);
}
