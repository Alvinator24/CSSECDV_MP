"use client";

import { useEffect, useState } from "react";

type Log = {
  id: string;
  user: string;
  action: string;
  entity: string;
  entity_id?: string;
  details?: any;
  created_at: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/logs", {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setLogs(data);
      } catch (err: any) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    return (
      (!actionFilter || log.action === actionFilter) &&
      (!entityFilter || log.entity === entityFilter)
    );
  });

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="FAILED_LOGIN">FAILED_LOGIN</option>
          <option value="FAILED_PASSWORD_UPDATE">FAILED_PASSWORD_RESET</option>
          <option value="FAILED_PASSWORD_CHANGE">FAILED_PASSWORD_CHANGE</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Entities</option>
          <option value="project">Project</option>
          <option value="issue">Issue</option>
          <option value="comment">Comment</option>
          <option value="auth">Auth</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Logs Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredLogs.length > 0 ? (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">User</th>
                <th className="p-3 border">Action</th>
                <th className="p-3 border">Entity</th>
                <th className="p-3 border">Entity ID</th>
                <th className="p-3 border">Details</th>
                <th className="p-3 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{log.user}</td>
                  <td className="p-3 border">{log.action}</td>
                  <td className="p-3 border">{log.entity}</td>
                  <td className="p-3 border">{log.entity_id || "-"}</td>

                  <td className="p-3 border">
                    <pre className="text-xs whitespace-pre-wrap">
                      {log.details
                        ? JSON.stringify(log.details, null, 2)
                        : "-"}
                    </pre>
                  </td>

                  <td className="p-3 border">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No logs found</p>
      )}
    </div>
  );
}