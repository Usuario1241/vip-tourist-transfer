import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code = String(body.code || "").trim().toUpperCase();
    const email = String(body.email || "").trim().toLowerCase();
    const reason = String(body.reason || "").trim();

    if (!code || !email || !reason) {
      return NextResponse.json(
        {
          ok: false,
          message: "Completa el código, correo y motivo de cancelación.",
        },
        { status: 400 }
      );
    }

    if (reason.length < 3 || reason.length > 500) {
      return NextResponse.json(
        {
          ok: false,
          message: "El motivo debe tener entre 3 y 500 caracteres.",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Faltan variables privadas de Supabase.");

      return NextResponse.json(
        {
          ok: false,
          message: "El sistema de cancelaciones no está configurado.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: reservation, error: findError } = await supabaseAdmin
      .from("reservas")
      .select(
        "reservation_code, customer_email, status, payment_method"
      )
      .eq("reservation_code", code)
      .ilike("customer_email", email)
      .maybeSingle();

    if (findError) {
      console.error("Error buscando reserva:", findError);

      return NextResponse.json(
        {
          ok: false,
          message: "No se pudo verificar la reserva.",
        },
        { status: 500 }
      );
    }

    if (!reservation) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No encontramos una reserva con ese código y correo electrónico.",
        },
        { status: 404 }
      );
    }

    if (reservation.status === "cancelled") {
      return NextResponse.json(
        {
          ok: false,
          message: "Esta reserva ya está cancelada.",
        },
        { status: 409 }
      );
    }

    const refundStatus =
      reservation.payment_method === "card"
        ? "pending"
        : "not_applicable";

    const { error: updateError } = await supabaseAdmin
      .from("reservas")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        refund_status: refundStatus,
      })
      .eq("reservation_code", code)
      .ilike("customer_email", email);

    if (updateError) {
      console.error("Error cancelando reserva:", updateError);

      return NextResponse.json(
        {
          ok: false,
          message: "No se pudo cancelar la reserva.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        reservation.payment_method === "card"
          ? "Reserva cancelada correctamente. El reembolso queda pendiente de revisión."
          : "Reserva cancelada correctamente.",
      paymentMethod: reservation.payment_method,
    });
  } catch (error) {
    console.error("Error en cancel-reservation:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Ocurrió un error procesando la cancelación.",
      },
      { status: 500 }
    );
  }
}