import { markNotificationsRead } from "@/lib/admin/actions";
import { AdminText } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetNotifications } from "@/lib/admin/data";

export default async function AdminNotificationsPage() {
  const profile = await requireAdmin();
  const notifications = await adminGetNotifications(profile.user_id);

  return (
    <div className="dash-page">
      <header className="dash-page-header dash-panel-header">
        <div>
          <h1 className="dash-page-title">
            <AdminText k="page.notifications" />
          </h1>
          <p className="dash-page-subtitle">
            <AdminText k="notifications.subtitle" />
          </p>
        </div>
        <form action={markNotificationsRead}>
          <button type="submit" className="dash-btn">
            <AdminText k="common.markAllRead" />
          </button>
        </form>
      </header>

      <div className="dash-panel">
        {notifications.length === 0 ? (
          <p className="dash-empty"><AdminText k="common.noNotifications" /></p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th><AdminText k="notifications.time" /></th>
                  <th><AdminText k="notifications.type" /></th>
                  <th><AdminText k="notifications.titleCol" /></th>
                  <th><AdminText k="notifications.status" /></th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                    <td>{item.type}</td>
                    <td>
                      <strong>{item.title}</strong>
                      {item.body ? <div className="dash-empty">{item.body}</div> : null}
                    </td>
                    <td>
                      {item.is_read ? (
                        <AdminText k="common.read" />
                      ) : (
                        <AdminText k="common.newBadge" />
                      )}
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
