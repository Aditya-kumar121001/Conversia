import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchExecutions, type ExecutionLog } from "../../lib/workflowClient";

export default function ExecutionsLogs() {
	const { workflowId } = useParams<{ workflowId: string }>();

	const [logs, setLogs] = useState<ExecutionLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!workflowId) return;

		let active = true;

		const loadExecutions = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchExecutions(workflowId);
				if (active) {
					setLogs(data);
				}
			} catch (err: any) {
				if (active) setError(err.message || "Failed to fetch executions.");
			} finally {
				if (active) setLoading(false);
			}
		};

		loadExecutions();

		return () => {
			active = false;
		};
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
										key={log._id}
										className="grid grid-cols-4 gap-4 px-4 py-3 text-sm text-gray-800 items-center"
									>
										<div className="truncate">{log._id}</div>
										<div className="flex items-center">
											<span
												className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
													log.status === "COMPLETED" || log.status as string === "FINISHED"
														? "bg-green-100 text-green-700"
														: log.status === "FAILED"
															? "bg-red-100 text-red-700"
															: log.status === "RUNNING"
																? "bg-blue-100 text-blue-700"
																: "bg-gray-100 text-gray-700"
												}`}
											>
												{log.status.toLowerCase()}
											</span>
										</div>
										<div>
											{log.startedAt
												? new Date(log.startedAt).toLocaleString()
												: "—"}
										</div>
										<div>
											{log.completedAt
												? new Date(log.completedAt).toLocaleString()
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
