export const metadata = {
  title: "لوحة التحكم | 10x10",
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-body dash-mode">{children}</div>;
}
