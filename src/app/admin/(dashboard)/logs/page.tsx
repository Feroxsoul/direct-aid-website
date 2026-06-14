import { requireSuperAdmin } from "@/lib/admin/auth";
import { adminGetAuditLogs } from "@/lib/admin/data";

function formatDetails(details: Record<string, unknown>) {
  const entries = Object.entries(details ?? {});
  if (!entries.length) return "—";
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(", ");
}

export default async function AdminLogsPage() {
  await requireSuperAdmin();
  const logs = await adminGetAuditLogs();

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">Activity Log</h1>
        <p className="dash-page-subtitle">
          Full audit trail — who did what and when across the admin panel.
        </p>
      </header>

      <div className="dash-panel">
        {logs.length === 0 ? (
          <p className="dash-empty">No activity recorded yet.</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>Email</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString("en-GB")}</td>
                    <td>{log.actor_name ?? "—"}</td>
                    <td dir="ltr">{log.actor_email ?? "—"}</td>
                    <td>{log.action}</td>
                    <td>
                      {log.resource_type}
                      {log.resource_id ? `: ${log.resource_id}` : ""}
                    </td>
                    <td>{formatDetails(log.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
