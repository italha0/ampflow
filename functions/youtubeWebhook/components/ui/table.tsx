import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
	return (
		<div className="overflow-x-auto rounded-lg border border-gray-a5">
			<table
				className={cn(
					"min-w-full divide-y divide-gray-a5 text-left text-3 text-gray-11 table-hover",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
	return (
		<thead className={cn("bg-gradient-to-r from-gray-a2 to-gray-a3 text-gray-11", className)} {...props} />
	);
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
	return <tbody className={cn("divide-y divide-gray-a4 bg-white", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
	return <tr className={cn("transition-all duration-200", className)} {...props} />;
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
	return (
		<th
			className={cn("px-4 py-4 text-2 font-bold uppercase tracking-wide text-gray-12", className)}
			{...props}
		/>
	);
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
	return <td className={cn("px-4 py-4", className)} {...props} />;
}
