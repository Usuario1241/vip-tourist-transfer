"use client";
import { useEffect, useState } from "react";

import PayPalPayment from "./PayPalPayment";
import { supabase } from "./lib/supabase";


export default function Home() {
const [pickup, setPickup] = useState("");
const [destination, setDestination] = useState("");
const [passengers, setPassengers] = useState("");
const [showVehicles, setShowVehicles] = useState(false);
const [selectedVehicle, setSelectedVehicle] = useState("");
const [travelTime, setTravelTime] = useState("");
const [travelDate, setTravelDate] = useState("");
const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [customerEmail, setCustomerEmail] = useState("");
const [paymentMethod, setPaymentMethod] =
  useState<"card" | "cash" | "">("");

 const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
const [authName, setAuthName] = useState("");
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [authMessage, setAuthMessage] = useState("");
const [authLoading, setAuthLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

useEffect(() => {
  const loadUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setCurrentUserEmail(session?.user?.email ?? null);
  };

  loadUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setCurrentUserEmail(session?.user?.email ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

const handleLogout = async () => {
  await supabase.auth.signOut();
  setCurrentUserEmail(null);
};

const handleAuth = async () => {
  setAuthMessage("");

  if (!authEmail.trim() || !authPassword.trim()) {
    setAuthMessage("Completa tu correo y contraseña.");
    return;
  }

  if (authPassword.length < 6) {
    setAuthMessage("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  setAuthLoading(true);

  try {
    if (authMode === "register") {
      if (!authName.trim()) {
        setAuthMessage("Escribe tu nombre completo.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
        options: {
          data: {
            full_name: authName.trim(),
          },
        },
      });

      if (error) {
        setAuthMessage(error.message);
        return;
      }

      setAuthMessage(
        "¡Cuenta creada! Revisa tu correo electrónico para confirmar tu cuenta."
      );
    }

    if (authMode === "login") {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail.trim(),
    password: authPassword,
  });

  if (error) {
    setAuthMessage("Correo o contraseña incorrectos.");
    return;
  }

  setCurrentUserEmail(data.user?.email ?? null);
  setAuthMessage("¡Sesión iniciada correctamente!");

  setTimeout(() => {
    setAuthMode(null);
    setAuthPassword("");
  }, 600);
}
  } catch (error) {
    console.error(error);
    setAuthMessage("Ocurrió un error. Inténtalo nuevamente.");
  } finally {
    setAuthLoading(false);
  }
};

const [confirmedReservation, setConfirmedReservation] = useState<{
  code: string;
  name: string;
  pickup: string;
  destination: string;
  vehicle: string;
  total: string;
  paymentMethod: "card" | "cash";
} | null>(null);

useEffect(() => {
  // Cuando se abre o recarga la página, empezar arriba.
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  // Quitar #reservar de la dirección si quedó guardado.
  if (window.location.hash) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }

  window.scrollTo(0, 0);
}, []);

useEffect(() => {
  // Cuando una reserva se confirma,
  // colocar la tarjeta de confirmación correctamente en pantalla.
  if (confirmedReservation) {
    setTimeout(() => {
      document.getElementById("reservar")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }
}, [confirmedReservation]);

const [language, setLanguage] = useState<"es" | "en">("es");
const t = {
  es: {
    pickup: "Punto de recogida",
    destination: "Destino",
    search: "Buscar traslado",
  },
  en: {
    pickup: "Pickup location",
    destination: "Destination",
    search: "Search transfer",
  },
};

const text = t[language];

  const routePrices: Record<string, number> = {
    "aeropuerto sdq-punta cana": 90,
"aeropuerto sdq-bavaro": 95,
"aeropuerto sdq-la romana": 85,
"aeropuerto sdq-boca chica": 45,
"aeropuerto sdq-santo domingo": 40,
"punta cana-aeropuerto sdq": 90,
"bavaro-aeropuerto sdq": 95,
"la romana-aeropuerto sdq": 85,
"boca chica-aeropuerto sdq": 45,
"santo domingo-aeropuerto sdq": 40,
  };

  const zonePrices: Record<string, number> = {
  "aeropuerto sdq": 40,
  "aeropuerto puj": 45,
  "distrito nacional": 35,
  "santo domingo": 35,
  "azua": 95,
  "bahoruco": 140,
  "barahona": 135,
  "dajabón": 160,
  "duarte": 105,
  "elías piña": 170,
  "el seibo": 90,
  "espaillat": 115,
  "hato mayor": 85,
  "hermanas mirabal": 115,
  "independencia": 160,
  "la altagracia": 95,
  "la romana": 85,
  "la vega": 110,
  "maría trinidad sánchez": 125,
  "monseñor nouel": 95,
  "monte cristi": 155,
  "monte plata": 70,
  "pedernales": 190,
  "peravia": 75,
  "puerto plata": 145,
  "samaná": 150,
  "san cristóbal": 60,
  "san josé de ocoa": 90,
  "san juan": 135,
  "san pedro de macorís": 70,
  "sánchez ramírez": 105,
  "santiago": 125,
  "santiago rodríguez": 145,
  "valverde": 140,
};

const pickupAdjustments: Record<string, number> = {
  "aeropuerto sdq": 0,
  "aeropuerto puj": 25,
  "distrito nacional": 10,
  "santo domingo": 10,
  "santiago": 35,
  "puerto plata": 45,
  "la romana": 20,
  "la altagracia": 25,
  "samaná": 40,
};

const routeKey = `${pickup}-${destination}`;

let basePrice =
  routePrices[routeKey] ??
  ((zonePrices[destination] ?? 75) +
    (pickupAdjustments[pickup] ?? 0));

const passengerExtra = parseInt(passengers, 10) >= 4 ? 20 : 0;

const vehicleExtra =
  selectedVehicle === "suv"
    ? 25
    : selectedVehicle === "van"
    ? 45
    : 0;

const finalPrice = (
  basePrice +
  passengerExtra +
  vehicleExtra
).toFixed(2);

 const locations = [
  { name: "Aeropuerto SDQ", subtitle: "Aeropuerto Internacional Las Américas" },
  { name: "Aeropuerto PUJ", subtitle: "Aeropuerto Internacional de Punta Cana" },

  { name: "Distrito Nacional", subtitle: "Santo Domingo" },
  { name: "Santo Domingo", subtitle: "Provincia Santo Domingo" },
  { name: "Azua", subtitle: "Azua" },
  { name: "Bahoruco", subtitle: "Bahoruco" },
  { name: "Barahona", subtitle: "Barahona" },
  { name: "Dajabón", subtitle: "Dajabón" },
  { name: "Duarte", subtitle: "San Francisco de Macorís" },
  { name: "Elías Piña", subtitle: "Elías Piña" },
  { name: "El Seibo", subtitle: "El Seibo" },
  { name: "Espaillat", subtitle: "Moca" },
  { name: "Hato Mayor", subtitle: "Hato Mayor" },
  { name: "Hermanas Mirabal", subtitle: "Salcedo" },
  { name: "Independencia", subtitle: "Jimaní" },
  { name: "La Altagracia", subtitle: "Higüey / Punta Cana / Bávaro" },
  { name: "La Romana", subtitle: "La Romana" },
  { name: "La Vega", subtitle: "La Vega / Jarabacoa / Constanza" },
  { name: "María Trinidad Sánchez", subtitle: "Nagua" },
  { name: "Monseñor Nouel", subtitle: "Bonao" },
  { name: "Monte Cristi", subtitle: "Monte Cristi" },
  { name: "Monte Plata", subtitle: "Monte Plata" },
  { name: "Pedernales", subtitle: "Pedernales" },
  { name: "Peravia", subtitle: "Baní" },
  { name: "Puerto Plata", subtitle: "Puerto Plata" },
  { name: "Samaná", subtitle: "Samaná / Las Terrenas" },
  { name: "San Cristóbal", subtitle: "San Cristóbal" },
  { name: "San José de Ocoa", subtitle: "San José de Ocoa" },
  { name: "San Juan", subtitle: "San Juan de la Maguana" },
  { name: "San Pedro de Macorís", subtitle: "San Pedro de Macorís / Juan Dolio" },
  { name: "Sánchez Ramírez", subtitle: "Cotuí" },
  { name: "Santiago", subtitle: "Santiago de los Caballeros" },
  { name: "Santiago Rodríguez", subtitle: "Sabaneta" },
  { name: "Valverde", subtitle: "Mao" },
];
  const destinations = [
  {
    name: "Punta Cana",
    subtitle: "Playas y resorts",
    image: "/images/punta-cana.jpg",
  },
  {
    name: "Santo Domingo",
    subtitle: "Historia y ciudad",
    image: "/images/santo-domingo.jpg",
  },
  {
    name: "La Romana",
    subtitle: "Marina y lujo",
    image: "/images/la-romana.jpg",
  },
  {
    name: "Bayahíbe",
    subtitle: "Caribe y excursiones",
    image: "/images/bayahibe.jpg",
  },
];
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3 lg:px-8">
          <a href="#inicio" className="flex items-center">
            <img
              src="/vip-logo-nuevo.png"
              alt="VIP Tourist Transfers CST"
              className="h-24 w-auto object-contain"
            />
          </a>

          <nav className="hidden items-center gap-8 text-sm font-bold text-zinc-700 lg:flex">
            <a href="#inicio" className="transition hover:text-red-600">
              Inicio
            </a>
            <a href="#servicios" className="transition hover:text-red-600">
              Servicios
            </a>
            <a href="#destinos" className="transition hover:text-red-600">
              Destinos
            </a>
            <a href="#flota" className="transition hover:text-red-600">
              Flota
            </a>
            <a href="#contacto" className="transition hover:text-red-600">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-3">
  {currentUserEmail ? (
  <div className="hidden items-center gap-3 md:flex">
    <span className="max-w-[180px] truncate text-sm font-bold text-zinc-700">
      {currentUserEmail}
    </span>

    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-black text-zinc-800 transition hover:border-red-600 hover:text-red-600"
    >
      Cerrar sesión
    </button>
  </div>
) : (
  <>
    <button
      type="button"
      onClick={() => {
        setAuthMode("login");
        setAuthMessage("");
      }}
      className="hidden rounded-full border border-zinc-300 px-5 py-3 text-sm font-black text-zinc-800 transition hover:border-red-600 hover:text-red-600 md:inline-flex"
    >
      Iniciar sesión
    </button>

    <button
      type="button"
      onClick={() => {
        setAuthMode("register");
        setAuthMessage("");
      }}
      className="hidden rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-800 md:inline-flex"
    >
      Crear cuenta
    </button>
  </>
)}

  <a
    href="#reservar"
    className="rounded-full bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-red-700"
  >
    Reservar ahora
  </a>
</div>
        </div>
      </header>

      {/* MODAL LOGIN / REGISTRO */}
{authMode && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
    <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl md:p-9">

      <button
        type="button"
        onClick={() => {
          setAuthMode(null);
          setAuthMessage("");
          setAuthPassword("");
        }}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-black text-zinc-700 transition hover:bg-red-600 hover:text-white"
        aria-label="Cerrar"
      >
        ×
      </button>

      <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">
        VIP Tourist Transfers
      </p>

      <h2 className="mt-3 text-3xl font-black text-zinc-950">
        {authMode === "register" ? "Crear cuenta" : "Iniciar sesión"}
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {authMode === "register"
          ? "Crea tu cuenta para gestionar tus viajes y reservas."
          : "Accede a tu cuenta para continuar."}
      </p>

      <div className="mt-7 space-y-4">

        {authMode === "register" && (
          <input
            type="text"
            placeholder="Nombre completo"
            value={authName}
            onChange={(e) => setAuthName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
          />
        )}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={authEmail}
          onChange={(e) => setAuthEmail(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
        />

        <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Contraseña"
    value={authPassword}
    onChange={(e) => setAuthPassword(e.target.value)}
    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 pr-14 outline-none transition focus:border-red-500"
  />

  <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-red-600"
  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
>
  {showPassword ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
      <path d="M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9.5 4.6 10 8-.2 1.3-.9 2.7-2 4" />
      <path d="M6.6 6.6C4.2 8 2.4 10.2 2 12c.6 3.4 4.5 8 10 8a10.4 10.4 0 004.2-.9" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )}
</button>
</div>

        {authMessage && (
          <p className="rounded-xl bg-zinc-100 p-3 text-sm font-semibold text-zinc-700">
            {authMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleAuth}
          disabled={authLoading}
          className="w-full rounded-xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {authLoading
            ? "Procesando..."
            : authMode === "register"
            ? "Crear mi cuenta"
            : "Iniciar sesión"}
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode(authMode === "register" ? "login" : "register");
            setAuthMessage("");
            setAuthPassword("");
          }}
          className="w-full text-sm font-bold text-zinc-600 transition hover:text-red-600"
        >
          {authMode === "register"
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Crear cuenta"}
        </button>

      </div>
    </div>
  </div>
)}

      {/* HERO */}
      <section
        id="inicio"
        className="relative overflow-hidden bg-zinc-950 text-white"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-100"
          style={{
  backgroundImage: "url('/images/isla-saona.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/15" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-red-600/10 blur-3xl" />

        <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
          <div>
            <p className="mb-5 text-sm font-black uppercase tracking-[0.38em] text-red-500">
              República Dominicana
            </p>

            <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] md:text-6xl xl:text-7xl">
              Tu viaje
              <span className="block">comienza</span>
              <span className="block text-red-600">con nosotros.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-300">
              Traslados privados desde aeropuertos, hoteles y destinos
              turísticos con seguridad, puntualidad y confort.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#reservar"
                className="rounded-full bg-red-600 px-8 py-4 font-black text-white transition hover:bg-red-700"
              >
                Reservar traslado →
              </a>

              <a
                href="#servicios"
                className="rounded-full border border-white/30 bg-white/5 px-8 py-4 font-black text-white backdrop-blur transition hover:bg-white hover:text-black"
              >
                Ver servicios
              </a>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-white/15 pt-7">
  <div>
    <div className="text-4xl leading-none" aria-hidden="true">
  🛡️
</div>

    <p className="mt-2 font-black">Seguridad</p>
    <p className="text-sm text-zinc-400">Garantizada</p>
  </div>

  <div>
    <div className="text-4xl leading-none" aria-hidden="true">
  🚘
</div>

    <p className="mt-2 font-black">Vehículos</p>
    <p className="text-sm text-zinc-400">Premium</p>
  </div>

  <div>
    <div className="text-4xl leading-none" aria-hidden="true">
  🕐
</div>

    <p className="mt-2 font-black">Atención</p>
    <p className="text-sm text-zinc-400">24/7</p>
  </div>
</div>
          </div>

          {/* RESERVA */}
          <div
            id="reservar"
            className="rounded-[2rem] border border-white/20 bg-white p-7 text-zinc-950 shadow-2xl md:p-9"
          >
            <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-red-600">
              Reserva tu traslado
            </p>

            <h2 className="mt-2 text-center text-3xl font-black">
              ¿A dónde vamos?
            </h2>

            <p className="mt-2 text-center text-zinc-500">
              Completa los datos de tu viaje.
            </p>

            {confirmedReservation ? (
  <div className="mt-7 rounded-3xl border border-green-200 bg-green-50 p-6 text-center">
    <div className="text-5xl">✅</div>

    <h3 className="mt-3 text-2xl font-black text-green-700">
      Reserva confirmada
    </h3>

    <p className="mt-2 text-sm text-zinc-600">
      Gracias por reservar con VIP Tourist Transfers.
    </p>

    <div className="mt-5 rounded-2xl bg-white p-5 text-left text-sm shadow-sm">
      <p>
        <strong>Código:</strong> {confirmedReservation.code}
      </p>

      <p className="mt-2">
        <strong>Nombre:</strong> {confirmedReservation.name}
      </p>

      <p className="mt-2">
        <strong>Recogida:</strong> {confirmedReservation.pickup}
      </p>

      <p className="mt-2">
        <strong>Destino:</strong> {confirmedReservation.destination}
      </p>

      <p className="mt-2">
        <strong>Vehículo:</strong> {confirmedReservation.vehicle}
      </p>

      <p className="mt-2">
        <strong>Forma de pago:</strong>{" "}
        {confirmedReservation.paymentMethod === "card"
          ? "Tarjeta / PayPal"
          : "Efectivo al conductor"}
      </p>

      <p className="mt-3 text-lg font-black">
        Total: US${confirmedReservation.total}
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        setConfirmedReservation(null);
        setPickup("");
        setDestination("");
        setPassengers("");
        setTravelDate("");
        setTravelTime("");
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setSelectedVehicle("");
        setPaymentMethod("");
        setShowVehicles(false);
      }}
      className="mt-6 w-full rounded-xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700"
    >
      Hacer otra reserva
    </button>
   </div>
) : (
  <>
    <form
  onSubmit={(e) => e.preventDefault()}
  className="mt-7 space-y-4"
>
              <div>
                <label className="mb-2 block text-sm font-black">
                  Punto de recogida
                </label>
                <select
  value={pickup}
  onChange={(e) => setPickup(e.target.value)}
  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
>
  <option value="">Selecciona punto de recogida</option>

  {locations.map((place) => (
    <option
      key={place.name}
      value={place.name.toLowerCase()}
    >
      {place.name} — {place.subtitle}
    </option>
  ))}
</select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black">
                  Destino
                </label>
               <select
  value={destination}
  onChange={(e) => setDestination(e.target.value)}
  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
>
  <option value="">Selecciona destino</option>

  {locations.map((place) => (
    <option
      key={place.name}
      value={place.name.toLowerCase()}
    >
      {place.name} — {place.subtitle}
    </option>
  ))}
</select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-black">Fecha</label>
                  <input
  type="date"
  value={travelDate}
  onChange={(e) => setTravelDate(e.target.value)}
  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none"
/>
                </div>

                <div>
  <label className="mb-2 block text-sm font-black">Hora</label>
  <input
    type="time"
    value={travelTime}
    onChange={(e) => setTravelTime(e.target.value)}
    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none"
  />
</div>
              </div>

              <div className="border-t border-zinc-200 pt-4">
  <p className="mb-3 text-sm font-black">
    Datos del pasajero
  </p>

  <div className="space-y-3">
    <input
      type="text"
      placeholder="Nombre completo"
      value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none focus:border-red-500"
    />

    <input
      type="tel"
      placeholder="Teléfono / WhatsApp"
      value={customerPhone}
      onChange={(e) => setCustomerPhone(e.target.value)}
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none focus:border-red-500"
    />

    <input
      type="email"
      placeholder="Correo electrónico"
      value={customerEmail}
      onChange={(e) => setCustomerEmail(e.target.value)}
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none focus:border-red-500"
    />
  </div>
</div>

              <div>
                <label className="mb-2 block text-sm font-black">
                  Pasajeros
                </label>
                <select
  value={passengers}
  onChange={(e) => setPassengers(e.target.value)}
  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none"
>
  <option value="">Selecciona pasajeros</option>
  <option value="1">1 pasajero</option>
  <option value="2">2 pasajeros</option>
<option value="3">3 pasajeros</option>
<option value="4">4 pasajeros</option>
<option value="5">5 pasajeros</option>
<option value="6">6 pasajeros</option>
<option value="7">7 pasajeros</option>
<option value="8">8 pasajeros</option>
<option value="9">9 pasajeros</option>
<option value="10">10 pasajeros</option>
<option value="11">11 pasajeros</option>
<option value="12">12 pasajeros</option>
<option value="13+">13 o más pasajeros</option>
                </select>
              </div>

  {pickup && destination && passengers !== "13+" && (
  <p className="mb-3 text-center text-xl font-black text-zinc-900">
    Precio del traslado: US${finalPrice}
  </p>
)}

{passengers === "13+" && (
  <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-center shadow-sm">
    <p className="text-lg font-black text-red-700">
      Cotización personalizada
    </p>

    <p className="mt-2 text-sm leading-6 text-zinc-600">
      Para grupos de 13 pasajeros o más, preparamos una solución de transporte personalizada según el tamaño de tu grupo.
    </p>

    <a
      href={`https://wa.me/18296502013?text=${encodeURIComponent(
        `Hola, quiero solicitar una cotización para un grupo de 13 o más pasajeros con VIP Tourist Transfers. Recogida: ${pickup}. Destino: ${destination}.`
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 font-black text-white transition hover:scale-[1.02] hover:bg-[#20bd5a]"
    >
      Solicitar cotización por WhatsApp →
    </a>
  </div>
)}

<button
  type="button"
  onClick={(e) => {
  e.preventDefault();

  if (
  !pickup ||
  !destination ||
  !passengers ||
  !travelDate ||
  !travelTime ||
  !customerName.trim() ||
  !customerPhone.trim() ||
  !customerEmail.trim()
) {
    alert("Por favor, completa todos los datos de la reserva.");
    return;
  }

  if (pickup === destination) {
    alert("El punto de recogida y el destino no pueden ser iguales.");
    return;
  }

  if (passengers === "13+") {
  alert(
    "Para grupos de 13 pasajeros o más, contáctanos para una cotización personalizada."
  );
  return;
}

  setSelectedVehicle("");
  setShowVehicles(true);
}}
  className="relative z-50 w-full cursor-pointer rounded-xl bg-red-600 px-6 py-4 text-lg font-black text-white"
  >
         Buscar traslado →
    </button>

  </form>

{showVehicles && (
  <div className="mt-6">
    <h3 className="mb-4 text-xl font-bold">
      Selecciona tu vehículo
    </h3>

    <div className="grid gap-4">

      {/* SEDÁN EJECUTIVO */}
      <div
        onClick={() => setSelectedVehicle("sedan")}
        className={`rounded-xl border p-4 cursor-pointer ${
          selectedVehicle === "sedan"
            ? "border-red-600 ring-2 ring-red-200"
            : "border-zinc-200"
        }`}
      >
        <img
          src="/images/sedan-ejecutivo.jpg"
          alt="Sedán Ejecutivo"
          className="h-40 w-full rounded-lg object-cover"
        />

        <h4 className="mt-3 text-lg font-bold">
          Sedán Ejecutivo
        </h4>

        <p className="text-sm text-gray-600">
          Ideal para 1 a 3 pasajeros
        </p>
      </div>

      {/* MINIVAN PREMIUM */}
      <div
        onClick={() => setSelectedVehicle("suv")}
        className={`rounded-xl border p-4 cursor-pointer ${
          selectedVehicle === "suv"
            ? "border-red-600 ring-2 ring-red-200"
            : "border-zinc-200"
        }`}
      >
        <img
          src="/images/suv-premium.jpg"
          alt="Minivan Premium"
          className="h-40 w-full rounded-lg object-cover"
        />

        <h4 className="mt-3 text-lg font-bold">
          Minivan Premium
        </h4>

        <p className="text-sm text-gray-600">
          Ideal para familias y grupos de hasta 6 pasajeros
        </p>
      </div>

      {/* VAN EJECUTIVA */}
      <div
        onClick={() => setSelectedVehicle("van")}
        className={`rounded-xl border p-4 cursor-pointer ${
          selectedVehicle === "van"
            ? "border-red-600 ring-2 ring-red-200"
            : "border-zinc-200"
        }`}
      >
        <img
          src="/images/van-ejecutiva.jpg"
          alt="Van Ejecutiva"
          className="h-40 w-full rounded-lg object-cover"
        />

        <h4 className="mt-3 text-lg font-bold">
          Van Ejecutiva
        </h4>

        <p className="text-sm text-gray-600">
          Ideal para grupos de hasta 12 pasajeros
        </p>
      </div>

    </div>
  </div>
)}

{showVehicles && selectedVehicle && (
  <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
    <h3 className="mb-4 text-xl font-bold">Resumen de reserva</h3>

    <div className="space-y-2 text-sm">
      <p>
        <span className="font-semibold">Nombre:</span> {customerName}
      </p>

      <p>
        <span className="font-semibold">Recogida:</span> {pickup}
      </p>

      <p>
        <span className="font-semibold">Destino:</span> {destination}
      </p>

      <p>
        <span className="font-semibold">Pasajeros:</span> {passengers}
      </p>

      <p>
        <span className="font-semibold">Vehículo:</span>{" "}
        {selectedVehicle === "sedan"
          ? "Sedán Ejecutivo"
          : selectedVehicle === "suv"
          ? "Minivan Premium"
          : "Van Ejecutiva"}
      </p>

      <p className="pt-2 text-lg font-black">
        Total: US${finalPrice}
      </p>
    </div>
  </div>
)}

  {selectedVehicle && (
  <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5">
    <p className="mb-3 text-sm font-black">
      Forma de pago
    </p>

    <div className="grid grid-cols-2 gap-3">
      <label className="cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-red-500">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={paymentMethod === "card"}
            onChange={() => setPaymentMethod("card")}
            className="h-5 w-5 accent-red-600"
          />

          <div>
            <p className="font-black">💳 Tarjeta</p>
            <p className="text-xs text-zinc-500">
              Pagar en línea
            </p>
          </div>
        </div>
      </label>

      <label className="cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-red-500">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={() => setPaymentMethod("cash")}
            className="h-5 w-5 accent-red-600"
          />

          <div>
            <p className="font-black">💵 Efectivo</p>
            <p className="text-xs text-zinc-500">
              Pagar al conductor
            </p>
          </div>
        </div>
      </label>
    </div>
  </div>
)}

  {selectedVehicle && paymentMethod === "card" && (
  <div className="mt-5">
    <PayPalPayment
      amount={finalPrice}
      onSuccess={async (data) => {
        const reserva = {
          reservationCode: data.reservationCode,
          transactionId: data.transactionId,
          amount: data.amount,
          customerName,
          customerPhone,
          customerEmail,
          pickup,
          destination,
          passengers,
          vehicle: selectedVehicle,
          travelDate,
          travelTime,
          paymentMethod: "card",
        };

       const { error } = await supabase.from("reservas").insert({
  reservation_code: reserva.reservationCode,
  customer_name: reserva.customerName,
  customer_phone: reserva.customerPhone,
  pickup: reserva.pickup,
  destination: reserva.destination,
  passengers: Number(reserva.passengers),
  vehicle: reserva.vehicle,
});

if (error) {
  console.error("Error guardando reserva:", error);
  alert("El pago se realizó, pero ocurrió un error guardando la reserva.");
  return;
}

  setConfirmedReservation({
  code: data.reservationCode,
  name: customerName,
  pickup: pickup,
  destination: destination,
  vehicle:
    selectedVehicle === "sedan"
      ? "Sedán Ejecutivo"
      : selectedVehicle === "suv"
      ? "Minivan Premium"
      : "Van Ejecutiva",
  total: finalPrice,
  paymentMethod: "card",
});

      }}
    />
  </div>
)}

{selectedVehicle && paymentMethod === "cash" && (
  <button
    type="button"
    onClick={async () => {
      const reservationCode = `VIP-${Date.now().toString().slice(-8)}`;

      const reserva = {
        reservationCode,
        transactionId: "CASH",
        amount: finalPrice,
        customerName,
        customerPhone,
        customerEmail,
        pickup,
        destination,
        passengers,
        vehicle: selectedVehicle,
        travelDate,
        travelTime,
        paymentMethod: "cash",
      };

      const { error } = await supabase.from("reservas").insert({
  reservation_code: reserva.reservationCode,
  customer_name: reserva.customerName,
  customer_phone: reserva.customerPhone,
  pickup: reserva.pickup,
  destination: reserva.destination,
  passengers: Number(reserva.passengers),
  vehicle: reserva.vehicle,
});

if (error) {
  console.error("Error guardando reserva:", error);
  alert("Ocurrió un error guardando la reserva. Inténtalo nuevamente.");
  return;
}

  setConfirmedReservation({
  code: reservationCode,
  name: customerName,
  pickup: pickup,
  destination: destination,
  vehicle:
    selectedVehicle === "sedan"
      ? "Sedán Ejecutivo"
      : selectedVehicle === "suv"
      ? "Minivan Premium"
      : "Van Ejecutiva",
  total: finalPrice,
  paymentMethod: "cash",
});

    }}
    className="mt-5 w-full rounded-xl bg-zinc-950 px-6 py-4 text-lg font-black text-white transition hover:bg-red-600"
  >
    Confirmar reserva y pagar al conductor
  </button>
)}

  </>
)}

</div>
        </div>
      </section>

      {/* SERVICIOS */}
<section id="servicios" className="bg-white py-24">
  <div className="mx-auto max-w-7xl px-5 lg:px-8">

    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-red-600">
        Nuestros servicios
      </p>

      <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
        Viaja cómodo. Nosotros nos encargamos del resto.
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-500">
        Transporte privado diseñado para ofrecer seguridad, puntualidad,
        comodidad y una experiencia de primer nivel.
      </p>
    </div>

    <div className="mt-14 grid gap-6 md:grid-cols-3">

      {/* TRASLADOS DE AEROPUERTO */}
      <article className="group rounded-[2rem] bg-gradient-to-br from-red-600 to-red-700 p-8 text-white shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <div className="text-4xl leading-none" aria-hidden="true">
  ✈️
</div>
        </div>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-red-100">
          Aeropuertos
        </p>

        <h3 className="mt-2 text-2xl font-black">
          Traslados de aeropuerto
        </h3>

        <p className="mt-4 leading-7 text-red-50">
          Recogida y traslado privado desde SDQ, PUJ, STI, LRM y otros
          aeropuertos de República Dominicana.
        </p>
      </article>

      {/* TRANSPORTE PRIVADO */}
      <article className="group rounded-[2rem] bg-zinc-950 p-8 text-white shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
          <div className="text-4xl leading-none" aria-hidden="true">
  🚘
</div>
        </div>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-red-500">
          Servicio VIP
        </p>

        <h3 className="mt-2 text-2xl font-black">
          Transporte privado
        </h3>

        <p className="mt-4 leading-7 text-zinc-300">
          Servicio personalizado para parejas, familias, grupos, ejecutivos
          y clientes corporativos.
        </p>
      </article>

      {/* DESTINOS TURÍSTICOS */}
      <article className="group rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-xl transition duration-300 hover:-translate-y-2 hover:border-red-200 hover:shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <div className="text-4xl leading-none" aria-hidden="true">
  📍
</div>
        </div>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-red-600">
          Experiencias
        </p>

        <h3 className="mt-2 text-2xl font-black text-zinc-950">
          Destinos turísticos
        </h3>

        <p className="mt-4 leading-7 text-zinc-600">
          Punta Cana, Santo Domingo, La Romana, Bayahíbe y muchos otros
          destinos del país.
        </p>
      </article>

    </div>
  </div>
</section>

      {/* DESTINOS */}
      <section id="destinos" className="bg-zinc-100 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="font-black uppercase tracking-[0.25em] text-red-600">
            Explora
          </p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            Destinos populares
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((destination) => (
              <article
                key={destination.name}
                className="group relative h-80 overflow-hidden rounded-3xl shadow-xl"
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-black">{destination.name}</h3>
                  <p className="mt-1 text-sm text-zinc-200">
                    {destination.subtitle}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FLOTA */}
      <section id="flota" className="bg-zinc-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div>
            <p className="font-black uppercase tracking-[0.25em] text-red-500">
              Nuestra flota
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Vehículos para cada tipo de viaje.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              Transporte cómodo y seguro para clientes individuales, familias
              y grupos.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

  {/* SEDÁN EJECUTIVO */}
  <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
    <img
      src="/images/sedan-ejecutivo.jpg"
      alt="Sedán Ejecutivo"
      className="h-52 w-full object-cover"
    />
    <div className="p-6">
      <h3 className="text-2xl font-black">
        Sedán Ejecutivo
      </h3>
      <p className="mt-2 text-zinc-400">
        Elegancia y comodidad para viajes privados de 1 a 3 pasajeros.
      </p>
    </div>
  </div>

  {/* MINIVAN PREMIUM */}
  <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
    <img
      src="/images/suv-premium.jpg"
      alt="Minivan Premium"
      className="h-52 w-full object-cover"
    />
    <div className="p-6">
      <h3 className="text-2xl font-black">
        Minivan Premium
      </h3>
      <p className="mt-2 text-zinc-400">
        Confort y espacio para familias y grupos de hasta 6 pasajeros.
      </p>
    </div>
  </div>

  {/* VAN EJECUTIVA */}
  <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
    <img
      src="/images/van-ejecutiva.jpg"
      alt="Van Ejecutiva"
      className="h-52 w-full object-cover"
    />
    <div className="p-6">
      <h3 className="text-2xl font-black">
        Van Ejecutiva
      </h3>
      <p className="mt-2 text-zinc-400">
        Espacio, seguridad y comodidad para grupos de hasta 12 pasajeros.
      </p>
    </div>
  </div>

</div>
          </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="bg-red-600 py-20 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="font-black uppercase tracking-[0.2em] text-red-100">
              VIP Tourist Transfers CST
            </p>
            <h2 className="mt-3 text-4xl font-black">
              ¿Listo para tu próximo viaje?
            </h2>
            <p className="mt-3 text-red-100">
              Seguridad, puntualidad y confort.
            </p>
          </div>

          <a
            href="#reservar"
            className="rounded-full bg-white px-8 py-4 font-black text-red-600 transition hover:bg-zinc-950 hover:text-white"
          >
            Reservar ahora →
          </a>
        </div>
      </section>

            {/* MAPA / UBICACIÓN */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          <div className="mb-8 text-center">
            <p className="font-black uppercase tracking-[0.2em] text-red-600">
              Nuestra ubicación
            </p>

            <h2 className="mt-3 text-3xl font-black text-zinc-950 md:text-4xl">
              Encuéntranos en Santo Domingo
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
              Aeropuerto Internacional Las Américas (SDQ), Ruta 66,
              Punta Caucedo, Boca Chica, República Dominicana.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-xl">
            <iframe
              src="https://www.google.com/maps?q=Aeropuerto%20Internacional%20Las%20Americas%20SDQ%20Punta%20Caucedo%20Boca%20Chica%20Dominican%20Republic&output=embed"
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación VIP Tourist Transfers CST"
              className="w-full"
            />
          </div>

        </div>
      </section>

      {/* FOOTER */}
<footer className="bg-black py-12 text-zinc-400">
  <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-3 lg:px-8">

    {/* LOGO */}
    <div>
      <img
        src="/vip-logo-nuevo.png"
        alt="VIP Tourist Transfers CST"
        className="h-24 w-auto rounded-xl bg-white object-contain"
      />

      <p className="mt-4 max-w-xs text-sm leading-6">
        Transporte privado y turístico con seguridad, puntualidad y confort
        en República Dominicana.
      </p>
    </div>

    {/* CONTACTO */}
<div>
  <p className="text-lg font-black text-white">
    Contacto
  </p>

  <div className="mt-4 space-y-3 text-sm">

    <a
      href="tel:+18296502013"
      className="block transition hover:text-white"
    >
      📞 +1 829-650-2013
    </a>

    <a
      href="https://wa.me/18296502013?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20un%20traslado%20con%20VIP%20Tourist%20Transfers."
      target="_blank"
      rel="noopener noreferrer"
      className="block transition hover:text-[#25D366]"
    >
      WhatsApp
    </a>

    <a
      href="https://www.instagram.com/viptouristtransfers"
      target="_blank"
      rel="noopener noreferrer"
      className="block transition hover:text-pink-400"
    >
      Instagram: @viptouristtransfers
    </a>

    <a
      href="https://www.google.com/maps/search/?api=1&query=Aeropuerto+Internacional+Las+Americas+Ruta+66+Punta+Caucedo+Boca+Chica"
      target="_blank"
      rel="noopener noreferrer"
      className="block leading-6 transition hover:text-white"
    >
      📍 Aeropuerto Internacional Las Américas (SDQ)
      <br />
      Ruta 66, Punta Caucedo, Boca Chica
    </a>

  </div>
</div>

    {/* REDES */}
    <div className="md:text-right">
      <p className="text-lg font-black text-white">
        Síguenos
      </p>

      <div className="mt-4 flex gap-3 md:justify-end">

        {/* LLAMAR */}
<a
  href="tel:+18296502013"
  aria-label="Llamar a VIP Tourist Transfers"
  title="Llamar"
  className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:scale-110 hover:bg-red-700"
>
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <path d="M6.62 10.79a15.46 15.46 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
  </svg>
</a>

        {/* INSTAGRAM */}
        <a
          href="https://www.instagram.com/viptouristtransfers"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de VIP Tourist Transfers"
          title="Instagram"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white shadow-lg transition hover:scale-110"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm10.5 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
        </a>

        {/* WHATSAPP */}
<a
  href="https://wa.me/18296502013?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20un%20traslado%20con%20VIP%20Tourist%20Transfers."
  target="_blank"
  rel="noopener noreferrer"
  aria-label="WhatsApp"
  title="WhatsApp"
  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110"
>
  <svg
    viewBox="0 0 32 32"
    fill="currentColor"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M16.04 3C8.85 3 3 8.78 3 15.9c0 2.27.6 4.49 1.74 6.43L3 28.7l6.55-1.7a13.1 13.1 0 006.48 1.67h.01C23.23 28.67 29 22.89 29 15.77 29 8.65 23.23 3 16.04 3zm0 23.49a10.9 10.9 0 01-5.56-1.52l-.4-.24-3.88 1.01 1.04-3.76-.26-.39a10.65 10.65 0 01-1.68-5.7c0-5.91 4.82-10.72 10.75-10.72 5.93 0 10.75 4.81 10.75 10.72-.01 5.91-4.83 10.6-10.76 10.6zm5.9-8.02c-.32-.16-1.91-.94-2.21-1.05-.3-.11-.52-.16-.74.16-.22.32-.85 1.05-1.04 1.27-.19.21-.38.24-.71.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.49.14-.65.15-.14.32-.38.49-.57.16-.19.22-.32.32-.54.11-.21.05-.4-.03-.57-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.4-.3.32-1.14 1.11-1.14 2.71s1.17 3.15 1.33 3.36c.16.21 2.3 3.5 5.57 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.91-.78 2.18-1.54.27-.75.27-1.38.19-1.51-.08-.13-.3-.21-.62-.37z" />
  </svg>
</a>

      </div>

      <a
        href="#reservar"
        className="mt-6 inline-block rounded-full bg-red-600 px-6 py-3 font-black text-white transition hover:bg-red-700"
      >
        Reservar ahora →
      </a>
    </div>

  </div>

  <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-5 pt-6 text-center text-sm lg:px-8">
  <p>
    © 2026 VIP Tourist Transfer. Todos los derechos reservados.
  </p>

  <p className="mt-2 text-[10px] tracking-wider text-zinc-700">
    Website by <span className="font-semibold text-zinc-600">Axel Roble</span>
  </p>
</div>
</footer>

      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3">

  {/* LLAMAR */}
  <a
    href="tel:+18296502013"
    aria-label="Llamar a VIP Tourist Transfers"
    title="Llamar"
    className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition hover:scale-110 hover:bg-red-700"
  >
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7"
    >
      <path d="M6.62 10.79a15.46 15.46 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
    </svg>
  </a>

  {/* INSTAGRAM */}
<a
  href="https://www.instagram.com/viptouristtransfers"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Instagram de VIP Tourist Transfers"
  title="Instagram"
  className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white shadow-2xl transition hover:scale-110"
>
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm10.5 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" />
  </svg>
</a>

  {/* WHATSAPP */}
  <a
    href="https://wa.me/18296502013?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20un%20traslado%20con%20VIP%20Tourist%20Transfers."
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contactar por WhatsApp"
    title="WhatsApp"
    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition hover:scale-110"
  >
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className="h-8 w-8"
    >
      <path d="M16.04 3C8.85 3 3 8.78 3 15.9c0 2.27.6 4.49 1.74 6.43L3 28.7l6.55-1.7a13.1 13.1 0 006.48 1.67h.01C23.23 28.67 29 22.89 29 15.77 29 8.65 23.23 3 16.04 3zm0 23.49a10.9 10.9 0 01-5.56-1.52l-.4-.24-3.88 1.01 1.04-3.76-.26-.39a10.65 10.65 0 01-1.68-5.7c0-5.91 4.82-10.72 10.75-10.72 5.93 0 10.75 4.81 10.75 10.72-.01 5.91-4.83 10.6-10.76 10.6zm5.9-8.02c-.32-.16-1.91-.94-2.21-1.05-.3-.11-.52-.16-.74.16-.22.32-.85 1.05-1.04 1.27-.19.21-.38.24-.71.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.49.14-.65.15-.14.32-.38.49-.57.16-.19.22-.32.32-.54.11-.21.05-.4-.03-.57-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.4-.3.32-1.14 1.11-1.14 2.71s1.17 3.15 1.33 3.36c.16.21 2.3 3.5 5.57 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.91-.78 2.18-1.54.27-.75.27-1.38.19-1.51-.08-.13-.3-.21-.62-.37z" />
    </svg>
  </a>

</div>

    </main>
  );
  }