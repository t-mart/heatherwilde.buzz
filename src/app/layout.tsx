import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Heatherwilde Network",
  description:
    "Status of the Optimum ISP in the Heatherwilde community of Pflugerville, TX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
