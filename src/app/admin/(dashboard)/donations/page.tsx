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
      <header className="dash-page-header">
        <h1 className="dash-page-title">Donations</h1>
        <p className="dash-page-subtitle">
          Track donations by project, category, and donor.
        </p>
      </header>

      <div className="dash-panel">
        {donations.length === 0 ? (
          <p className="dash-empty">
            No donations yet. Connect Stripe or import donation records to see
            analytics here.
          </p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor</th>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td>{new Date(donation.created_at).toLocaleDateString()}</td>
                    <td>{donation.donor_name ?? donation.donor_email ?? "Anonymous"}</td>
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
