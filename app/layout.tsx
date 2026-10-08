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

const siteUrl = "https://www.viptouristtransfer.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: "VIP Tourist Transfer | Dominican Republic Airport & Private Transfers",

  description:
    "Book private airport transfers and tourist transportation in the Dominican Republic. Transfers from Punta Cana (PUJ), Santo Domingo (SDQ), La Romana, hotels and tourist destinations. International travelers welcome.",

  keywords: [
    "VIP Tourist Transfer",
    "Dominican Republic airport transfer",
    "Dominican Republic private transportation",
    "Punta Cana airport transfer",
    "Santo Domingo airport transfer",
    "La Romana airport transfer",
    "PUJ airport transfer",
    "SDQ airport transfer",
    "private driver Dominican Republic",
    "Dominican Republic hotel transfers",
    "traslados privados República Dominicana",
    "transporte aeropuerto Punta Cana",
    "traslado aeropuerto Santo Domingo",
    "transfert aéroport Punta Cana",
    "transfert privé République dominicaine",
    "Flughafentransfer Punta Cana",
    "privater Transfer Dominikanische Republik",
    "trasferimento aeroporto Punta Cana",
    "trasporto privato Repubblica Dominicana",
    "transfer aeroporto Punta Cana",
    "transporte privado República Dominicana",
    "プンタカナ 空港送迎",
    "ドミニカ共和国 空港送迎",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "VIP Tourist Transfer | Airport & Private Transfers in the Dominican Republic",
    description:
      "Private airport transfers and tourist transportation in Punta Cana, Santo Domingo, La Romana and across the Dominican Republic. Book your ride online.",
    url: siteUrl + "/",
    siteName: "VIP Tourist Transfer",
    locale: "en_US",
    alternateLocale: ["es_DO", "fr_FR", "de_DE", "it_IT", "pt_PT", "ja_JP"],
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
