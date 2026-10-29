import { inter } from "@/fonts";
import { Toaster } from "@/lib/toast/config";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://promo-flow-web-zeta.vercel.app"),
  title: { default: "PromoFlow", template: "%s | PromoFlow" },
  description:
    "Capture produtos, organize ofertas e acompanhe suas publicações no WhatsApp.",
  applicationName: "PromoFlow",
  openGraph: {
    title: "PromoFlow — Sua rotina de ofertas, organizada",
    description:
      "Da captura do produto à publicação nos seus grupos de WhatsApp.",
    url: "/",
    siteName: "PromoFlow",
    locale: "pt_BR",
    type: "website",
  },
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
