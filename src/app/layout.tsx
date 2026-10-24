import { inter } from "@/fonts";
import { Toaster } from "@/lib/toast/config";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://next-template.vercel.app"),
  title: {
    default: "PromoFlow",
    template: "%s | PromoFlow",
  },
  description: "Conecte seu WhatsApp e organize suas ofertas.",
  applicationName: "PromoFlow",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Next Template",
    "Next.js",
    "template",
    "sistema para desenvolvedores",
    "sistema para equipes de desenvolvimento",
    "gestão de projetos para desenvolvedores",
  ],
  authors: [
    { name: "Monnuery Junior", url: "https://next-template.vercel.app" },
  ],
  creator: "Monnuery Junior",
  publisher: "Next Template",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Next Template | Template para Projetos Next.js",
    description: "Template completo para futuros projetos na Syslae Solutions",
    url: "https://next-template.vercel.app",
    siteName: "Next Template",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://next-template.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "Next Template - Template para Projetos Next.js",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Next Template | Template para Projetos Next.js",
    description: "Template completo para futuros projetos na Syslae Solutions",
    images: ["https://next-template.vercel.app/og.png"],
    creator: "@monnueryj", // se existir
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  category: "technology",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
