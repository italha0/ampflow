"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
	open: boolean;
	onOpenChange: (value: boolean) => void;
	title?: string;
	description?: string;
	children: React.ReactNode;
	actions?: React.ReactNode;
}

export function Modal({ open, onOpenChange, title, description, children, actions }: ModalProps) {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	if (!mounted) return null;

	return createPortal(
		<div
			className={cn(
				"fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm transition-opacity",
				open ? "opacity-100" : "pointer-events-none opacity-0",
			)}
			onClick={() => onOpenChange(false)}
		>
			<div
				onClick={(event) => event.stopPropagation()}
				className="w-full max-w-2xl rounded-2xl border border-gray-a6 bg-white p-6 shadow-2xl"
			>
				<div className="space-y-2">
					{title ? <h2 className="text-5 font-semibold text-gray-12">{title}</h2> : null}
					{description ? <p className="text-3 text-gray-9">{description}</p> : null}
				</div>
				<div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">{children}</div>
				{actions ? <div className="mt-6 flex justify-end gap-3">{actions}</div> : null}
			</div>
		</div>,
		document.body,
	);
}
