import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "reservaviptouristtransfers@gmail.com";

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Faltan variables públicas de Supabase.");
    return null;
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(accessToken);

  if (error || !user?.email) {
    console.error("Error validando administrador:", error);
    return null;
  }

  if (user.email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null;
  }

  return user;
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Faltan variables privadas de Supabase.");
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ============================================================
// CARGAR OPINIONES PENDIENTES
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "No autorizado." },
        { status: 403 }
      );
    }

    const adminClient = getAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        { ok: false, message: "Error de configuración del servidor." },
        { status: 500 }
      );
    }

    const { data, error } = await adminClient
      .from("reviews")
      .select("id, name, rating, comment, created_at")
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando opiniones pendientes:", error);

      return NextResponse.json(
        { ok: false, message: "No se pudieron cargar las opiniones." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      reviews: data ?? [],
    });
  } catch (error) {
    console.error("Error en GET /api/admin/reviews:", error);

    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// ============================================================
// APROBAR O ELIMINAR UNA OPINIÓN
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "No autorizado." },
        { status: 403 }
      );
    }

    const adminClient = getAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        { ok: false, message: "Error de configuración del servidor." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const reviewId = Number(body?.id);
    const action = body?.action;

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return NextResponse.json(
        { ok: false, message: "Opinión inválida." },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const { error } = await adminClient
        .from("reviews")
        .update({ approved: true })
        .eq("id", reviewId);

      if (error) {
        console.error("Error aprobando opinión:", error);

        return NextResponse.json(
          { ok: false, message: "No se pudo aprobar la opinión." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "Opinión aprobada correctamente.",
      });
    }

    if (action === "delete") {
      const { error } = await adminClient
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) {
        console.error("Error eliminando opinión:", error);

        return NextResponse.json(
          { ok: false, message: "No se pudo eliminar la opinión." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "Opinión eliminada correctamente.",
      });
    }

    return NextResponse.json(
      { ok: false, message: "Acción inválida." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en PATCH /api/admin/reviews:", error);

    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}