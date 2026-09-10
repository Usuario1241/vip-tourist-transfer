"use client";

import { useEffect, useRef, useState } from "react";

type PlaceResult = {
  label: string;
  placeId?: string;
  lat?: number;
  lng?: number;
};

type Props = {
  value: string;
  onSelect: (place: PlaceResult) => void;
  onClear?: () => void;
  placeholder?: string;
};

declare global {
  interface Window {
    google: any;
  }
}

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps?.importLibrary) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = "__vipGoogleMapsReady";

    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      resolve();
    };

    const existingScript = document.querySelector(
      'script[data-vip-google-maps="true"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");

    script.src =
      "https://maps.googleapis.com/maps/api/js" +
      `?key=${encodeURIComponent(apiKey)}` +
      "&v=weekly" +
      "&libraries=places" +
      "&loading=async" +
      `&callback=${callbackName}`;

    script.async = true;
    script.defer = true;
    script.dataset.vipGoogleMaps = "true";

    script.onerror = () => {
      googleMapsPromise = null;
      delete (window as any)[callbackName];

      reject(
        new Error("No se pudo cargar Google Maps JavaScript API")
      );
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export default function LocationAutocomplete({
  value,
  onSelect,
  onClear,
  placeholder = "Buscar aeropuerto, hotel, ciudad o lugar...",
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<any>(null);
  const autocompleteSuggestionRef = useRef<any>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // CERRAR RESULTADOS AL HACER CLIC FUERA
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const apiKey =
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.error(
          "Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local"
        );
        return;
      }

      try {
        await loadGoogleMaps(apiKey);

        const placesLibrary =
          await window.google.maps.importLibrary("places");

        if (cancelled) return;

        autocompleteSuggestionRef.current =
          placesLibrary.AutocompleteSuggestion;

        sessionTokenRef.current =
          new placesLibrary.AutocompleteSessionToken();

        setReady(true);
      } catch (error) {
        console.error(
          "Error inicializando Google Places:",
          error
        );
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  const searchPlaces = async (text: string) => {
    setInputValue(text);

    if (!text.trim()) {
      setSuggestions([]);
      onClear?.();
      return;
    }

    if (
      !ready ||
      !autocompleteSuggestionRef.current
    ) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await autocompleteSuggestionRef.current
          .fetchAutocompleteSuggestions({
            input: text,
            includedRegionCodes: ["do"],
            language: "es",
            region: "do",
            sessionToken: sessionTokenRef.current,
          });

      const results =
        response.suggestions?.filter(
          (item: any) => item.placePrediction
        ) ?? [];

      setSuggestions(results);
    } catch (error) {
      console.error(
        "Error buscando ubicaciones:",
        error
      );

      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const selectPlace = async (suggestion: any) => {
    try {
      const prediction =
        suggestion.placePrediction;

      if (!prediction) return;

      const place = prediction.toPlace();

      await place.fetchFields({
        fields: [
          "id",
          "displayName",
          "formattedAddress",
          "location",
        ],
      });

      const label =
  prediction.text?.toString() ||
  place.formattedAddress ||
  place.displayName ||
  "";

      setInputValue(label);
      setSuggestions([]);

      onSelect({
        label,
        placeId: place.id,
        lat: place.location?.lat(),
        lng: place.location?.lng(),
      });

      const placesLibrary =
        await window.google.maps.importLibrary(
          "places"
        );

      sessionTokenRef.current =
        new placesLibrary.AutocompleteSessionToken();
    } catch (error) {
      console.error(
        "Error seleccionando ubicación:",
        error
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) =>
          searchPlaces(e.target.value)
        }
        placeholder={placeholder}

        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}

        data-lpignore="true"
        data-form-type="other"

        name={`location-${placeholder}`}
        aria-autocomplete="list"

        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
      />

      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          ...
        </span>
      )}

      {inputValue && !loading && (
        <button
          type="button"
          onClick={() => {
            setInputValue("");
            setSuggestions([]);
            onClear?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 hover:text-gray-700"
          aria-label="Limpiar ubicación"
        >
          ×
        </button>
      )}

      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl">
          {suggestions.map(
            (suggestion: any, index: number) => {
              const prediction =
                suggestion.placePrediction;

              return (
                <button
                  key={
                    prediction?.placeId ??
                    index
                  }
                  type="button"
                  onClick={() =>
                    selectPlace(suggestion)
                  }
                  className="block w-full border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-900 transition last:border-b-0 hover:bg-gray-50"
                >
                  {prediction?.text?.toString()}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}