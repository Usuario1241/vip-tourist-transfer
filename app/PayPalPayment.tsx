"use client";

import { useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";

export default function PayPalPayment({
  amount,
  onSuccess,
  onBeforePayment,
}: {
  amount: string;
  onBeforePayment?: () => boolean;
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

  const [reservationCode, setReservationCode] = useState("");
  const [paypalError, setPaypalError] = useState("");

  if (!clientId) {
    return (
      <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-center">
        <p className="font-black text-red-700">
          ⚠️ PayPal no está configurado
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalScriptProvider
        options={{
          clientId,
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
            createOrder={async () => {
              setPaypalError("");

              if (onBeforePayment && !onBeforePayment()) {
  throw new Error(
    "La fecha o la hora de la reserva ya no está disponible."
  );
}

              const response = await fetch("/api/paypal", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: Number(amount).toFixed(2),
                }),
              });

              const data = await response.json();

              if (!response.ok || !data.orderId) {
                throw new Error(
                  data.error || "No se pudo crear la orden de PayPal"
                );
              }

              return data.orderId;
            }}
            onApprove={async (data, actions) => {
              try {
                if (!actions.order) {
                  throw new Error(
                    "No se pudo acceder a la orden de PayPal"
                  );
                }

                const details = await actions.order.capture();

                const code = `VIP-${Math.random()
                  .toString(36)
                  .substring(2, 8)
                  .toUpperCase()}`;

                const transactionId =
                  details.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
                  details.id ||
                  data.orderID;

                const paidAmount =
                  details.purchase_units?.[0]?.payments?.captures?.[0]
                    ?.amount?.value || Number(amount).toFixed(2);

                setReservationCode(code);

                setPaymentDetails({
                  id: transactionId,
                  amount: paidAmount,
                });

                onSuccess?.({
                  reservationCode: code,
                  transactionId,
                  amount: paidAmount,
                });
              } catch (error) {
                console.error("Error capturando PayPal:", error);

                setPaypalError(
                  "No se pudo confirmar el pago. Inténtalo nuevamente."
                );
              }
            }}
            onError={(err) => {
              console.error("Error de PayPal:", err);

              setPaypalError(
                "PayPal no pudo procesar la operación correctamente."
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
            <div className="mb-2 text-3xl">✅</div>

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
                <strong>Monto:</strong> US${paymentDetails.amount}
              </p>

              <p className="mt-2 break-all">
                <strong>ID de transacción:</strong>{" "}
                {paymentDetails.id}
              </p>
            </div>
          </div>
        )}
      </PayPalScriptProvider>
    </div>
  );
}