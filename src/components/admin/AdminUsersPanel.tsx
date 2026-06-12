import {
  removeAdminUser,
  saveAdminUser,
  updateAdminUser,
} from "@/lib/admin/actions";
import {
  ADMIN_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/lib/admin/roles";
import type { AdminUserRow } from "@/types";

type AdminUsersPanelProps = {
  users: AdminUserRow[];
  currentUserId: string;
};

export function AdminUsersPanel({ users, currentUserId }: AdminUsersPanelProps) {
  return (
    <>
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h2 className="admin-section-title">إضافة مدير جديد</h2>
        <p className="admin-page-subtitle" style={{ marginBottom: "1rem" }}>
          أضف البريد والدور أولاً، ثم أنشئ نفس الحساب في Supabase → Authentication →
          Users (أو اطلب من الشخص تسجيل الدخول بنفس البريد).
        </p>
        <form action={saveAdminUser} className="admin-form admin-form-inline">
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-email">
              البريد الإلكتروني
            </label>
            <input
              id="new-email"
              name="email"
              type="email"
              className="admin-input"
              required
              dir="ltr"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-display-name">
              الاسم (اختياري)
            </label>
            <input
              id="new-display-name"
              name="display_name"
              type="text"
              className="admin-input"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-role">
              الدور
            </label>
            <select id="new-role" name="role" className="admin-input" defaultValue="admin">
              {ADMIN_ROLES.filter((role) => role !== "super_admin").map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="admin-button">
            إضافة
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h2 className="admin-section-title">المستخدمون المسجلون</h2>
        {users.length === 0 ? (
          <p>لا يوجد مستخدمون بعد.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>البريد</th>
                <th>الاسم</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>مرتبط</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((adminUser) => (
                <tr key={adminUser.id}>
                  <td dir="ltr">{adminUser.email}</td>
                  <td>{adminUser.display_name ?? "—"}</td>
                  <td>{ROLE_LABELS[adminUser.role]}</td>
                  <td>{adminUser.is_active ? "نشط" : "معطّل"}</td>
                  <td>{adminUser.user_id ? "نعم" : "بانتظار الدخول"}</td>
                  <td>
                    <details className="admin-details">
                      <summary className="admin-link">تعديل</summary>
                      <form action={updateAdminUser} className="admin-form admin-form-stack">
                        <input type="hidden" name="id" value={adminUser.id} />
                        <div className="admin-field">
                          <label className="admin-label">الاسم</label>
                          <input
                            name="display_name"
                            type="text"
                            className="admin-input"
                            defaultValue={adminUser.display_name ?? ""}
                          />
                        </div>
                        <div className="admin-field">
                          <label className="admin-label">الدور</label>
                          <select
                            name="role"
                            className="admin-input"
                            defaultValue={adminUser.role}
                            disabled={adminUser.id === currentUserId}
                          >
                            {ADMIN_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                          <p className="admin-hint">{ROLE_DESCRIPTIONS[adminUser.role]}</p>
                        </div>
                        <label className="admin-checkbox">
                          <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={adminUser.is_active}
                            disabled={adminUser.id === currentUserId}
                          />
                          <span>نشط</span>
                        </label>
                        <button type="submit" className="admin-button admin-button-secondary">
                          حفظ
                        </button>
                      </form>
                      {adminUser.id !== currentUserId ? (
                        <form action={removeAdminUser} className="admin-actions">
                          <input type="hidden" name="id" value={adminUser.id} />
                          <button type="submit" className="admin-button admin-button-danger">
                            حذف
                          </button>
                        </form>
                      ) : null}
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h2 className="admin-section-title">الأدوار</h2>
        <ul className="admin-role-list">
          {ADMIN_ROLES.map((role) => (
            <li key={role}>
              <strong>{ROLE_LABELS[role]}</strong> — {ROLE_DESCRIPTIONS[role]}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
