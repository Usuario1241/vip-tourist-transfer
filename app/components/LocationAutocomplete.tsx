"use client";

import { useEffect, useRef, useState } from "react";

export type LocationResult = {
  label: string;
  latitude: number;
  longitude: number;
  type: string;
};

type GeoapifyResult = {
  place_id?: string;
  formatted?: string;
  name?: string;
  address_line1?: string;
  address_line2?: string;
  lat: number;
  lon: number;
  result_type?: string;
};

type LocationAutocompleteProps = {
  value: string;
  placeholder: string;
  onSelect: (place: LocationResult) => void;
  onClear: () => void;
};

type DefaultPlace = [
  name: string,
  area: string,
  latitude: number,
  longitude: number,
  type: string
];

const dominicanLocations: DefaultPlace[] = [
  [
    "Aeropuerto Internacional Las Américas (SDQ)",
    "Santo Domingo",
    18.4297,
    -69.6689,
    "airport",
  ],
  [
    "Aeropuerto Internacional de Punta Cana (PUJ)",
    "Punta Cana",
    18.5674,
    -68.3634,
    "airport",
  ],
  [
    "Aeropuerto Internacional del Cibao (STI)",
    "Santiago",
    19.4061,
    -70.6047,
    "airport",
  ],
  [
    "Aeropuerto Internacional Gregorio Luperón (POP)",
    "Puerto Plata",
    19.7579,
    -70.5700,
    "airport",
  ],
  [
    "Aeropuerto Internacional de La Romana (LRM)",
    "La Romana",
    18.4507,
    -68.9118,
    "airport",
  ],
  [
    "Aeropuerto Internacional El Catey (AZS)",
    "Samaná",
    19.2670,
    -69.7420,
    "airport",
  ],
  [
    "Aeropuerto Internacional La Isabela (JBQ)",
    "Santo Domingo",
    18.5725,
    -69.9856,
    "airport",
  ],

  ["Santo Domingo", "Distrito Nacional", 18.4861, -69.9312, "city"],
  ["Santo Domingo Este", "Santo Domingo", 18.4885, -69.8571, "city"],
  ["Santo Domingo Norte", "Santo Domingo", 18.5667, -69.9000, "city"],
  ["Santo Domingo Oeste", "Santo Domingo", 18.5000, -70.0000, "city"],
  ["Santiago", "Santiago", 19.4517, -70.6970, "city"],
  ["Puerto Plata", "Puerto Plata", 19.7934, -70.6884, "city"],
  ["La Romana", "La Romana", 18.4273, -68.9728, "city"],
  ["Higüey", "La Altagracia", 18.6150, -68.7070, "city"],
  ["San Pedro de Macorís", "San Pedro de Macorís", 18.4539, -69.3086, "city"],
  ["San Cristóbal", "San Cristóbal", 18.4167, -70.1000, "city"],
  ["Baní", "Peravia", 18.2796, -70.3319, "city"],
  ["Azua", "Azua", 18.4532, -70.7349, "city"],
  ["Barahona", "Barahona", 18.2085, -71.1008, "city"],
  ["Pedernales", "Pedernales", 18.0384, -71.7440, "city"],
  ["San Juan de la Maguana", "San Juan", 18.8059, -71.2299, "city"],
  ["Jimaní", "Independencia", 18.4917, -71.8500, "city"],
  ["Neiba", "Bahoruco", 18.4814, -71.4197, "city"],
  ["Comendador", "Elías Piña", 18.8763, -71.7028, "city"],
  ["Dajabón", "Dajabón", 19.5488, -71.7083, "city"],
  ["Monte Cristi", "Monte Cristi", 19.8483, -71.6459, "city"],
  ["Sabaneta", "Santiago Rodríguez", 19.4779, -71.3413, "city"],
  ["Mao", "Valverde", 19.5519, -71.0781, "city"],
  ["Moca", "Espaillat", 19.3935, -70.5259, "city"],
  ["Salcedo", "Hermanas Mirabal", 19.3776, -70.4176, "city"],
  ["San Francisco de Macorís", "Duarte", 19.3008, -70.2526, "city"],
  ["Cotuí", "Sánchez Ramírez", 19.0527, -70.1494, "city"],
  ["Nagua", "María Trinidad Sánchez", 19.3768, -69.8474, "city"],
  ["Samaná", "Samaná", 19.2056, -69.3369, "city"],
  ["Hato Mayor", "Hato Mayor", 18.7628, -69.2568, "city"],
  ["El Seibo", "El Seibo", 18.7656, -69.0389, "city"],
  ["Monte Plata", "Monte Plata", 18.8070, -69.7839, "city"],
  ["Bonao", "Monseñor Nouel", 18.9369, -70.4092, "city"],
  ["La Vega", "La Vega", 19.2221, -70.5296, "city"],

  ["Punta Cana", "La Altagracia", 18.5601, -68.3725, "tourism"],
  ["Bávaro", "Punta Cana", 18.6813, -68.4269, "tourism"],
  ["Cap Cana", "Punta Cana", 18.5005, -68.3935, "tourism"],
  ["Uvero Alto", "Punta Cana", 18.8027, -68.5855, "tourism"],
  ["Bayahíbe", "La Romana", 18.3690, -68.8387, "tourism"],
  ["Casa de Campo", "La Romana", 18.4167, -68.9167, "tourism"],
  ["Juan Dolio", "San Pedro de Macorís", 18.4273, -69.4167, "tourism"],
  ["Boca Chica", "Santo Domingo", 18.4539, -69.6064, "tourism"],
  ["Las Terrenas", "Samaná", 19.3110, -69.5428, "tourism"],
  ["Las Galeras", "Samaná", 19.2934, -69.2024, "tourism"],
  ["Sosúa", "Puerto Plata", 19.7522, -70.5199, "tourism"],
  ["Cabarete", "Puerto Plata", 19.7498, -70.4083, "tourism"],
  ["Jarabacoa", "La Vega", 19.1218, -70.6420, "tourism"],
  ["Constanza", "La Vega", 18.9092, -70.7440, "tourism"],
];

const popularPlaces: GeoapifyResult[] = dominicanLocations.map(
  ([name, area, latitude, longitude, type], index) => ({
    place_id: `dominican-location-${index}`,
    name,
    formatted: `${name}, ${area}, República Dominicana`,
    address_line2: `${area}, República Dominicana`,
    lat: latitude,
    lon: longitude,
    result_type: type,
  })
);

export default function LocationAutocomplete({
  value,
  placeholder,
  onSelect,
  onClear,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeoapifyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(Boolean(value));
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizedQuery = normalizeText(query);

const localResults =
  normalizedQuery.length < 1
    ? popularPlaces
    : popularPlaces.filter((place) =>
        normalizeText(
          `${place.name ?? ""} ${place.address_line2 ?? ""}`
        ).includes(normalizedQuery)
      );

const apiResults = results.filter(
  (apiPlace) =>
    !localResults.some(
      (localPlace) =>
        normalizeText(localPlace.formatted ?? "") ===
        normalizeText(apiPlace.formatted ?? "")
    )
);

const visibleResults =
  normalizedQuery.length < 1
    ? popularPlaces
    : [...localResults, ...apiResults].slice(0, 15);

  useEffect(() => {
    setQuery(value);

    if (!value) {
      setSelected(false);
      setResults([]);
    }
  }, [value]);

  useEffect(() => {
    function closeDropdown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeDropdown);

    return () => {
      document.removeEventListener("mousedown", closeDropdown);
    };
  }, []);

  useEffect(() => {
  const searchText = query.trim();

  if (selected || searchText.length < 1) {
    setResults([]);
    setLoading(false);
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  if (!apiKey) {
    console.error("Falta NEXT_PUBLIC_GEOAPIFY_API_KEY en .env.local");
    return;
  }

  const controller = new AbortController();

  const timer = window.setTimeout(async () => {
    try {
      setLoading(true);

      const encodedText = encodeURIComponent(searchText);

      const addressUrl =
        "https://api.geoapify.com/v1/geocode/autocomplete" +
        `?text=${encodedText}` +
        "&format=json" +
        "&filter=countrycode:do" +
        "&lang=es" +
        "&limit=10" +
        `&apiKey=${apiKey}`;

      const placesUrl =
        "https://api.geoapify.com/v2/places" +
        "?categories=accommodation,tourism,commercial,catering,entertainment" +
        "&filter=rect:-72.1,17.4,-68.2,20.1" +
        `&name=${encodedText}` +
        "&lang=es" +
        "&limit=12" +
        `&apiKey=${apiKey}`;

      const [addressResponse, placesResponse] =
        await Promise.all([
          fetch(addressUrl, {
            signal: controller.signal,
          }),
          fetch(placesUrl, {
            signal: controller.signal,
          }),
        ]);

      const addressData = addressResponse.ok
        ? await addressResponse.json()
        : { results: [] };

      const placesData = placesResponse.ok
        ? await placesResponse.json()
        : { features: [] };

      const addressResults: GeoapifyResult[] =
        addressData.results ?? [];

      const placeResults: GeoapifyResult[] = (
        placesData.features ?? []
      ).map(
        (feature: { properties: GeoapifyResult }) =>
          feature.properties
      );

      const uniqueResults = new Map<
        string,
        GeoapifyResult
      >();

      [...placeResults, ...addressResults].forEach(
        (place) => {
          if (
            typeof place.lat !== "number" ||
            typeof place.lon !== "number"
          ) {
            return;
          }

          const key =
            place.place_id ||
            place.formatted ||
            `${place.lat}-${place.lon}`;

          if (!uniqueResults.has(key)) {
            uniqueResults.set(key, place);
          }
        }
      );

      setResults(Array.from(uniqueResults.values()));
      setOpen(true);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error buscando lugares:", error);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, 350);

  return () => {
    window.clearTimeout(timer);
    controller.abort();
  };
}, [query, selected]);

  function handleTyping(text: string) {
    setQuery(text);
    setSelected(false);
    setOpen(true);
    onClear();
  }

  function choosePlace(place: GeoapifyResult) {
    const label =
      place.formatted ||
      [place.address_line1, place.address_line2]
        .filter(Boolean)
        .join(", ") ||
      place.name ||
      "";

    setQuery(label);
    setSelected(true);
    setOpen(false);
    setResults([]);

    onSelect({
      label,
      latitude: place.lat,
      longitude: place.lon,
      type: place.result_type || "place",
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"
          />
          <circle cx="12" cy="10" r="2.2" />
        </svg>

        <input
  type="text"
  name="vip-location-search"
  value={query}
  onChange={(event) => handleTyping(event.target.value)}
  onFocus={() => setOpen(true)}
  placeholder={placeholder}
  autoComplete="one-time-code"
  role="combobox"
  aria-autocomplete="list"
  aria-expanded={open && !selected}
  data-form-type="other"
  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-11 outline-none transition focus:border-red-500 focus:bg-white"
/>

        {loading && (
          <div className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin rounded-full border-2 border-zinc-300 border-t-red-600" />
        )}
      </div>

      {open && !selected && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl">
          {query.trim().length < 1 && (
            <p className="px-3 pb-2 pt-1 text-xs font-black uppercase tracking-wider text-zinc-500">
              Destinos en República Dominicana
            </p>
          )}

          {!loading &&
            query.trim().length >= 1 &&
            visibleResults.length === 0 && (
              <p className="px-4 py-4 text-sm text-zinc-500">
                No encontramos lugares. Intenta escribir otro nombre.
              </p>
            )}

          {visibleResults.map((place, index) => (
            <button
              key={
                place.place_id ||
                `${place.lat}-${place.lon}-${index}`
              }
              type="button"
              onClick={() => choosePlace(place)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-zinc-100"
            >
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"
                  />
                  <circle cx="12" cy="10" r="2.2" />
                </svg>
              </span>

              <span className="min-w-0">
                <span className="block font-bold text-zinc-900">
                  {place.name ||
                    place.address_line1 ||
                    place.formatted}
                </span>

                <span className="mt-1 block text-sm text-zinc-500">
                  {place.address_line2 ||
                    place.formatted ||
                    "República Dominicana"}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}