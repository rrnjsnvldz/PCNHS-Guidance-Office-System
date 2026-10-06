import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PCNHS Guidance Office System",
  description: "Palayan City National High School — Guidance Office & Student Profiling System",
  keywords: ["PCNHS", "Guidance Office", "Student Profiling", "DepEd", "Counseling"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
