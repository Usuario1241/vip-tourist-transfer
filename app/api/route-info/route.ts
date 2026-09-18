import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const origin = body?.origin;
    const destination = body?.destination;

    if (
      typeof origin?.lat !== "number" ||
      typeof origin?.lng !== "number" ||
      typeof destination?.lat !== "number" ||
      typeof destination?.lng !== "number"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Faltan las coordenadas de origen o destino.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_ROUTES_API_KEY;

    if (!apiKey) {
      console.error("GOOGLE_ROUTES_API_KEY no está configurada.");

      return NextResponse.json(
        {
          ok: false,
          error: "La clave de Google Maps no está configurada.",
        },
        { status: 500 }
      );
    }

    const googleResponse = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: origin.lat,
                longitude: origin.lng,
              },
            },
          },

          destination: {
            location: {
              latLng: {
                latitude: destination.lat,
                longitude: destination.lng,
              },
            },
          },

          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
          computeAlternativeRoutes: false,
          languageCode: "es",
          units: "METRIC",
        }),
        cache: "no-store",
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("Google Routes API error:", data);

      return NextResponse.json(
        {
          ok: false,
          error: "Google Routes API devolvió un error.",
          details: data,
        },
        { status: googleResponse.status }
      );
    }

    const route = data?.routes?.[0];

    if (!route) {
      return NextResponse.json(
        {
          ok: false,
          error: "No se encontró una ruta.",
        },
        { status: 404 }
      );
    }

    const distanceMeters = route.distanceMeters ?? 0;
    const distanceKm = distanceMeters / 1000;

    const durationSeconds = Number(
      String(route.duration ?? "0s").replace("s", "")
    );

    const durationMinutes = Math.ceil(durationSeconds / 60);

    return NextResponse.json({
      ok: true,
      distanceMeters,
      distanceKm: Number(distanceKm.toFixed(2)),
      durationSeconds,
      durationMinutes,
      encodedPolyline: route.polyline?.encodedPolyline ?? null,
    });
  } catch (error) {
    console.error("Error en /api/route-info:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error interno calculando la ruta.",
      },
      { status: 500 }
    );
  }
}