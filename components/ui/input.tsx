"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	leading?: React.ReactNode;
	tailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, leading, tailing, disabled, ...props }, ref) => {
		return (
			<div
				className={cn(
					"flex h-10 w-full items-center gap-2 rounded-lg border border-gray-a6 bg-white px-3 text-3 shadow-sm transition focus-within:border-accent-8 focus-within:ring-2 focus-within:ring-accent-8/20",
					disabled ? "opacity-60 bg-gray-a3 cursor-not-allowed" : "",
					className,
				)}
			>
				{leading ? <span className="text-gray-a9">{leading}</span> : null}
				<input
					ref={ref}
					className="flex-1 bg-transparent text-gray-12 outline-none placeholder:text-gray-a8"
					disabled={disabled}
					{...props}
				/>
				{tailing ? <span className="text-gray-a9">{tailing}</span> : null}
			</div>
		);
	},
);

Input.displayName = "Input";
