"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	maxLengthIndicator?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, maxLength, maxLengthIndicator, ...props }, ref) => {
		const [value, setValue] = React.useState(props.defaultValue?.toString() ?? "");

		return (
			<div className="space-y-1">
				<textarea
					ref={ref}
					className={cn(
						"w-full rounded-lg border border-gray-a6 bg-white px-3 py-2 text-3 text-gray-12 shadow-sm transition focus:border-accent-8 focus:ring-2 focus:ring-accent-8/20",
						className,
					)}
					maxLength={maxLength}
					onChange={(event) => {
						setValue(event.target.value);
						props.onChange?.(event);
					}}
					{...props}
				/>
				{maxLength && maxLengthIndicator ? (
					<p className="text-right text-2 text-gray-a8">
						{value.length}/{maxLength}
					</p>
				) : null}
			</div>
		);
	},
);

Textarea.displayName = "Textarea";
