import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type ExecutionLog = {
	id: string;
	status: "PENDING" | "RUNNING" | "FINISHED" | "FAILED";
	startedAt?: string;
	finishedAt?: string;
	summary?: string;
};

export default function ExecutionsLogs() {
	const { workflowId } = useParams<{ workflowId: string }>();

	const [logs, setLogs] = useState<ExecutionLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// TODO: Replace mock data with real fetch when the backend GET executions endpoint is available.
	useEffect(() => {
		setLoading(true);
		setError(null);

		// Placeholder data so the page renders; swap this with an API call later.
		const mock: ExecutionLog[] = [
			{
				id: "exec-1",
				status: "FINISHED",
				startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
				finishedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
				summary: "Workflow completed successfully.",
			},
			{
				id: "exec-2",
				status: "RUNNING",
				startedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
				summary: "Execution in progress...",
			},
		];

		setLogs(mock);
		setLoading(false);
	}, [workflowId]);

	return (
		<div className="min-h-[calc(100vh-75px)] text-black p-8">
			<div className="max-w-7xl mx-auto space-y-4">

                
				<div className="flex items-center justify-between">
					<div>
						<p className="text-3xl font-semibold">Execution Logs</p>
						<p className="text-gray-500 text-md mt-1">
							{workflowId ? `Workflow: ${workflowId}` : "No workflow selected"}
						</p>
					</div>
				</div>

				{loading && <div className="text-sm text-gray-500">Loading logs…</div>}
				{error && <div className="text-sm text-red-600">{error}</div>}

				{!loading && !error && (
					<div className="bg-white rounded-md border border-gray-200">
						<div className="grid grid-cols-4 gap-4 px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-200">
							<div>Execution ID</div>
							<div>Status</div>
							<div>Started</div>
							<div>Finished</div>
						</div>

						{logs.length === 0 ? (
							<div className="px-4 py-6 text-sm text-gray-500">No executions found.</div>
						) : (
							<div className="divide-y divide-gray-100">
								{logs.map((log) => (
									<div
										key={log.id}
										className="grid grid-cols-4 gap-4 px-4 py-3 text-sm text-gray-800"
									>
										<div className="truncate">{log.id}</div>
										<div className="capitalize">{log.status.toLowerCase()}</div>
										<div>
											{log.startedAt
												? new Date(log.startedAt).toLocaleString()
												: "—"}
										</div>
										<div>
											{log.finishedAt
												? new Date(log.finishedAt).toLocaleString()
												: log.status === "RUNNING"
													? "In progress"
													: "—"}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
