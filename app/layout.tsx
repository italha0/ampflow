import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmpFlow - Automated Content Distribution",
  description: "Automated content distributor for Whop creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
