import { AdminPageHeader, AdminText } from "@/components/admin/AdminPageHeader";
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
      <AdminPageHeader titleKey="page.logs" subtitleKey="logs.subtitle" />

      <div className="dash-panel">
        {logs.length === 0 ? (
          <p className="dash-empty"><AdminText k="common.noActivity" /></p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th><AdminText k="logs.when" /></th>
                  <th><AdminText k="logs.who" /></th>
                  <th><AdminText k="logs.email" /></th>
                  <th><AdminText k="logs.action" /></th>
                  <th><AdminText k="logs.resource" /></th>
                  <th><AdminText k="logs.details" /></th>
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
