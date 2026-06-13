import { markNotificationsRead } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetNotifications } from "@/lib/admin/data";

export default async function AdminNotificationsPage() {
  const profile = await requireAdmin();
  const notifications = await adminGetNotifications(profile.user_id);

  return (
    <div className="dash-page">
      <header className="dash-page-header dash-panel-header">
        <div>
          <h1 className="dash-page-title">Notifications</h1>
          <p className="dash-page-subtitle">
            Donations, users, projects, and platform events.
          </p>
        </div>
        <form action={markNotificationsRead}>
          <button type="submit" className="dash-btn">
            Mark all read
          </button>
        </form>
      </header>

      <div className="dash-panel">
        {notifications.length === 0 ? (
          <p className="dash-empty">No notifications yet.</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Status</th>
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
                    <td>{item.is_read ? "Read" : "New"}</td>
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
