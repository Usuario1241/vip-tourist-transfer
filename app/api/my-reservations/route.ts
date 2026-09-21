import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, message: "No autorizado." },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error("Faltan variables de Supabase.");
      return NextResponse.json(
        { ok: false, message: "Error de configuración del servidor." },
        { status: 500 }
      );
    }

    // Verificar quién es realmente el usuario usando su token.
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

    if (userError || !user?.email) {
  console.error("Error validando sesión:", userError);
  console.error("Usuario recibido:", user?.email ?? "sin usuario");

  return NextResponse.json(
    { ok: false, message: "Sesión no válida." },
    { status: 401 }
  );
}

    // Service Role solo se usa DESPUÉS de verificar la identidad.
    // Nunca aceptamos el correo enviado por el navegador.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await adminClient
      .from("reservas")
      .select(
        `
          id,
          created_at,
          reservation_code,
          customer_name,
          customer_email,
          customer_phone,
          flight_number,
          pickup,
          destination,
          passengers,
          large_luggage,
          carry_on_luggage,
          vehicle,
          travel_date,
          travel_time,
          trip_type,
          return_date,
          return_time,
          amount,
          payment_method,
          transaction_id
        `
      )
      .ilike("customer_email", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error consultando reservas:", error);

      return NextResponse.json(
        { ok: false, message: "No se pudieron cargar tus reservas." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      reservations: data ?? [],
    });
  } catch (error) {
    console.error("Error en /api/my-reservations:", error);

    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}