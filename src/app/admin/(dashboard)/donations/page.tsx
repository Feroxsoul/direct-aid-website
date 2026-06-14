import { AdminPageHeader, AdminText } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetDonations } from "@/lib/admin/data";

function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminDonationsPage() {
  await requirePermission("donations", "view");
  const donations = await adminGetDonations();

  return (
    <div className="dash-page">
      <AdminPageHeader titleKey="page.donations" subtitleKey="donations.subtitle" />

      <div className="dash-panel">
        {donations.length === 0 ? (
          <p className="dash-empty"><AdminText k="donations.empty" /></p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th><AdminText k="donations.date" /></th>
                  <th><AdminText k="donations.donor" /></th>
                  <th><AdminText k="donations.project" /></th>
                  <th><AdminText k="donations.amount" /></th>
                  <th><AdminText k="donations.status" /></th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td>{new Date(donation.created_at).toLocaleDateString()}</td>
                    <td>
                      {donation.donor_name ?? donation.donor_email ?? (
                        <AdminText k="common.anonymous" />
                      )}
                    </td>
                    <td>{donation.project_slug ?? "—"}</td>
                    <td>{formatMoney(Number(donation.amount), donation.currency)}</td>
                    <td>{donation.status}</td>
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
