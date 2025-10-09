"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "gradient" | "success" | "warning" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
	primary:
		"bg-accent-9 text-white hover:bg-accent-10 focus-visible:ring-2 focus-visible:ring-accent-9",
	secondary:
		"bg-gray-a4 text-gray-12 hover:bg-gray-a5 focus-visible:ring-2 focus-visible:ring-gray-a7",
	outline:
		"border border-gray-a6 text-gray-12 hover:bg-gray-a3 focus-visible:ring-2 focus-visible:ring-gray-a7",
	ghost: "text-gray-11 hover:bg-gray-a3",
	gradient: "btn-gradient-primary shadow-md hover:shadow-lg",
	success: "bg-[#209F84] text-white hover:bg-[#1a8069] focus-visible:ring-2 focus-visible:ring-[#209F84]",
	warning: "bg-[#f0a907] text-white hover:bg-[#d89606] focus-visible:ring-2 focus-visible:ring-[#f0a907]",
	danger: "bg-[#F24242] text-white hover:bg-[#d93636] focus-visible:ring-2 focus-visible:ring-[#F24242]",
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: "h-9 px-3 text-2 rounded-md",
	md: "h-10 px-4 text-3 rounded-lg",
	lg: "h-12 px-6 text-4 rounded-lg",
	icon: "h-10 w-10 rounded-full",
};

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={cn(
					"inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none",
					variantStyles[variant],
					sizeStyles[size],
					disabled || isLoading ? "opacity-60 cursor-not-allowed" : "",
					className,
				)}
				disabled={disabled || isLoading}
				{...props}
			>
				{isLoading && (
					<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
				)}
				{children}
			</button>
		);
	},
);

Button.displayName = "Button";
