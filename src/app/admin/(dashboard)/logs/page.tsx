import { requireSuperAdmin } from "@/lib/admin/auth";
import { adminGetAuditLogs } from "@/lib/admin/data";

export default async function AdminLogsPage() {
  await requireSuperAdmin();
  const logs = await adminGetAuditLogs();

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">سجل النشاط</h1>
        <p className="dash-page-subtitle">
          سجل تدقيق لتسجيلات الدخول والتعديلات والحذف وتغييرات الأدوار.
        </p>
      </header>

      <div className="dash-panel">
        {logs.length === 0 ? (
          <p className="dash-empty">لا يوجد نشاط مسجّل بعد.</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>الوقت</th>
                  <th>المستخدم</th>
                  <th>الإجراء</th>
                  <th>المورد</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.actor_email ?? "—"}</td>
                    <td>{log.action}</td>
                    <td>
                      {log.resource_type}
                      {log.resource_id ? `: ${log.resource_id}` : ""}
                    </td>
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
