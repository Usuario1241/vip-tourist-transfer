
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedLanguages = [
  "es", "en", "fr", "de", "it", "pt", "ja"
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const comment = body.comment;
    const language = body.language;

    if (
      typeof comment !== "string" ||
      typeof language !== "string" ||
      !allowedLanguages.includes(language) ||
      !comment.trim() ||
      comment.length > 500
    ) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const url = new URL(
      "https://translate.googleapis.com/translate_a/single"
    );

    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "auto");
    url.searchParams.set("tl", language);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", comment);

    const response = await fetch(url.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      console.error(
        "Proveedor de traducción:",
        response.status
      );

      return NextResponse.json({
        translated: comment
      });
    }

    const data = await response.json();

    const translated = Array.isArray(data?.[0])
      ? data[0]
          .map((part: unknown) =>
            Array.isArray(part)
              ? String(part[0] ?? "")
              : ""
          )
          .join("")
      : comment;

    return NextResponse.json({
      translated: translated || comment
    });

  } catch (error) {
    console.error("Error de traducción:", error);

    return NextResponse.json({
      translated: ""
    });
  }
}
