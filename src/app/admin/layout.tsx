export const metadata = {
  title: "10x10 by Direct Aid | Admin",
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-body dash-mode" dir="ltr" lang="en">
      {children}
    </div>
  );
}
