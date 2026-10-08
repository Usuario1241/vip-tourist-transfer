import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Home, { type Language } from "../HomeClient";

const languages = ["es", "en", "fr", "de", "it", "pt", "ja"] as const;
const descriptions: Record<Language, { title: string; description: string }> = {
  es: { title: "Traslados privados en República Dominicana | VIP Tourist Transfer", description: "Reserva transporte privado desde los aeropuertos de Punta Cana, Santo Domingo y La Romana en República Dominicana." },
  en: { title: "Dominican Republic Airport Transfers | VIP Tourist Transfer", description: "Book private airport transfers in Punta Cana, Santo Domingo and La Romana, Dominican Republic." },
  fr: { title: "Transferts aéroport en République dominicaine | VIP Tourist Transfer", description: "Réservez votre transfert privé depuis les aéroports de Punta Cana, Saint-Domingue et La Romana." },
  de: { title: "Flughafentransfer Dominikanische Republik | VIP Tourist Transfer", description: "Buchen Sie private Flughafentransfers in Punta Cana, Santo Domingo und La Romana." },
  it: { title: "Transfer aeroportuali Repubblica Dominicana | VIP Tourist Transfer", description: "Prenota trasferimenti privati dagli aeroporti di Punta Cana, Santo Domingo e La Romana." },
  pt: { title: "Transfer aeroporto República Dominicana | VIP Tourist Transfer", description: "Reserve transporte privado dos aeroportos de Punta Cana, Santo Domingo e La Romana." },
  ja: { title: "ドミニカ共和国 空港送迎 | VIP Tourist Transfer", description: "プンタカナ、サントドミンゴ、ラロマーナの空港からのプライベート送迎を予約。" },
};

type Props = { params: Promise<{ lang: string }> };
export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!languages.includes(lang as Language)) return {};
  const content = descriptions[lang as Language];
  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(languages.map((code) => [code, `/${code}`])),
    },
  };
}

export default async function LocalizedPage({ params }: Props) {
  const { lang } = await params;
  if (!languages.includes(lang as Language)) notFound();
  return <Home initialLanguage={lang as Language} />;
}
