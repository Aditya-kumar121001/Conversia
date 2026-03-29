import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  fetchUserWorkflows,
  type WorkflowRecord,
} from "../../lib/workflowClient";

export default function WorkflowHistory() {
  const { domainName } = useParams<{ domainName: string }>();
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);

  const allWorkflows = async () => {
    try {
      const token = localStorage.getItem("token") ?? undefined;
      const workflows = await fetchUserWorkflows(token, domainName);
      setWorkflows(workflows);
    } catch (err) {
      console.error("Failed to load workflows", err);
      setWorkflows([]);
    }
  };

  useEffect(() => {
    allWorkflows();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-75px)] text-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-semibold">Workflow History</p>
            <p className="text-gray-500 text-md mt-1">
              Manage all chatbot worklow history
            </p>
          </div>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-4 gap-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-300 mt-4">
          <div>Workflow Id</div>
          <div>Workflow Status</div>
          <div>View Workflow</div>
          <div>View Workflow Execution</div>
        </div>

        {/* Domain Rows */}
        <div className="mt-2 overflow-hidden">
          {workflows.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              No worflows found
            </div>
          ) : (
            <div className="space-y-2">
              {workflows.map((a) => (
                <div
                  key={a._id}
                  className="grid grid-cols-4 gap-4 items-center py-1 bg-white"
                >
                  {/* ID */}
                  <div className="text-sm text-gray-500">{a._id}</div>

                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      {a
                        .workflowStatus!.split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase(),
                        )
                        .join(" ")}
                    </div>
                  </div>

                  {/* Workflow */}
                  <div className="text-sm text-gray-500">
                    <button
                      onClick={() => navigate(`/workflow/${a._id}`)}
                      className="px-3 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
                    >
                      <span className="text-sm">View Workflow</span>
                    </button>
                  </div>

                  {/* Executions Logs */}
                  <div className="text-sm text-gray-500">
                    <button
                      onClick={() => {
                        navigate(`/executions/${a._id}`);
                      }}
                      className="px-3 py-2 bg-black text-white rounded-md hover:brightness-80 hover:cursor-pointer"
                    >
                      <span className="text-sm">View Executions</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
