"use client";

import { useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";

export default function PayPalPayment({
  amount,
  onSuccess,
}: {
  amount: string;
  onSuccess?: (data: {
    reservationCode: string;
    transactionId: string;
    amount: string;
  }) => void;
}) {
  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  const [paymentDetails, setPaymentDetails] = useState<{
    id: string;
    amount: string;
  } | null>(null);

  const [reservationCode, setReservationCode] =
    useState("");

  const [paypalError, setPaypalError] =
    useState("");

  if (!clientId) {
    return (
      <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-center">
        <p className="font-black text-red-700">
          ⚠️ PayPal no está configurado
        </p>

        <p className="mt-1 text-sm text-red-600">
          Falta NEXT_PUBLIC_PAYPAL_CLIENT_ID en .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalScriptProvider
        options={{
          clientId: clientId,
          currency: "USD",
          intent: "capture",
        }}
      >
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="mb-4 text-center text-sm font-bold text-zinc-600">
            Pago seguro con PayPal
          </p>

          <PayPalButtons
            style={{
              layout: "vertical",
              shape: "rect",
              label: "paypal",
            }}
            forceReRender={[amount]}
            createOrder={(data, actions) => {
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: "USD",
                      value: Number(amount).toFixed(2),
                    },
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              if (!actions.order) return;

              const details =
                await actions.order.capture();

              const code = `VIP-${Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()}`;

              setReservationCode(code);

              const transactionId =
                details.id ?? "Sin ID";

              const paidAmount =
                Number(amount).toFixed(2);

              setPaymentDetails({
                id: transactionId,
                amount: paidAmount,
              });

              onSuccess?.({
                reservationCode: code,
                transactionId,
                amount: paidAmount,
              });
            }}
            onError={(err) => {
              console.error("Error de PayPal:", err);

              setPaypalError(
                "PayPal no pudo cargar correctamente. Revisa la configuración."
              );
            }}
          />

          {paypalError && (
            <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-center text-sm font-bold text-red-700">
              ⚠️ {paypalError}
            </div>
          )}
        </div>

        {paymentDetails && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
            <div className="mb-2 text-3xl">
              ✅
            </div>

            <h3 className="text-xl font-black text-green-700">
              Reserva confirmada
            </h3>

            <p className="mt-2 text-sm">
              Número de reserva:{" "}
              <strong>{reservationCode}</strong>
            </p>

            <p className="mt-2 text-sm text-zinc-600">
              El pago fue aprobado correctamente.
            </p>

            <div className="mt-4 rounded-xl bg-white p-4 text-left text-sm">
              <p>
                <strong>Monto:</strong>{" "}
                US${paymentDetails.amount}
              </p>

              <p className="mt-2 break-all">
                <strong>
                  ID de transacción:
                </strong>{" "}
                {paymentDetails.id}
              </p>
            </div>
          </div>
        )}
      </PayPalScriptProvider>
    </div>
  );
}