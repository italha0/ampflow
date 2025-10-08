import { DateTime } from "luxon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import type { LogEntry } from "@/types";

interface LogsTableProps {
	logs: LogEntry[];
	onRefresh?: () => void;
	title?: string;
	emptyMessage?: string;
	selectedPostCaption?: string;
}

export function LogsTable({
	logs,
	onRefresh,
	title = "Activity logs",
	emptyMessage = "No activity yet.",
	selectedPostCaption,
}: LogsTableProps) {
	return (
		<Card
			title={title}
			action={
				onRefresh ? (
					<Button variant="outline" size="sm" onClick={onRefresh}>
						Refresh
					</Button>
				) : null
			}
		>
			{selectedPostCaption ? (
				<p className="mb-4 text-3 text-gray-a8">
					Showing logs for: <span className="font-medium text-gray-11">{selectedPostCaption}</span>
				</p>
			) : null}
			{logs.length === 0 ? (
				<p className="text-3 text-gray-a7">{emptyMessage}</p>
			) : (
				<Table>
					<THead>
						<TR>
							<TH>Level</TH>
							<TH>Message</TH>
							<TH>Timestamp</TH>
						</TR>
					</THead>
					<TBody>
						{logs.map((log) => (
							<TR key={log.$id}>
								<TD>
									<Badge
										variant={
											log.level === "error"
												? "danger"
											: log.level === "warn"
												? "warning"
											: "default"
										}
									>
										{log.level}
									</Badge>
								</TD>
								<TD className="max-w-xl whitespace-pre-line text-3 text-gray-11">
									{log.message}
								</TD>
								<TD className="text-3 text-gray-a8">
									{DateTime.fromISO(log.timestamp).toLocal().toFormat("MMM dd · HH:mm:ss")}
								</TD>
							</TR>
						))}
					</TBody>
				</Table>
			)}
		</Card>
	);
}
