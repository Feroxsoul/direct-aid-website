import Link from "next/link";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { getRoleBadgeColor, getRoleLabel } from "@/lib/admin/roles";
import type { DashboardStats } from "@/types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  label,
  value,
  growth,
  href,
}: {
  label: string;
  value: string;
  growth?: number;
  href?: string;
}) {
  const body = (
    <div className="dash-stat-card">
      <p className="dash-stat-label">{label}</p>
      <p className="dash-stat-value">{value}</p>
      {growth !== undefined ? (
        <p className={`dash-stat-growth${growth >= 0 ? " is-up" : " is-down"}`}>
          {growth >= 0 ? "↑" : "↓"} {Math.abs(growth)}% vs last month
        </p>
      ) : null}
    </div>
  );

  return href ? (
    <Link href={href} className="dash-stat-card-link">
      {body}
    </Link>
  ) : (
    body
  );
}

type DashboardViewProps = {
  stats: DashboardStats;
};

export function DashboardView({ stats }: DashboardViewProps) {
  const maxMonth = Math.max(...stats.donationsByMonth.map((m) => m.amount), 1);
  const maxRole = Math.max(...stats.usersByRole.map((r) => r.count), 1);

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Platform Overview</h1>
          <p className="dash-page-subtitle">
            Real-time snapshot of donations, projects, and team activity.
          </p>
        </div>
      </header>

      <section className="dash-stat-grid">
        <StatCard
          label="Total Donations"
          value={formatMoney(stats.totalDonations)}
          growth={stats.donationGrowth}
          href="/admin/donations"
        />
        <StatCard label="Total Donors" value={String(stats.totalDonors)} />
        <StatCard
          label="Total Projects"
          value={String(stats.totalProjects)}
          href="/admin/projects"
        />
        <StatCard label="Active Projects" value={String(stats.activeProjects)} />
        <StatCard label="Total Users" value={String(stats.totalUsers)} href="/admin/users" />
        <StatCard label="Total Roles" value={String(stats.totalRoles)} href="/admin/roles" />
        <StatCard
          label="Monthly Donations"
          value={formatMoney(stats.monthlyDonations)}
          growth={stats.donationGrowth}
        />
        <StatCard
          label="Yearly Donations"
          value={formatMoney(stats.yearlyDonations)}
        />
      </section>

      <div className="dash-grid-2">
        <section className="dash-panel">
          <h2 className="dash-panel-title">Donations by Month</h2>
          <div className="dash-bar-chart">
            {stats.donationsByMonth.length === 0 ? (
              <p className="dash-empty">No donations recorded yet.</p>
            ) : (
              stats.donationsByMonth.map((item) => (
                <div key={item.month} className="dash-bar-row">
                  <span className="dash-bar-label">{item.month}</span>
                  <div className="dash-bar-track">
                    <div
                      className="dash-bar-fill"
                      style={{ width: `${(item.amount / maxMonth) * 100}%` }}
                    />
                  </div>
                  <span className="dash-bar-value">{formatMoney(item.amount)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="dash-panel">
          <h2 className="dash-panel-title">Users by Role</h2>
          <div className="dash-bar-chart">
            {stats.usersByRole.length === 0 ? (
              <p className="dash-empty">No admin users yet.</p>
            ) : (
              stats.usersByRole.map((item) => (
                <div key={item.role} className="dash-bar-row">
                  <RoleBadge label={item.label} color={item.color} size="sm" />
                  <div className="dash-bar-track">
                    <div
                      className="dash-bar-fill"
                      style={{
                        width: `${(item.count / maxRole) * 100}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                  <span className="dash-bar-value">{item.count}</span>
                </div>
              ))
            )}
          </div>
          <div className="dash-mini-stats">
            <span>Suspended: {stats.suspendedUsers}</span>
            <span>Active: {stats.totalUsers - stats.suspendedUsers}</span>
          </div>
        </section>
      </div>

      <section className="dash-panel">
        <div className="dash-panel-header">
          <h2 className="dash-panel-title">Top Projects by Donations</h2>
          <Link href="/admin/projects" className="dash-link">
            View all →
          </Link>
        </div>
        <div className="dash-project-rank-list">
          {stats.topProjects.length === 0 ? (
            <p className="dash-empty">No projects with donation data yet.</p>
          ) : (
            stats.topProjects.map((project) => {
              const progress =
                project.goal_amount > 0
                  ? Math.min(100, (project.amount_raised / project.goal_amount) * 100)
                  : 0;

              return (
                <div key={project.slug} className="dash-project-rank">
                  <div className="dash-project-rank-meta">
                    <strong>{project.title}</strong>
                    <span>
                      {formatMoney(project.amount_raised)}
                      {project.goal_amount > 0
                        ? ` / ${formatMoney(project.goal_amount)}`
                        : ""}
                    </span>
                  </div>
                  <div className="dash-progress-track">
                    <div
                      className="dash-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="dash-panel">
        <h2 className="dash-panel-title">Recently Added Users</h2>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => {
                const slug = user.role_slug ?? user.role;
                return (
                  <tr key={user.id}>
                    <td>{user.display_name ?? "—"}</td>
                    <td>{user.email}</td>
                    <td>
                      <RoleBadge
                        label={getRoleLabel(slug)}
                        color={getRoleBadgeColor(slug)}
                        size="sm"
                      />
                    </td>
                    <td>
                      {user.suspended_at
                        ? "Suspended"
                        : user.is_active
                          ? "Active"
                          : "Inactive"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
