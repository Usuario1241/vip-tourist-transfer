import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "VIP Tourist Transfers | Traslados Privados en República Dominicana",
  description:
    "Traslados privados VIP desde aeropuertos, hoteles y destinos turísticos en República Dominicana. Servicio seguro, puntual y confortable.",
  keywords: [
    "VIP Tourist Transfers",
    "traslados República Dominicana",
    "transporte aeropuerto Santo Domingo",
    "transfer aeropuerto SDQ",
    "transfer Punta Cana",
    "transporte privado República Dominicana",
  ],
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
      </body>
    </html>
  );
}