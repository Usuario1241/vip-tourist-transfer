import { NextResponse } from "next/server";

import { Resend } from "resend";






type Language = "es" | "en" | "fr" | "de" | "it" | "pt" | "ja";



const translations = {

  es: {

    subject: "Reserva confirmada",

    confirmation: "Confirmación de reserva",

    title: "¡Tu reserva está confirmada!",

    hello: "Hola",

    received: "Hemos recibido correctamente tu reserva.",

    bookingCode: "CÓDIGO DE RESERVA",

    pickup: "Recogida",

    destination: "Destino",

    passengers: "Pasajeros",

    largeLuggage: "Maletas grandes",

    carryOn: "Equipaje de mano",

    date: "Fecha",

    time: "Hora",

    tripType: "Tipo de viaje",

    oneWay: "Solo ida",

    roundTrip: "Ida y vuelta",

    returnDate: "Fecha de regreso",

    returnTime: "Hora de regreso",

    phone: "Teléfono",

    flight: "Número de vuelo",

    vehicle: "Vehículo",

    payment: "Forma de pago",

    card: "Pago en línea",

    cash: "Efectivo al conductor",

    unspecified: "No especificado",

    total: "TOTAL",

    footer:

      "Guarda este correo y tu código de reserva. Gracias por elegir VIP Tourist Transfer.",

  },



  en: {

    subject: "Booking confirmed",

    confirmation: "Booking confirmation",

    title: "Your booking is confirmed!",

    hello: "Hello",

    received: "We have successfully received your booking.",

    bookingCode: "BOOKING CODE",

    pickup: "Pickup",

    destination: "Destination",

    passengers: "Passengers",

    largeLuggage: "Large luggage",

    carryOn: "Carry-on luggage",

    date: "Date",

    time: "Time",

    tripType: "Trip type",

    oneWay: "One way",

    roundTrip: "Round trip",

    returnDate: "Return date",

    returnTime: "Return time",

    phone: "Phone",

    flight: "Flight number",

    vehicle: "Vehicle",

    payment: "Payment method",

    card: "Online payment",

    cash: "Cash to driver",

    unspecified: "Not specified",

    total: "TOTAL",

    footer:

      "Keep this email and your booking code. Thank you for choosing VIP Tourist Transfer.",

  },



  fr: {

    subject: "Réservation confirmée",

    confirmation: "Confirmation de réservation",

    title: "Votre réservation est confirmée !",

    hello: "Bonjour",

    received: "Nous avons bien reçu votre réservation.",

    bookingCode: "CODE DE RÉSERVATION",

    pickup: "Lieu de prise en charge",

    destination: "Destination",

    passengers: "Passagers",

    largeLuggage: "Grandes valises",

    carryOn: "Bagages à main",

    date: "Date",

    time: "Heure",

    tripType: "Type de trajet",

    oneWay: "Aller simple",

    roundTrip: "Aller-retour",

    returnDate: "Date de retour",

    returnTime: "Heure de retour",

    phone: "Téléphone",

    flight: "Numéro de vol",

    vehicle: "Véhicule",

    payment: "Mode de paiement",

    card: "Paiement en ligne",

    cash: "Espèces au chauffeur",

    unspecified: "Non spécifié",

    total: "TOTAL",

    footer:

      "Conservez cet e-mail et votre code de réservation. Merci d'avoir choisi VIP Tourist Transfer.",

  },



  de: {

    subject: "Buchung bestätigt",

    confirmation: "Buchungsbestätigung",

    title: "Ihre Buchung ist bestätigt!",

    hello: "Hallo",

    received: "Wir haben Ihre Buchung erfolgreich erhalten.",

    bookingCode: "BUCHUNGSCODE",

    pickup: "Abholung",

    destination: "Ziel",

    passengers: "Passagiere",

    largeLuggage: "Große Gepäckstücke",

    carryOn: "Handgepäck",

    date: "Datum",

    time: "Uhrzeit",

    tripType: "Fahrtart",

    oneWay: "Einfache Fahrt",

    roundTrip: "Hin- und Rückfahrt",

    returnDate: "Rückreisedatum",

    returnTime: "Rückreisezeit",

    phone: "Telefon",

    flight: "Flugnummer",

    vehicle: "Fahrzeug",

    payment: "Zahlungsmethode",

    card: "Online-Zahlung",

    cash: "Barzahlung beim Fahrer",

    unspecified: "Nicht angegeben",

    total: "GESAMT",

    footer:

      "Bewahren Sie diese E-Mail und Ihren Buchungscode auf. Vielen Dank, dass Sie VIP Tourist Transfer gewählt haben.",

  },



  it: {

    subject: "Prenotazione confermata",

    confirmation: "Conferma della prenotazione",

    title: "La tua prenotazione è confermata!",

    hello: "Ciao",

    received: "Abbiamo ricevuto correttamente la tua prenotazione.",

    bookingCode: "CODICE DI PRENOTAZIONE",

    pickup: "Luogo di ritiro",

    destination: "Destinazione",

    passengers: "Passeggeri",

    largeLuggage: "Bagagli grandi",

    carryOn: "Bagaglio a mano",

    date: "Data",

    time: "Ora",

    tripType: "Tipo di viaggio",

    oneWay: "Solo andata",

    roundTrip: "Andata e ritorno",

    returnDate: "Data di ritorno",

    returnTime: "Ora di ritorno",

    phone: "Telefono",

    flight: "Numero del volo",

    vehicle: "Veicolo",

    payment: "Metodo di pagamento",

    card: "Pagamento online",

    cash: "Contanti all'autista",

    unspecified: "Non specificato",

    total: "TOTALE",

    footer:

      "Conserva questa e-mail e il codice di prenotazione. Grazie per aver scelto VIP Tourist Transfer.",

  },



  pt: {

    subject: "Reserva confirmada",

    confirmation: "Confirmação da reserva",

    title: "Sua reserva está confirmada!",

    hello: "Olá",

    received: "Recebemos sua reserva com sucesso.",

    bookingCode: "CÓDIGO DA RESERVA",

    pickup: "Local de embarque",

    destination: "Destino",

    passengers: "Passageiros",

    largeLuggage: "Bagagens grandes",

    carryOn: "Bagagem de mão",

    date: "Data",

    time: "Hora",

    tripType: "Tipo de viagem",

    oneWay: "Somente ida",

    roundTrip: "Ida e volta",

    returnDate: "Data de retorno",

    returnTime: "Hora de retorno",

    phone: "Telefone",

    flight: "Número do voo",

    vehicle: "Veículo",

    payment: "Forma de pagamento",

    card: "Pagamento online",

    cash: "Dinheiro ao motorista",

    unspecified: "Não especificado",

    total: "TOTAL",

    footer:

      "Guarde este e-mail e seu código de reserva. Obrigado por escolher a VIP Tourist Transfer.",

  },



  ja: {

    subject: "予約が確定しました",

    confirmation: "予約確認",

    title: "ご予約が確定しました！",

    hello: "こんにちは",

    received: "ご予約を正常に受け付けました。",

    bookingCode: "予約コード",

    pickup: "お迎え場所",

    destination: "目的地",

    passengers: "乗客数",

    largeLuggage: "大型荷物",

    carryOn: "機内持ち込み手荷物",

    date: "日付",

    time: "時間",

    tripType: "旅行タイプ",

    oneWay: "片道",

    roundTrip: "往復",

    returnDate: "帰りの日付",

    returnTime: "帰りの時間",

    phone: "電話番号",

    flight: "フライト番号",

    vehicle: "車両",

    payment: "支払い方法",

    card: "オンライン決済",

    cash: "ドライバーへの現金払い",

    unspecified: "指定なし",

    total: "合計",

    footer:

      "このメールと予約コードを保存してください。VIP Tourist Transferをご利用いただきありがとうございます。",

  },

} satisfies Record<Language, Record<string, string>>;



function safeLanguage(value: unknown): Language {

  const supported: Language[] = ["es", "en", "fr", "de", "it", "pt", "ja"];



  return supported.includes(value as Language)

    ? (value as Language)

    : "es";

}



function escapeHtml(value: unknown) {

  return String(value ?? "")

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const codeInput = typeof body?.code === "string" ? body.code.trim() : "";
    const emailInput = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^VIP-[A-Za-z0-9-]{4,40}$/.test(codeInput) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      return NextResponse.json({ ok: false, message: "Invalid reservation." }, { status: 400 });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey || !process.env.RESEND_API_KEY) {
      return NextResponse.json({ ok: false, message: "Server not configured." }, { status: 500 });
    }
    const { createClient } = await import("@supabase/supabase-js");
    const db = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: record, error: lookupError } = await db
      .from("reservas")
      .select("reservation_code,customer_name,customer_phone,customer_email,flight_number,pickup,destination,passengers,large_luggage,carry_on_luggage,vehicle,travel_date,travel_time,trip_type,return_date,return_time,amount,payment_method")
      .eq("reservation_code", codeInput)
      .ilike("customer_email", emailInput)
      .maybeSingle();
    if (lookupError || !record) {
      return NextResponse.json({ ok: false, message: "Reservation not found." }, { status: 404 });
    }
    const language = safeLanguage(body.language);
    const t = translations[language];
    const name = escapeHtml(record.customer_name);
    const code = escapeHtml(record.reservation_code);
    const pickup = escapeHtml(record.pickup);
    const destination = escapeHtml(record.destination);
    const passengers = escapeHtml(record.passengers);
    const largeLuggage = escapeHtml(record.large_luggage);
    const carryOnLuggage = escapeHtml(record.carry_on_luggage);
    const date = escapeHtml(record.travel_date);
    const time = escapeHtml(record.travel_time);
    const phone = escapeHtml(record.customer_phone);
    const flightNumber = escapeHtml(record.flight_number || t.unspecified);
    const vehicle = escapeHtml(record.vehicle === "suv" ? "Minivan Premium" : record.vehicle === "sedan" ? "Sedán Ejecutivo" : record.vehicle === "van" ? "Van Ejecutiva" : record.vehicle);
    const total = escapeHtml(Number(record.amount).toFixed(2));
    const tripType = record.trip_type === "roundtrip" ? t.roundTrip : t.oneWay;
    const paymentMethod = record.payment_method === "card" ? t.card : t.cash;
    const returnInformation = record.trip_type === "roundtrip" ? `
      <tr><td><strong>${t.returnDate}:</strong></td><td>${escapeHtml(record.return_date)}</td></tr>
      <tr><td><strong>${t.returnTime}:</strong></td><td>${escapeHtml(record.return_time)}</td></tr>
    ` : "";
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "VIP Tourist Transfer <reservas@viptouristtransfer.com>",
      to: record.customer_email,
      replyTo: "viptouristtransfer@gmail.com",
      subject: `${t.subject} ${code} | VIP Tourist Transfer`,
      html: `

        <!DOCTYPE html>

        <html lang="${language}">

          <body style="

            margin:0;

            padding:0;

            background:#f4f4f5;

            font-family:Arial,Helvetica,sans-serif;

            color:#18181b;

          ">



            <div style="

              max-width:650px;

              margin:0 auto;

              padding:30px 15px;

            ">



              <div style="

                background:#ffffff;

                border-radius:20px;

                overflow:hidden;

                box-shadow:0 8px 30px rgba(0,0,0,.08);

              ">



                <div style="

                  background:#dc2626;

                  color:#ffffff;

                  padding:30px 20px;

                  text-align:center;

                ">

                  <h1 style="

                    margin:0;

                    font-size:26px;

                    font-weight:800;

                  ">

                    VIP TOURIST TRANSFER

                  </h1>



                  <p style="margin:8px 0 0;">

                    ${t.confirmation}

                  </p>

                </div>



                <div style="padding:30px;">



                  <h2 style="margin:0 0 15px;">

                    ${t.title}

                  </h2>



                  <p style="line-height:1.6;">

                    ${t.hello} <strong>${name}</strong>.<br />

                    ${t.received}

                  </p>



                  <div style="

                    background:#f4f4f5;

                    padding:20px;

                    border-radius:14px;

                    margin:25px 0;

                    text-align:center;

                  ">

                    <div style="

                      font-size:12px;

                      color:#71717a;

                      font-weight:bold;

                    ">

                      ${t.bookingCode}

                    </div>



                    <div style="

                      margin-top:6px;

                      font-size:26px;

                      font-weight:800;

                    ">

                      ${code}

                    </div>

                  </div>



                  <table style="

                    width:100%;

                    border-collapse:collapse;

                    font-size:15px;

                    line-height:1.5;

                  ">



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.pickup}:</strong>

                      </td>

                      <td style="padding:8px 0;">${pickup}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.destination}:</strong>

                      </td>

                      <td style="padding:8px 0;">${destination}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.passengers}:</strong>

                      </td>

                      <td style="padding:8px 0;">${passengers}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.largeLuggage}:</strong>

                      </td>

                      <td style="padding:8px 0;">${largeLuggage}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.carryOn}:</strong>

                      </td>

                      <td style="padding:8px 0;">${carryOnLuggage}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.date}:</strong>

                      </td>

                      <td style="padding:8px 0;">${date}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.time}:</strong>

                      </td>

                      <td style="padding:8px 0;">${time}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.tripType}:</strong>

                      </td>

                      <td style="padding:8px 0;">${tripType}</td>

                    </tr>



                    ${returnInformation}



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.phone}:</strong>

                      </td>

                      <td style="padding:8px 0;">${phone}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.flight}:</strong>

                      </td>

                      <td style="padding:8px 0;">${flightNumber}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.vehicle}:</strong>

                      </td>

                      <td style="padding:8px 0;">${vehicle}</td>

                    </tr>



                    <tr>

                      <td style="padding:8px 10px 8px 0;">

                        <strong>${t.payment}:</strong>

                      </td>

                      <td style="padding:8px 0;">${paymentMethod}</td>

                    </tr>



                  </table>



                  <div style="

                    margin-top:25px;

                    padding:22px;

                    background:#18181b;

                    color:#ffffff;

                    border-radius:14px;

                    text-align:center;

                  ">



                    <div style="

                      font-size:13px;

                      font-weight:bold;

                    ">

                      ${t.total}

                    </div>



                    <div style="

                      margin-top:5px;

                      font-size:30px;

                      font-weight:800;

                    ">

                      US$${total}

                    </div>



                  </div>



                  <p style="

                    margin:28px 0 0;

                    color:#52525b;

                    font-size:14px;

                    line-height:1.7;

                  ">

                    ${t.footer}

                  </p>



                </div>

              </div>

            </div>

          </body>

        </html>

      `,
    });
    if (error) {
      console.error("Reservation email error:", error);
      return NextResponse.json({ ok: false, message: "Email could not be sent." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (error) {
    console.error("send-reservation-email error:", error);
    return NextResponse.json({ ok: false, message: "Internal email error." }, { status: 500 });
  }
}
