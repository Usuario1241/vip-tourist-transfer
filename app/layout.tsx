import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.viptouristtransfer.com"),

  title: "VIP Tourist Transfer | Traslados Privados en República Dominicana",

  description:
    "Reserva traslados privados en República Dominicana. Transporte desde aeropuertos, hoteles y destinos como Punta Cana, Santo Domingo, La Romana y más.",

  keywords: [
    "VIP Tourist Transfer",
    "traslados privados República Dominicana",
    "transfer Punta Cana",
    "Punta Cana airport transfer",
    "Santo Domingo airport transfer",
    "transfer aeropuerto SDQ",
    "transporte aeropuerto Santo Domingo",
    "transporte privado República Dominicana",
    "traslados aeropuerto República Dominicana",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "VIP Tourist Transfer | Traslados Privados en República Dominicana",
    description:
      "Traslados privados desde aeropuertos, hoteles y destinos turísticos de República Dominicana.",
    url: "https://www.viptouristtransfer.com/",
    siteName: "VIP Tourist Transfer",
    locale: "es_DO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LLGNRNQWLZ"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LLGNRNQWLZ');
          `}
        </Script>
      </body>
    </html>
  );
}