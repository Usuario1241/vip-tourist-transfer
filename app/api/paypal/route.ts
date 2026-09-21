import { NextResponse } from "next/server";

const PAYPAL_API = "https://api-m.paypal.com";

async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Faltan las credenciales de PayPal");
  }

  const auth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(
    `${PAYPAL_API}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "No se pudo autenticar con PayPal"
    );
  }

  const data = await response.json();

  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amount = Number(body.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      );
    }

    const accessToken =
      await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": crypto.randomUUID(),
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount.toFixed(2),
              },
            },
          ],
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Error creando orden PayPal:",
        data
      );

      return NextResponse.json(
        {
          error:
            "No se pudo crear la orden de PayPal",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      orderId: data.id,
    });
  } catch (error) {
    console.error(
      "Error API PayPal:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error interno procesando PayPal",
      },
      { status: 500 }
    );
  }
}