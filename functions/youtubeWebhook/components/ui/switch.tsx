"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
	checked?: boolean;
	onCheckedChange?: (value: boolean) => void;
}

export function Switch({
	checked = false,
	onCheckedChange,
	className,
	...props
}: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onCheckedChange?.(!checked)}
			className={cn(
				"relative inline-flex h-6 w-11 items-center rounded-full border border-gray-a6 transition",
				checked ? "bg-accent-9" : "bg-gray-a4",
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					"h-5 w-5 transform rounded-full bg-white shadow transition",
					checked ? "translate-x-5" : "translate-x-1",
				)}
			/>
		</button>
	);
}
