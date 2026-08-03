import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccessLens — see what your users can't",
  description:
    "One-click WCAG accessibility auditor. Paste HTML, get scored violations, plain-English fixes, and draft alt text — no login, no key.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
