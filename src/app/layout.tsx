import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "10x10 مشاريع",
  description: "10x10 مشاريع",
  openGraph: {
    title: "10x10 مشاريع",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="body-2 da-rtl flex min-h-screen flex-col bg-da-background text-da-black">
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
