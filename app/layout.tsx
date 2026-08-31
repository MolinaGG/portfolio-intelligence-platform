import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evidaris — Clareza que você pode conferir",
  description: "Consolide posições da B3 e enxergue seu patrimônio em real e dólar.",
  openGraph: {
    title: "Evidaris",
    description: "Clareza que você pode conferir.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Evidaris — Clareza que você pode conferir." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Evidaris",
    description: "Clareza que você pode conferir.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
