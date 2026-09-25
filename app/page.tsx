"use client";
import { useEffect, useState } from "react";
import PayPalPayment from "./PayPalPayment";
import { supabase } from "./lib/supabase";
import LocationAutocomplete from "./components/LocationAutocomplete";


export default function Home() {
const [pickup, setPickup] = useState("");
const [destination, setDestination] = useState("");
type SelectedPlace = {
  label: string;
  placeId?: string;
  lat?: number;
  lng?: number;
};

const [pickupPlace, setPickupPlace] = useState<SelectedPlace | null>(null);
const [destinationPlace, setDestinationPlace] =
  useState<SelectedPlace | null>(null);
  const [routeDistance, setRouteDistance] = useState("");
const [routeDuration, setRouteDuration] = useState("");
const [routeLoading, setRouteLoading] = useState(false);
const [passengers, setPassengers] = useState("");
const [largeLuggage, setLargeLuggage] = useState(0);
const [carryOnLuggage, setCarryOnLuggage] = useState(0);
const [showVehicles, setShowVehicles] = useState(false);
const [selectedVehicle, setSelectedVehicle] = useState("");
const [travelTime, setTravelTime] = useState("");
const [travelDate, setTravelDate] = useState("");
const [tripType, setTripType] = useState<"oneway" | "roundtrip" | "">("");
const [returnDate, setReturnDate] = useState("");
const [returnTime, setReturnTime] = useState("");
const [returnScheduleError, setReturnScheduleError] = useState("");
const allTravelTimes = [
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
];

const getAvailableTravelTimes = () => {
  if (!travelDate) return allTravelTimes;

  const now = new Date();

  // Fecha local de hoy, sin problemas de UTC.
  const today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  // Si la fecha es anterior a hoy, no mostramos ninguna hora.
if (travelDate < today) {
  return [];
}

// Si la reserva es para un día futuro, mostramos todas las horas.
if (travelDate > today) {
  return allTravelTimes;
}

  // Para reservas de hoy exigimos 30 minutos de anticipación.
const minimumReservationTime = new Date(
  now.getTime() + 30 * 60 * 1000
);

  return allTravelTimes.filter((time) => {
    const [timePart, period] = time.split(" ");
    const [hourString] = timePart.split(":");

    let hour = Number(hourString);

    if (period === "AM") {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }

    const optionDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      0,
      0,
      0
    );

    return optionDate >= minimumReservationTime;
  });
};
const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [customerEmail, setCustomerEmail] = useState("");
const [flightNumber, setFlightNumber] = useState("");
const [paymentMethod, setPaymentMethod] =
  useState<"card" | "cash" | "">("");

  const [cancellationPolicyOpen, setCancellationPolicyOpen] = useState(false);
const [cancellationPolicyAccepted, setCancellationPolicyAccepted] =
  useState(false);

 const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
const [authName, setAuthName] = useState("");
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [authMessage, setAuthMessage] = useState("");
const [authLoading, setAuthLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
type MyReservation = {
  id: number;
  created_at: string;
  reservation_code: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  flight_number: string | null;
  pickup: string | null;
  destination: string | null;
  passengers: number | null;
  large_luggage: number | null;
  carry_on_luggage: number | null;
  vehicle: string | null;
  travel_date: string | null;
  travel_time: string | null;
  trip_type: string | null;
  return_date: string | null;
  return_time: string | null;
  amount: number | null;
  payment_method: string | null;
  transaction_id: string | null;
};

const [myReservationsOpen, setMyReservationsOpen] = useState(false);
const [myReservations, setMyReservations] = useState<MyReservation[]>([]);
const [myReservationsLoading, setMyReservationsLoading] = useState(false);
const [myReservationsError, setMyReservationsError] = useState("");
const [isNight, setIsNight] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

type Review = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

const [reviews, setReviews] = useState<Review[]>([]);
const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
const [reviewName, setReviewName] = useState("");
const [reviewRating, setReviewRating] = useState(5);
const [reviewComment, setReviewComment] = useState("");
const [reviewSending, setReviewSending] = useState(false);
const [reviewMessage, setReviewMessage] = useState("");

useEffect(() => {
  const updateMapTheme = () => {
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);
  };

  updateMapTheme();

  const interval = setInterval(updateMapTheme, 60000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const calculateRoute = async () => {
    if (
      typeof pickupPlace?.lat !== "number" ||
      typeof pickupPlace?.lng !== "number" ||
      typeof destinationPlace?.lat !== "number" ||
      typeof destinationPlace?.lng !== "number"
    ) {
      setRouteDistance("");
      setRouteDuration("");
      return;
    }

    try {
      setRouteLoading(true);

      const response = await fetch("/api/route-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: {
            lat: pickupPlace.lat,
            lng: pickupPlace.lng,
          },
          destination: {
            lat: destinationPlace.lat,
            lng: destinationPlace.lng,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        console.error("Error calculando la ruta:", data);
        setRouteDistance("");
        setRouteDuration("");
        return;
      }

      const distanceKm = Number(data.distanceKm) || 0;
const durationMinutes = Number(data.durationMinutes) || 0;

const hours = Math.floor(durationMinutes / 60);
const minutes = durationMinutes % 60;

setRouteDistance(`${distanceKm.toFixed(1)} km`);

      setRouteDuration(
        hours > 0
          ? `${hours} h ${minutes} min`
          : `${minutes} min`
      );
    } catch (error) {
      console.error("Error llamando /api/route-info:", error);
      setRouteDistance("");
      setRouteDuration("");
    } finally {
      setRouteLoading(false);
    }
  };

  calculateRoute();
}, [pickupPlace, destinationPlace]);

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

useEffect(() => {
  const loadReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, name, rating, comment, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando opiniones:", error);
      return;
    }

    setReviews(data || []);
  };

  loadReviews();
}, []);

const reviewMessages = {
  es: {
    nameRequired: "Escribe tu nombre.",
    commentTooShort: "Escribe un comentario de al menos 3 caracteres.",
    commentTooLong: "El comentario no puede superar los 500 caracteres.",
    sendError: "No se pudo enviar tu opinión. Inténtalo nuevamente.",
    sendSuccess:
      "¡Gracias! Tu opinión fue enviada y será publicada después de ser revisada.",
  },

  en: {
    nameRequired: "Enter your name.",
    commentTooShort: "Enter a comment of at least 3 characters.",
    commentTooLong: "The comment cannot exceed 500 characters.",
    sendError: "Your review could not be submitted. Please try again.",
    sendSuccess:
      "Thank you! Your review was submitted and will be published after being reviewed.",
  },

  fr: {
    nameRequired: "Saisissez votre nom.",
    commentTooShort: "Saisissez un commentaire d’au moins 3 caractères.",
    commentTooLong: "Le commentaire ne peut pas dépasser 500 caractères.",
    sendError: "Votre avis n’a pas pu être envoyé. Veuillez réessayer.",
    sendSuccess:
      "Merci ! Votre avis a été envoyé et sera publié après vérification.",
  },

  de: {
    nameRequired: "Geben Sie Ihren Namen ein.",
    commentTooShort: "Geben Sie einen Kommentar mit mindestens 3 Zeichen ein.",
    commentTooLong: "Der Kommentar darf höchstens 500 Zeichen lang sein.",
    sendError: "Ihre Bewertung konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    sendSuccess:
      "Vielen Dank! Ihre Bewertung wurde gesendet und wird nach der Prüfung veröffentlicht.",
  },

  it: {
    nameRequired: "Inserisci il tuo nome.",
    commentTooShort: "Inserisci un commento di almeno 3 caratteri.",
    commentTooLong: "Il commento non può superare i 500 caratteri.",
    sendError: "Non è stato possibile inviare la recensione. Riprova.",
    sendSuccess:
      "Grazie! La tua recensione è stata inviata e sarà pubblicata dopo la verifica.",
  },

  pt: {
    nameRequired: "Digite seu nome.",
    commentTooShort: "Digite um comentário com pelo menos 3 caracteres.",
    commentTooLong: "O comentário não pode ultrapassar 500 caracteres.",
    sendError: "Não foi possível enviar sua avaliação. Tente novamente.",
    sendSuccess:
      "Obrigado! Sua avaliação foi enviada e será publicada após a revisão.",
  },

  ja: {
    nameRequired: "お名前を入力してください。",
    commentTooShort: "3文字以上のコメントを入力してください。",
    commentTooLong: "コメントは500文字以内で入力してください。",
    sendError: "口コミを送信できませんでした。もう一度お試しください。",
    sendSuccess:
      "ありがとうございます。口コミが送信され、確認後に公開されます。",
  },
};

const handleReviewSubmit = async () => {
  setReviewMessage("");

  const cleanName = reviewName.trim();
  const cleanComment = reviewComment.trim();

  if (!cleanName) {
    setReviewMessage(reviewMessages[language].nameRequired);
    return;
  }

  if (cleanComment.length < 3) {
    setReviewMessage(reviewMessages[language].commentTooShort);
    return;
  }

  if (cleanComment.length > 500) {
    setReviewMessage(reviewMessages[language].commentTooLong);
    return;
  }

  setReviewSending(true);

  try {
    const { error } = await supabase
      .from("reviews")
      .insert({
        name: cleanName,
        rating: reviewRating,
        comment: cleanComment,
      });

    if (error) {
      console.error("Error enviando opinión:", error);
      setReviewMessage(reviewMessages[language].sendError);
      return;
    }

    setReviewName("");
    setReviewRating(5);
    setReviewComment("");
    setReviewMessage(reviewMessages[language].sendSuccess);
  } catch (error) {
    console.error("Error enviando opinión:", error);
    setReviewMessage(reviewMessages[language].sendError);
  } finally {
    setReviewSending(false);
  }
};

const reservationMessages = {
  es: {
    loginRequired: "Debes iniciar sesión para ver tus reservas.",
    loadError: "No se pudieron cargar tus reservas.",
    unexpectedError: "Ocurrió un error al cargar tus reservas.",
  },
  en: {
    loginRequired: "You must log in to view your reservations.",
    loadError: "Your reservations could not be loaded.",
    unexpectedError: "An error occurred while loading your reservations.",
  },
  fr: {
    loginRequired: "Vous devez vous connecter pour voir vos réservations.",
    loadError: "Impossible de charger vos réservations.",
    unexpectedError: "Une erreur s’est produite lors du chargement de vos réservations.",
  },
  de: {
    loginRequired: "Sie müssen sich anmelden, um Ihre Buchungen anzuzeigen.",
    loadError: "Ihre Buchungen konnten nicht geladen werden.",
    unexpectedError: "Beim Laden Ihrer Buchungen ist ein Fehler aufgetreten.",
  },
  it: {
    loginRequired: "Devi accedere per visualizzare le tue prenotazioni.",
    loadError: "Non è stato possibile caricare le tue prenotazioni.",
    unexpectedError: "Si è verificato un errore durante il caricamento delle prenotazioni.",
  },
  pt: {
    loginRequired: "Você precisa entrar para ver suas reservas.",
    loadError: "Não foi possível carregar suas reservas.",
    unexpectedError: "Ocorreu um erro ao carregar suas reservas.",
  },
  ja: {
    loginRequired: "予約を確認するにはログインしてください。",
    loadError: "予約を読み込めませんでした。",
    unexpectedError: "予約の読み込み中にエラーが発生しました。",
  },
};

const handleMyReservations = async () => {
  setMyReservationsOpen(true);
  setMyReservationsLoading(true);
  setMyReservationsError("");

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setMyReservationsError(
  reservationMessages[language].loginRequired
);
      return;
    }

    const response = await fetch("/api/my-reservations", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      setMyReservationsError(
  result.message || reservationMessages[language].loadError
);
      return;
    }

    setMyReservations(result.reservations || []);
  } catch (error) {
    console.error("Error cargando mis reservas:", error);
    setMyReservationsError(
  reservationMessages[language].unexpectedError
);
  } finally {
    setMyReservationsLoading(false);
  }
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  setCurrentUserEmail(null);
};

const authMessages = {
  es: {
    requiredCredentials: "Completa tu correo y contraseña.",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres.",
    fullNameRequired: "Escribe tu nombre completo.",
    accountExists:
      "Ya existe una cuenta con este correo electrónico. Inicia sesión.",
    accountCreated:
      "¡Cuenta creada! Revisa tu correo electrónico para confirmar tu cuenta.",
    invalidCredentials: "Correo o contraseña incorrectos.",
    loginSuccess: "¡Sesión iniciada correctamente!",
    generalError: "Ocurrió un error. Inténtalo nuevamente.",
  },

  en: {
    requiredCredentials: "Enter your email and password.",
    passwordTooShort: "The password must be at least 6 characters long.",
    fullNameRequired: "Enter your full name.",
    accountExists:
      "An account already exists with this email address. Please log in.",
    accountCreated:
      "Account created! Check your email to confirm your account.",
    invalidCredentials: "Incorrect email or password.",
    loginSuccess: "You have logged in successfully!",
    generalError: "An error occurred. Please try again.",
  },

  fr: {
    requiredCredentials: "Saisissez votre e-mail et votre mot de passe.",
    passwordTooShort: "Le mot de passe doit comporter au moins 6 caractères.",
    fullNameRequired: "Saisissez votre nom complet.",
    accountExists:
      "Un compte existe déjà avec cette adresse e-mail. Connectez-vous.",
    accountCreated:
      "Compte créé ! Consultez votre e-mail pour confirmer votre compte.",
    invalidCredentials: "E-mail ou mot de passe incorrect.",
    loginSuccess: "Connexion réussie !",
    generalError: "Une erreur s’est produite. Veuillez réessayer.",
  },

  de: {
    requiredCredentials: "Geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.",
    passwordTooShort: "Das Passwort muss mindestens 6 Zeichen lang sein.",
    fullNameRequired: "Geben Sie Ihren vollständigen Namen ein.",
    accountExists:
      "Für diese E-Mail-Adresse besteht bereits ein Konto. Bitte melden Sie sich an.",
    accountCreated:
      "Konto erstellt! Prüfen Sie Ihre E-Mails, um Ihr Konto zu bestätigen.",
    invalidCredentials: "E-Mail-Adresse oder Passwort ist falsch.",
    loginSuccess: "Erfolgreich angemeldet!",
    generalError: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
  },

  it: {
    requiredCredentials: "Inserisci la tua email e la password.",
    passwordTooShort: "La password deve contenere almeno 6 caratteri.",
    fullNameRequired: "Inserisci il tuo nome completo.",
    accountExists:
      "Esiste già un account con questo indirizzo email. Accedi.",
    accountCreated:
      "Account creato! Controlla la tua email per confermare il tuo account.",
    invalidCredentials: "Email o password non corretti.",
    loginSuccess: "Accesso effettuato con successo!",
    generalError: "Si è verificato un errore. Riprova.",
  },

  pt: {
    requiredCredentials: "Digite seu e-mail e sua senha.",
    passwordTooShort: "A senha deve ter pelo menos 6 caracteres.",
    fullNameRequired: "Digite seu nome completo.",
    accountExists:
      "Já existe uma conta com este endereço de e-mail. Entre na sua conta.",
    accountCreated:
      "Conta criada! Verifique seu e-mail para confirmar sua conta.",
    invalidCredentials: "E-mail ou senha incorretos.",
    loginSuccess: "Login realizado com sucesso!",
    generalError: "Ocorreu um erro. Tente novamente.",
  },

  ja: {
    requiredCredentials: "メールアドレスとパスワードを入力してください。",
    passwordTooShort: "パスワードは6文字以上で入力してください。",
    fullNameRequired: "氏名を入力してください。",
    accountExists:
      "このメールアドレスのアカウントはすでに存在します。ログインしてください。",
    accountCreated:
      "アカウントが作成されました。確認メールをご確認ください。",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません。",
    loginSuccess: "ログインしました。",
    generalError: "エラーが発生しました。もう一度お試しください。",
  },
};

const handleAuth = async () => {
  setAuthMessage("");

  if (!authEmail.trim() || !authPassword.trim()) {
    setAuthMessage(authMessages[language].requiredCredentials);
    return;
  }

  if (authPassword.length < 6) {
    setAuthMessage(authMessages[language].passwordTooShort);
    return;
  }

  setAuthLoading(true);

  try {
    if (authMode === "register") {
  if (!authName.trim()) {
    setAuthMessage(authMessages[language].fullNameRequired);
    return;
  }

  const email = authEmail.trim().toLowerCase();

  // Intentamos iniciar sesión primero para detectar
  // si ya existe una cuenta con este correo.
  const { error: loginCheckError } =
    await supabase.auth.signInWithPassword({
      email,
      password: authPassword,
    });

  if (!loginCheckError) {
    await supabase.auth.signOut();

    setAuthMessage(authMessages[language].accountExists);
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
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

  // Supabase puede ocultar que un correo ya existe
  // y devolver una identidad vacía.
  if (data.user && data.user.identities?.length === 0) {
    setAuthMessage(authMessages[language].accountExists);
    return;
  }

  setAuthMessage(authMessages[language].accountCreated);
}

    if (authMode === "login") {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail.trim(),
    password: authPassword,
  });

  if (error) {
    setAuthMessage(authMessages[language].invalidCredentials);
    return;
  }

  setCurrentUserEmail(data.user?.email ?? null);
  setAuthMessage(authMessages[language].loginSuccess);

  setTimeout(() => {
    setAuthMode(null);
    setAuthPassword("");
  }, 600);
}
  } catch (error) {
    console.error(error);
    setAuthMessage(authMessages[language].generalError);
  } finally {
    setAuthLoading(false);
  }
};

const [confirmedReservation, setConfirmedReservation] = useState<{
  code: string;
  name: string;
  phone: string;
  email: string;
  flightNumber: string;
  pickup: string;
  destination: string;
  passengers: string;
  largeLuggage: number;
  carryOnLuggage: number;
  date: string;
  time: string;
  tripType: "oneway" | "roundtrip";
returnDate: string;
returnTime: string;
  vehicle: string;
  total: string;
  paymentMethod: "card" | "cash";
} | null>(null);

// ============================================================
// GESTIONAR / CANCELAR RESERVA
// ============================================================

const [manageReservationOpen, setManageReservationOpen] = useState(false);
const [manageReservationCode, setManageReservationCode] = useState("");
const [manageReservationEmail, setManageReservationEmail] = useState("");
const [cancellationReason, setCancellationReason] = useState("");
const [cancellationLoading, setCancellationLoading] = useState(false);
const [cancellationMessage, setCancellationMessage] = useState("");
const [cancellationSuccess, setCancellationSuccess] = useState(false);

const cancellationMessages = {
  es: {
    dataRequired: "Escribe el código de reserva y el correo electrónico.",
    reasonRequired: "Escribe el motivo de la cancelación.",
    cancelError: "No se pudo cancelar la reserva.",
    cancelSuccess: "Reserva cancelada correctamente.",
    unexpectedError:
      "Ocurrió un error al cancelar la reserva. Inténtalo nuevamente.",
  },
  en: {
    dataRequired: "Enter the reservation code and email address.",
    reasonRequired: "Enter the reason for cancellation.",
    cancelError: "The reservation could not be cancelled.",
    cancelSuccess: "Reservation cancelled successfully.",
    unexpectedError:
      "An error occurred while cancelling the reservation. Please try again.",
  },
  fr: {
    dataRequired: "Saisissez le code de réservation et l’adresse e-mail.",
    reasonRequired: "Saisissez le motif de l’annulation.",
    cancelError: "La réservation n’a pas pu être annulée.",
    cancelSuccess: "Réservation annulée avec succès.",
    unexpectedError:
      "Une erreur s’est produite lors de l’annulation. Veuillez réessayer.",
  },
  de: {
    dataRequired: "Geben Sie den Buchungscode und die E-Mail-Adresse ein.",
    reasonRequired: "Geben Sie den Grund für die Stornierung ein.",
    cancelError: "Die Buchung konnte nicht storniert werden.",
    cancelSuccess: "Buchung erfolgreich storniert.",
    unexpectedError:
      "Beim Stornieren der Buchung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
  },
  it: {
    dataRequired: "Inserisci il codice di prenotazione e l’indirizzo email.",
    reasonRequired: "Inserisci il motivo della cancellazione.",
    cancelError: "Non è stato possibile cancellare la prenotazione.",
    cancelSuccess: "Prenotazione cancellata con successo.",
    unexpectedError:
      "Si è verificato un errore durante la cancellazione. Riprova.",
  },
  pt: {
    dataRequired: "Digite o código da reserva e o endereço de e-mail.",
    reasonRequired: "Digite o motivo do cancelamento.",
    cancelError: "Não foi possível cancelar a reserva.",
    cancelSuccess: "Reserva cancelada com sucesso.",
    unexpectedError:
      "Ocorreu um erro ao cancelar a reserva. Tente novamente.",
  },
  ja: {
    dataRequired: "予約コードとメールアドレスを入力してください。",
    reasonRequired: "キャンセル理由を入力してください。",
    cancelError: "予約をキャンセルできませんでした。",
    cancelSuccess: "予約は正常にキャンセルされました。",
    unexpectedError:
      "予約のキャンセル中にエラーが発生しました。もう一度お試しください。",
  },
};

const bookingMessages = {
  es: {
    completeData: "Por favor, completa todos los datos de la reserva.",
    selectReturn: "Selecciona la fecha y la hora de regreso.",
    returnBeforeDeparture:
      "La fecha de regreso no puede ser anterior a la fecha de ida.",
    returnOneHourLater:
      "Si el regreso es el mismo día, debe ser al menos 1 hora después de la hora de ida.",
    sameLocation:
      "El punto de recogida y el destino no pueden ser iguales.",
    calculatingFare:
      "Estamos calculando la tarifa de esta ruta. Espera unos segundos e inténtalo nuevamente.",
    fareUnavailable:
      "No pudimos calcular automáticamente la tarifa de esta ruta. Solicita una cotización por WhatsApp.",
    saveError:
      "Ocurrió un error guardando la reserva. Inténtalo nuevamente.",
    paymentSaveError:
      "El pago se realizó, pero ocurrió un error guardando la reserva.",
  },

  en: {
    completeData: "Please complete all reservation details.",
    selectReturn: "Select the return date and time.",
    returnBeforeDeparture:
      "The return date cannot be earlier than the departure date.",
    returnOneHourLater:
      "If the return is on the same day, it must be at least 1 hour after the departure time.",
    sameLocation:
      "The pickup location and destination cannot be the same.",
    calculatingFare:
      "We are calculating the fare for this route. Please wait a few seconds and try again.",
    fareUnavailable:
      "We could not automatically calculate the fare for this route. Request a quote via WhatsApp.",
    saveError:
      "An error occurred while saving the reservation. Please try again.",
    paymentSaveError:
      "The payment was completed, but an error occurred while saving the reservation.",
  },

  fr: {
    completeData: "Veuillez compléter toutes les informations de la réservation.",
    selectReturn: "Sélectionnez la date et l’heure de retour.",
    returnBeforeDeparture:
      "La date de retour ne peut pas être antérieure à la date de départ.",
    returnOneHourLater:
      "Si le retour a lieu le même jour, il doit être au moins 1 heure après l’heure de départ.",
    sameLocation:
      "Le lieu de prise en charge et la destination ne peuvent pas être identiques.",
    calculatingFare:
      "Nous calculons le tarif de cet itinéraire. Patientez quelques secondes et réessayez.",
    fareUnavailable:
      "Nous n’avons pas pu calculer automatiquement le tarif de cet itinéraire. Demandez un devis via WhatsApp.",
    saveError:
      "Une erreur s’est produite lors de l’enregistrement de la réservation. Veuillez réessayer.",
    paymentSaveError:
      "Le paiement a été effectué, mais une erreur s’est produite lors de l’enregistrement de la réservation.",
  },

  de: {
    completeData: "Bitte füllen Sie alle Buchungsdaten aus.",
    selectReturn: "Wählen Sie das Rückreisedatum und die Rückreisezeit aus.",
    returnBeforeDeparture:
      "Das Rückreisedatum darf nicht vor dem Abreisedatum liegen.",
    returnOneHourLater:
      "Bei einer Rückfahrt am selben Tag muss die Rückfahrt mindestens 1 Stunde nach der Abfahrt erfolgen.",
    sameLocation:
      "Abholort und Ziel dürfen nicht identisch sein.",
    calculatingFare:
      "Wir berechnen den Fahrpreis für diese Route. Bitte warten Sie einige Sekunden und versuchen Sie es erneut.",
    fareUnavailable:
      "Der Fahrpreis für diese Route konnte nicht automatisch berechnet werden. Fordern Sie über WhatsApp ein Angebot an.",
    saveError:
      "Beim Speichern der Buchung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    paymentSaveError:
      "Die Zahlung wurde durchgeführt, aber beim Speichern der Buchung ist ein Fehler aufgetreten.",
  },

  it: {
    completeData: "Completa tutti i dati della prenotazione.",
    selectReturn: "Seleziona la data e l’ora del ritorno.",
    returnBeforeDeparture:
      "La data di ritorno non può essere precedente alla data di partenza.",
    returnOneHourLater:
      "Se il ritorno è nello stesso giorno, deve essere almeno 1 ora dopo l’orario di partenza.",
    sameLocation:
      "Il luogo di ritiro e la destinazione non possono essere uguali.",
    calculatingFare:
      "Stiamo calcolando la tariffa per questo percorso. Attendi qualche secondo e riprova.",
    fareUnavailable:
      "Non è stato possibile calcolare automaticamente la tariffa per questo percorso. Richiedi un preventivo tramite WhatsApp.",
    saveError:
      "Si è verificato un errore durante il salvataggio della prenotazione. Riprova.",
    paymentSaveError:
      "Il pagamento è stato effettuato, ma si è verificato un errore durante il salvataggio della prenotazione.",
  },

  pt: {
    completeData: "Preencha todos os dados da reserva.",
    selectReturn: "Selecione a data e a hora de retorno.",
    returnBeforeDeparture:
      "A data de retorno não pode ser anterior à data de ida.",
    returnOneHourLater:
      "Se o retorno for no mesmo dia, deverá ser pelo menos 1 hora após o horário de ida.",
    sameLocation:
      "O local de recolha e o destino não podem ser iguais.",
    calculatingFare:
      "Estamos calculando a tarifa desta rota. Aguarde alguns segundos e tente novamente.",
    fareUnavailable:
      "Não foi possível calcular automaticamente a tarifa desta rota. Solicite uma cotação pelo WhatsApp.",
    saveError:
      "Ocorreu um erro ao salvar a reserva. Tente novamente.",
    paymentSaveError:
      "O pagamento foi realizado, mas ocorreu um erro ao salvar a reserva.",
  },

  ja: {
    completeData: "予約に必要な情報をすべて入力してください。",
    selectReturn: "帰りの日付と時刻を選択してください。",
    returnBeforeDeparture:
      "帰りの日付を出発日より前に設定することはできません。",
    returnOneHourLater:
      "同じ日に戻る場合、帰りの時刻は出発時刻の1時間後以降に設定してください。",
    sameLocation:
      "お迎え場所と目的地を同じ場所にすることはできません。",
    calculatingFare:
      "このルートの料金を計算しています。数秒待ってからもう一度お試しください。",
    fareUnavailable:
      "このルートの料金を自動計算できませんでした。WhatsAppでお見積もりをご依頼ください。",
    saveError:
      "予約の保存中にエラーが発生しました。もう一度お試しください。",
    paymentSaveError:
      "お支払いは完了しましたが、予約の保存中にエラーが発生しました。",
  },
};

const bookingUi = {
  es: {
    customQuote: "Cotización personalizada",
    customQuoteDescription:
      "Por la cantidad de pasajeros o equipaje, este traslado requiere una cotización personalizada.",
    whatsappQuote: "Solicitar cotización por WhatsApp →",
    selectVehicle: "Selecciona tu vehículo",
    sedanCapacityError:
      "El Sedán Ejecutivo no tiene capacidad suficiente para la cantidad de pasajeros o equipaje seleccionada.",
    minivanCapacityError:
      "La Minivan Premium no tiene capacidad suficiente para la cantidad de pasajeros o equipaje seleccionada.",
    vanCapacityError:
      "La Van Ejecutiva no tiene capacidad suficiente para la cantidad de pasajeros o equipaje seleccionada.",
    sedanCapacity: "Hasta 3 pasajeros · Equipaje ligero",
    sedanLuggage: "Hasta 2 maletas grandes + equipaje de mano",
    minivanCapacity: "Hasta 6 pasajeros · Equipaje familiar",
    minivanLuggage: "Hasta 5 maletas grandes + equipaje de mano",
    vanCapacity: "Hasta 12 pasajeros · Gran capacidad de equipaje",
    vanLuggage: "Hasta 10 maletas grandes + equipaje de mano",
    unavailable:
      "No disponible para la cantidad de pasajeros o equipaje seleccionada",
    reservationSummary: "Resumen de reserva",
    paymentMethod: "Forma de pago",
    card: "💳 Tarjeta",
    payOnline: "Pagar en línea",
    cash: "💵 Efectivo",
    payDriver: "Pagar al conductor",
    confirmCashReservation: "Confirmar reserva y pagar al conductor",
  },

  en: {
    customQuote: "Custom quote",
    customQuoteDescription:
      "Due to the number of passengers or amount of luggage, this transfer requires a custom quote.",
    whatsappQuote: "Request a quote via WhatsApp →",
    selectVehicle: "Select your vehicle",
    sedanCapacityError:
      "The Executive Sedan does not have enough capacity for the selected number of passengers or luggage.",
    minivanCapacityError:
      "The Premium Minivan does not have enough capacity for the selected number of passengers or luggage.",
    vanCapacityError:
      "The Executive Van does not have enough capacity for the selected number of passengers or luggage.",
    sedanCapacity: "Up to 3 passengers · Light luggage",
    sedanLuggage: "Up to 2 large bags + carry-on luggage",
    minivanCapacity: "Up to 6 passengers · Family luggage",
    minivanLuggage: "Up to 5 large bags + carry-on luggage",
    vanCapacity: "Up to 12 passengers · Large luggage capacity",
    vanLuggage: "Up to 10 large bags + carry-on luggage",
    unavailable:
      "Unavailable for the selected number of passengers or luggage",
    reservationSummary: "Reservation summary",
    paymentMethod: "Payment method",
    card: "💳 Card",
    payOnline: "Pay online",
    cash: "💵 Cash",
    payDriver: "Pay the driver",
    confirmCashReservation: "Confirm reservation and pay the driver",
  },

  fr: {
    customQuote: "Devis personnalisé",
    customQuoteDescription:
      "En raison du nombre de passagers ou de bagages, ce transfert nécessite un devis personnalisé.",
    whatsappQuote: "Demander un devis via WhatsApp →",
    selectVehicle: "Sélectionnez votre véhicule",
    sedanCapacityError:
      "La Berline Executive n’a pas une capacité suffisante pour le nombre de passagers ou de bagages sélectionné.",
    minivanCapacityError:
      "Le Minivan Premium n’a pas une capacité suffisante pour le nombre de passagers ou de bagages sélectionné.",
    vanCapacityError:
      "Le Van Executive n’a pas une capacité suffisante pour le nombre de passagers ou de bagages sélectionné.",
    sedanCapacity: "Jusqu’à 3 passagers · Bagages légers",
    sedanLuggage: "Jusqu’à 2 grandes valises + bagages à main",
    minivanCapacity: "Jusqu’à 6 passagers · Bagages familiaux",
    minivanLuggage: "Jusqu’à 5 grandes valises + bagages à main",
    vanCapacity: "Jusqu’à 12 passagers · Grande capacité de bagages",
    vanLuggage: "Jusqu’à 10 grandes valises + bagages à main",
    unavailable:
      "Indisponible pour le nombre de passagers ou de bagages sélectionné",
    reservationSummary: "Résumé de la réservation",
    paymentMethod: "Mode de paiement",
    card: "💳 Carte",
    payOnline: "Payer en ligne",
    cash: "💵 Espèces",
    payDriver: "Payer le chauffeur",
    confirmCashReservation: "Confirmer la réservation et payer le chauffeur",
  },

  de: {
    customQuote: "Individuelles Angebot",
    customQuoteDescription:
      "Aufgrund der Anzahl der Passagiere oder des Gepäcks ist für diesen Transfer ein individuelles Angebot erforderlich.",
    whatsappQuote: "Angebot über WhatsApp anfordern →",
    selectVehicle: "Fahrzeug auswählen",
    sedanCapacityError:
      "Die Executive-Limousine bietet nicht genügend Platz für die ausgewählte Anzahl an Passagieren oder Gepäck.",
    minivanCapacityError:
      "Der Premium-Minivan bietet nicht genügend Platz für die ausgewählte Anzahl an Passagieren oder Gepäck.",
    vanCapacityError:
      "Der Executive-Van bietet nicht genügend Platz für die ausgewählte Anzahl an Passagieren oder Gepäck.",
    sedanCapacity: "Bis zu 3 Passagiere · Leichtes Gepäck",
    sedanLuggage: "Bis zu 2 große Koffer + Handgepäck",
    minivanCapacity: "Bis zu 6 Passagiere · Familiengepäck",
    minivanLuggage: "Bis zu 5 große Koffer + Handgepäck",
    vanCapacity: "Bis zu 12 Passagiere · Große Gepäckkapazität",
    vanLuggage: "Bis zu 10 große Koffer + Handgepäck",
    unavailable:
      "Für die ausgewählte Anzahl an Passagieren oder Gepäck nicht verfügbar",
    reservationSummary: "Buchungsübersicht",
    paymentMethod: "Zahlungsart",
    card: "💳 Karte",
    payOnline: "Online bezahlen",
    cash: "💵 Barzahlung",
    payDriver: "Beim Fahrer bezahlen",
    confirmCashReservation: "Buchung bestätigen und beim Fahrer bezahlen",
  },

  it: {
    customQuote: "Preventivo personalizzato",
    customQuoteDescription:
      "A causa del numero di passeggeri o dei bagagli, questo trasferimento richiede un preventivo personalizzato.",
    whatsappQuote: "Richiedi un preventivo su WhatsApp →",
    selectVehicle: "Seleziona il tuo veicolo",
    sedanCapacityError:
      "La Berlina Executive non ha capacità sufficiente per il numero di passeggeri o bagagli selezionato.",
    minivanCapacityError:
      "Il Minivan Premium non ha capacità sufficiente per il numero di passeggeri o bagagli selezionato.",
    vanCapacityError:
      "Il Van Executive non ha capacità sufficiente per il numero di passeggeri o bagagli selezionato.",
    sedanCapacity: "Fino a 3 passeggeri · Bagaglio leggero",
    sedanLuggage: "Fino a 2 valigie grandi + bagaglio a mano",
    minivanCapacity: "Fino a 6 passeggeri · Bagaglio familiare",
    minivanLuggage: "Fino a 5 valigie grandi + bagaglio a mano",
    vanCapacity: "Fino a 12 passeggeri · Grande capacità bagagli",
    vanLuggage: "Fino a 10 valigie grandi + bagaglio a mano",
    unavailable:
      "Non disponibile per il numero di passeggeri o bagagli selezionato",
    reservationSummary: "Riepilogo della prenotazione",
    paymentMethod: "Metodo di pagamento",
    card: "💳 Carta",
    payOnline: "Paga online",
    cash: "💵 Contanti",
    payDriver: "Paga al conducente",
    confirmCashReservation: "Conferma la prenotazione e paga al conducente",
  },

  pt: {
    customQuote: "Cotação personalizada",
    customQuoteDescription:
      "Devido à quantidade de passageiros ou bagagem, este transfer requer uma cotação personalizada.",
    whatsappQuote: "Solicitar cotação pelo WhatsApp →",
    selectVehicle: "Selecione seu veículo",
    sedanCapacityError:
      "O Sedã Executivo não tem capacidade suficiente para a quantidade de passageiros ou bagagem selecionada.",
    minivanCapacityError:
      "A Minivan Premium não tem capacidade suficiente para a quantidade de passageiros ou bagagem selecionada.",
    vanCapacityError:
      "A Van Executiva não tem capacidade suficiente para a quantidade de passageiros ou bagagem selecionada.",
    sedanCapacity: "Até 3 passageiros · Bagagem leve",
    sedanLuggage: "Até 2 malas grandes + bagagem de mão",
    minivanCapacity: "Até 6 passageiros · Bagagem familiar",
    minivanLuggage: "Até 5 malas grandes + bagagem de mão",
    vanCapacity: "Até 12 passageiros · Grande capacidade de bagagem",
    vanLuggage: "Até 10 malas grandes + bagagem de mão",
    unavailable:
      "Indisponível para a quantidade de passageiros ou bagagem selecionada",
    reservationSummary: "Resumo da reserva",
    paymentMethod: "Forma de pagamento",
    card: "💳 Cartão",
    payOnline: "Pagar online",
    cash: "💵 Dinheiro",
    payDriver: "Pagar ao motorista",
    confirmCashReservation: "Confirmar reserva e pagar ao motorista",
  },

  ja: {
    customQuote: "個別見積もり",
    customQuoteDescription:
      "乗客数または荷物の量により、この送迎には個別のお見積もりが必要です。",
    whatsappQuote: "WhatsAppで見積もりを依頼 →",
    selectVehicle: "車両を選択",
    sedanCapacityError:
      "エグゼクティブセダンでは、選択された乗客数または荷物量に対応できません。",
    minivanCapacityError:
      "プレミアムミニバンでは、選択された乗客数または荷物量に対応できません。",
    vanCapacityError:
      "エグゼクティブバンでは、選択された乗客数または荷物量に対応できません。",
    sedanCapacity: "最大3名 · 軽量荷物",
    sedanLuggage: "大型荷物2個まで + 機内持ち込み荷物",
    minivanCapacity: "最大6名 · ファミリー向け荷物",
    minivanLuggage: "大型荷物5個まで + 機内持ち込み荷物",
    vanCapacity: "最大12名 · 大容量の荷物スペース",
    vanLuggage: "大型荷物10個まで + 機内持ち込み荷物",
    unavailable:
      "選択された乗客数または荷物量では利用できません",
    reservationSummary: "予約概要",
    paymentMethod: "支払い方法",
    card: "💳 カード",
    payOnline: "オンラインで支払う",
    cash: "💵 現金",
    payDriver: "ドライバーに支払う",
    confirmCashReservation: "予約を確定してドライバーに支払う",
  },
};

const servicesUi = {
  es: {
    eyebrow: "Nuestros servicios",
    title: "Viaja cómodo. Nosotros nos encargamos del resto.",
    description:
      "Transporte privado diseñado para ofrecer seguridad, puntualidad, comodidad y una experiencia de primer nivel.",
    airports: "Aeropuertos",
    airportTitle: "Traslados de aeropuerto",
    airportDescription:
      "Recogida y traslado privado desde SDQ, PUJ, STI, LRM y otros aeropuertos de República Dominicana.",
    vip: "Servicio VIP",
    privateTitle: "Transporte privado",
    privateDescription:
      "Servicio personalizado para parejas, familias, grupos, ejecutivos y clientes corporativos.",
    experiences: "Experiencias",
    destinationsTitle: "Destinos turísticos",
    destinationsDescription:
      "Punta Cana, Santo Domingo, La Romana, Bayahíbe y muchos otros destinos del país.",
  },

  en: {
    eyebrow: "Our services",
    title: "Travel comfortably. We take care of the rest.",
    description:
      "Private transportation designed to provide safety, punctuality, comfort and a first-class experience.",
    airports: "Airports",
    airportTitle: "Airport transfers",
    airportDescription:
      "Private pickup and transfer from SDQ, PUJ, STI, LRM and other airports in the Dominican Republic.",
    vip: "VIP Service",
    privateTitle: "Private transportation",
    privateDescription:
      "Personalized service for couples, families, groups, executives and corporate clients.",
    experiences: "Experiences",
    destinationsTitle: "Tourist destinations",
    destinationsDescription:
      "Punta Cana, Santo Domingo, La Romana, Bayahíbe and many other destinations throughout the country.",
  },

  fr: {
    eyebrow: "Nos services",
    title: "Voyagez confortablement. Nous nous occupons du reste.",
    description:
      "Transport privé conçu pour offrir sécurité, ponctualité, confort et une expérience haut de gamme.",
    airports: "Aéroports",
    airportTitle: "Transferts aéroport",
    airportDescription:
      "Prise en charge et transfert privé depuis SDQ, PUJ, STI, LRM et d’autres aéroports de République dominicaine.",
    vip: "Service VIP",
    privateTitle: "Transport privé",
    privateDescription:
      "Service personnalisé pour les couples, familles, groupes, cadres et clients professionnels.",
    experiences: "Expériences",
    destinationsTitle: "Destinations touristiques",
    destinationsDescription:
      "Punta Cana, Saint-Domingue, La Romana, Bayahíbe et de nombreuses autres destinations du pays.",
  },

  de: {
    eyebrow: "Unsere Services",
    title: "Reisen Sie komfortabel. Wir kümmern uns um den Rest.",
    description:
      "Privater Transport für Sicherheit, Pünktlichkeit, Komfort und ein erstklassiges Erlebnis.",
    airports: "Flughäfen",
    airportTitle: "Flughafentransfers",
    airportDescription:
      "Private Abholung und Transfers von SDQ, PUJ, STI, LRM und weiteren Flughäfen der Dominikanischen Republik.",
    vip: "VIP-Service",
    privateTitle: "Privater Transport",
    privateDescription:
      "Persönlicher Service für Paare, Familien, Gruppen, Führungskräfte und Firmenkunden.",
    experiences: "Erlebnisse",
    destinationsTitle: "Touristische Reiseziele",
    destinationsDescription:
      "Punta Cana, Santo Domingo, La Romana, Bayahíbe und viele weitere Reiseziele im Land.",
  },

  it: {
    eyebrow: "I nostri servizi",
    title: "Viaggia comodamente. Al resto pensiamo noi.",
    description:
      "Trasporto privato pensato per offrire sicurezza, puntualità, comfort e un'esperienza di alto livello.",
    airports: "Aeroporti",
    airportTitle: "Trasferimenti aeroportuali",
    airportDescription:
      "Prelievo e trasferimento privato da SDQ, PUJ, STI, LRM e altri aeroporti della Repubblica Dominicana.",
    vip: "Servizio VIP",
    privateTitle: "Trasporto privato",
    privateDescription:
      "Servizio personalizzato per coppie, famiglie, gruppi, dirigenti e clienti aziendali.",
    experiences: "Esperienze",
    destinationsTitle: "Destinazioni turistiche",
    destinationsDescription:
      "Punta Cana, Santo Domingo, La Romana, Bayahíbe e molte altre destinazioni del paese.",
  },

  pt: {
    eyebrow: "Nossos serviços",
    title: "Viaje com conforto. Nós cuidamos do resto.",
    description:
      "Transporte privado pensado para oferecer segurança, pontualidade, conforto e uma experiência de alto nível.",
    airports: "Aeroportos",
    airportTitle: "Traslados de aeroporto",
    airportDescription:
      "Recolha e traslado privado a partir de SDQ, PUJ, STI, LRM e outros aeroportos da República Dominicana.",
    vip: "Serviço VIP",
    privateTitle: "Transporte privado",
    privateDescription:
      "Serviço personalizado para casais, famílias, grupos, executivos e clientes corporativos.",
    experiences: "Experiências",
    destinationsTitle: "Destinos turísticos",
    destinationsDescription:
      "Punta Cana, Santo Domingo, La Romana, Bayahíbe e muitos outros destinos do país.",
  },

  ja: {
    eyebrow: "サービス",
    title: "快適な旅を。あとは私たちにお任せください。",
    description:
      "安全性、時間厳守、快適さ、そして上質な体験を提供するプライベート送迎サービスです。",
    airports: "空港",
    airportTitle: "空港送迎",
    airportDescription:
      "SDQ、PUJ、STI、LRMをはじめ、ドミニカ共和国各地の空港からプライベート送迎をご利用いただけます。",
    vip: "VIPサービス",
    privateTitle: "プライベート送迎",
    privateDescription:
      "カップル、ご家族、グループ、ビジネスのお客様向けの個別送迎サービスです。",
    experiences: "体験",
    destinationsTitle: "観光地",
    destinationsDescription:
      "プンタ・カナ、サントドミンゴ、ラ・ロマーナ、バヤイベなど、国内各地へ送迎いたします。",
  },
};

const destinationsUi = {
  es: {
    eyebrow: "Explora",
    title: "Destinos populares",
  },
  en: {
    eyebrow: "Explore",
    title: "Popular destinations",
  },
  fr: {
    eyebrow: "Explorez",
    title: "Destinations populaires",
  },
  de: {
    eyebrow: "Entdecken",
    title: "Beliebte Reiseziele",
  },
  it: {
    eyebrow: "Esplora",
    title: "Destinazioni popolari",
  },
  pt: {
    eyebrow: "Explore",
    title: "Destinos populares",
  },
  ja: {
    eyebrow: "探索",
    title: "人気の目的地",
  },
};

const fleetUi = {
  es: {
    eyebrow: "Nuestra flota",
    title: "Vehículos para cada tipo de viaje.",
    description:
      "Transporte cómodo y seguro para clientes individuales, familias y grupos.",
    sedanDescription:
      "Elegancia y comodidad para viajes privados de 1 a 3 pasajeros.",
    minivanDescription:
      "Confort y espacio para familias y grupos de hasta 6 pasajeros.",
    vanDescription:
      "Espacio, seguridad y comodidad para grupos de hasta 12 pasajeros.",
  },

  en: {
    eyebrow: "Our fleet",
    title: "Vehicles for every type of trip.",
    description:
      "Comfortable and safe transportation for individuals, families and groups.",
    sedanDescription:
      "Elegance and comfort for private trips of 1 to 3 passengers.",
    minivanDescription:
      "Comfort and space for families and groups of up to 6 passengers.",
    vanDescription:
      "Space, safety and comfort for groups of up to 12 passengers.",
  },

  fr: {
    eyebrow: "Notre flotte",
    title: "Des véhicules pour chaque type de trajet.",
    description:
      "Transport confortable et sûr pour les particuliers, les familles et les groupes.",
    sedanDescription:
      "Élégance et confort pour les trajets privés de 1 à 3 passagers.",
    minivanDescription:
      "Confort et espace pour les familles et les groupes jusqu’à 6 passagers.",
    vanDescription:
      "Espace, sécurité et confort pour les groupes jusqu’à 12 passagers.",
  },

  de: {
    eyebrow: "Unsere Flotte",
    title: "Fahrzeuge für jede Art von Reise.",
    description:
      "Komfortabler und sicherer Transport für Einzelreisende, Familien und Gruppen.",
    sedanDescription:
      "Eleganz und Komfort für private Fahrten mit 1 bis 3 Passagieren.",
    minivanDescription:
      "Komfort und Platz für Familien und Gruppen mit bis zu 6 Passagieren.",
    vanDescription:
      "Platz, Sicherheit und Komfort für Gruppen mit bis zu 12 Passagieren.",
  },

  it: {
    eyebrow: "La nostra flotta",
    title: "Veicoli per ogni tipo di viaggio.",
    description:
      "Trasporto comodo e sicuro per viaggiatori, famiglie e gruppi.",
    sedanDescription:
      "Eleganza e comfort per viaggi privati da 1 a 3 passeggeri.",
    minivanDescription:
      "Comfort e spazio per famiglie e gruppi fino a 6 passeggeri.",
    vanDescription:
      "Spazio, sicurezza e comfort per gruppi fino a 12 passeggeri.",
  },

  pt: {
    eyebrow: "Nossa frota",
    title: "Veículos para cada tipo de viagem.",
    description:
      "Transporte confortável e seguro para viajantes, famílias e grupos.",
    sedanDescription:
      "Elegância e conforto para viagens privadas de 1 a 3 passageiros.",
    minivanDescription:
      "Conforto e espaço para famílias e grupos de até 6 passageiros.",
    vanDescription:
      "Espaço, segurança e conforto para grupos de até 12 passageiros.",
  },

  ja: {
    eyebrow: "車両ラインナップ",
    title: "あらゆる旅に対応する車両。",
    description:
      "お一人様、ご家族、グループに快適で安全な送迎をご提供します。",
    sedanDescription:
      "1〜3名様のプライベート移動に最適な、上質で快適なセダンです。",
    minivanDescription:
      "最大6名様のご家族やグループに快適で広々とした空間をご提供します。",
    vanDescription:
      "最大12名様のグループに十分なスペース、安全性、快適さをご提供します。",
  },
};

const reviewsUi = {
  es: {
    eyebrow: "Opiniones",
    title: "Lo que dicen nuestros clientes",
    description:
      "Tu experiencia es importante para nosotros. Comparte tu opinión sobre nuestro servicio.",
    previousReview: "Opinión anterior",
    nextReview: "Siguiente opinión",
    viewReview: "Ver opinión",
    firstReview: "Sé el primero en compartir tu experiencia.",
    leaveReview: "Déjanos tu opinión",
    formDescription:
      "Cuéntanos cómo fue tu experiencia con VIP Tourist Transfer.",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    rating: "Tu calificación",
    stars: "estrellas",
    comment: "Comentario",
    commentPlaceholder: "Escribe aquí tu experiencia...",
    sending: "Enviando...",
    publish: "Publicar opinión",
    moderation: "Las opiniones son revisadas antes de publicarse.",
  },

  en: {
    eyebrow: "Reviews",
    title: "What our customers say",
    description:
      "Your experience is important to us. Share your opinion about our service.",
    previousReview: "Previous review",
    nextReview: "Next review",
    viewReview: "View review",
    firstReview: "Be the first to share your experience.",
    leaveReview: "Leave us a review",
    formDescription:
      "Tell us about your experience with VIP Tourist Transfer.",
    name: "Name",
    namePlaceholder: "Your name",
    rating: "Your rating",
    stars: "stars",
    comment: "Comment",
    commentPlaceholder: "Write about your experience here...",
    sending: "Sending...",
    publish: "Publish review",
    moderation: "Reviews are checked before being published.",
  },

  fr: {
    eyebrow: "Avis",
    title: "Ce que disent nos clients",
    description:
      "Votre expérience est importante pour nous. Partagez votre avis sur notre service.",
    previousReview: "Avis précédent",
    nextReview: "Avis suivant",
    viewReview: "Voir l’avis",
    firstReview: "Soyez le premier à partager votre expérience.",
    leaveReview: "Laissez-nous votre avis",
    formDescription:
      "Parlez-nous de votre expérience avec VIP Tourist Transfer.",
    name: "Nom",
    namePlaceholder: "Votre nom",
    rating: "Votre note",
    stars: "étoiles",
    comment: "Commentaire",
    commentPlaceholder: "Décrivez votre expérience ici...",
    sending: "Envoi...",
    publish: "Publier l’avis",
    moderation: "Les avis sont vérifiés avant leur publication.",
  },

  de: {
    eyebrow: "Bewertungen",
    title: "Was unsere Kunden sagen",
    description:
      "Ihre Erfahrung ist uns wichtig. Teilen Sie Ihre Meinung über unseren Service.",
    previousReview: "Vorherige Bewertung",
    nextReview: "Nächste Bewertung",
    viewReview: "Bewertung anzeigen",
    firstReview: "Teilen Sie als Erster Ihre Erfahrung.",
    leaveReview: "Hinterlassen Sie eine Bewertung",
    formDescription:
      "Erzählen Sie uns von Ihrer Erfahrung mit VIP Tourist Transfer.",
    name: "Name",
    namePlaceholder: "Ihr Name",
    rating: "Ihre Bewertung",
    stars: "Sterne",
    comment: "Kommentar",
    commentPlaceholder: "Beschreiben Sie hier Ihre Erfahrung...",
    sending: "Wird gesendet...",
    publish: "Bewertung veröffentlichen",
    moderation: "Bewertungen werden vor der Veröffentlichung geprüft.",
  },

  it: {
    eyebrow: "Recensioni",
    title: "Cosa dicono i nostri clienti",
    description:
      "La tua esperienza è importante per noi. Condividi la tua opinione sul nostro servizio.",
    previousReview: "Recensione precedente",
    nextReview: "Recensione successiva",
    viewReview: "Visualizza recensione",
    firstReview: "Sii il primo a condividere la tua esperienza.",
    leaveReview: "Lasciaci una recensione",
    formDescription:
      "Raccontaci la tua esperienza con VIP Tourist Transfer.",
    name: "Nome",
    namePlaceholder: "Il tuo nome",
    rating: "La tua valutazione",
    stars: "stelle",
    comment: "Commento",
    commentPlaceholder: "Scrivi qui la tua esperienza...",
    sending: "Invio...",
    publish: "Pubblica recensione",
    moderation: "Le recensioni vengono controllate prima della pubblicazione.",
  },

  pt: {
    eyebrow: "Avaliações",
    title: "O que nossos clientes dizem",
    description:
      "Sua experiência é importante para nós. Compartilhe sua opinião sobre nosso serviço.",
    previousReview: "Avaliação anterior",
    nextReview: "Próxima avaliação",
    viewReview: "Ver avaliação",
    firstReview: "Seja o primeiro a compartilhar sua experiência.",
    leaveReview: "Deixe sua avaliação",
    formDescription:
      "Conte-nos como foi sua experiência com a VIP Tourist Transfer.",
    name: "Nome",
    namePlaceholder: "Seu nome",
    rating: "Sua avaliação",
    stars: "estrelas",
    comment: "Comentário",
    commentPlaceholder: "Escreva aqui sua experiência...",
    sending: "Enviando...",
    publish: "Publicar avaliação",
    moderation: "As avaliações são revisadas antes da publicação.",
  },

  ja: {
    eyebrow: "口コミ",
    title: "お客様の声",
    description:
      "お客様の体験をぜひお聞かせください。サービスについての口コミをお待ちしています。",
    previousReview: "前の口コミ",
    nextReview: "次の口コミ",
    viewReview: "口コミを見る",
    firstReview: "最初の口コミを投稿してください。",
    leaveReview: "口コミを投稿する",
    formDescription:
      "VIP Tourist Transferをご利用いただいた感想をお聞かせください。",
    name: "お名前",
    namePlaceholder: "お名前",
    rating: "評価",
    stars: "つ星",
    comment: "コメント",
    commentPlaceholder: "ご利用いただいた感想をご記入ください...",
    sending: "送信中...",
    publish: "口コミを投稿",
    moderation: "口コミは確認後に公開されます。",
  },
};

const tripadvisorUi = {
  es: {
    title: "También estamos en Tripadvisor",
    description:
      "Conoce nuestro perfil de VIP TOURIST TRANSFERS en Tripadvisor y descubre más sobre nuestros servicios de transporte turístico en República Dominicana.",
    button: "Ver en Tripadvisor →",
  },

  en: {
    title: "We are also on Tripadvisor",
    description:
      "Visit our VIP TOURIST TRANSFERS profile on Tripadvisor and discover more about our tourist transportation services in the Dominican Republic.",
    button: "View on Tripadvisor →",
  },

  fr: {
    title: "Nous sommes également sur Tripadvisor",
    description:
      "Découvrez notre profil VIP TOURIST TRANSFERS sur Tripadvisor et apprenez-en plus sur nos services de transport touristique en République dominicaine.",
    button: "Voir sur Tripadvisor →",
  },

  de: {
    title: "Wir sind auch auf Tripadvisor",
    description:
      "Besuchen Sie unser Profil VIP TOURIST TRANSFERS auf Tripadvisor und erfahren Sie mehr über unsere touristischen Transportservices in der Dominikanischen Republik.",
    button: "Auf Tripadvisor ansehen →",
  },

  it: {
    title: "Siamo anche su Tripadvisor",
    description:
      "Visita il nostro profilo VIP TOURIST TRANSFERS su Tripadvisor e scopri di più sui nostri servizi di trasporto turistico nella Repubblica Dominicana.",
    button: "Vedi su Tripadvisor →",
  },

  pt: {
    title: "Também estamos no Tripadvisor",
    description:
      "Conheça nosso perfil VIP TOURIST TRANSFERS no Tripadvisor e descubra mais sobre nossos serviços de transporte turístico na República Dominicana.",
    button: "Ver no Tripadvisor →",
  },

  ja: {
    title: "Tripadvisorにも掲載されています",
    description:
      "TripadvisorでVIP TOURIST TRANSFERSのプロフィールをご覧いただき、ドミニカ共和国で提供している観光送迎サービスについて詳しくご確認ください。",
    button: "Tripadvisorで見る →",
  },
};

const contactUi = {
  es: {
    title: "¿Listo para tu próximo viaje?",
    description: "Seguridad, puntualidad y confort.",
    button: "Reservar ahora →",
    locationEyebrow: "Nuestra ubicación",
    locationTitle: "Encuéntranos en Santo Domingo",
    locationAddress:
      "Aeropuerto Internacional Las Américas (SDQ), Ruta 66, Punta Caucedo, Boca Chica, República Dominicana.",
    mapTitle: "Ubicación VIP Tourist Transfer",
    footerDescription:
      "Transporte privado y turístico con seguridad, puntualidad y confort en República Dominicana.",
    contact: "Contacto",
    followUs: "Síguenos",
    callAria: "Llamar a VIP Tourist Transfer",
    callTitle: "Llamar",
  },

  en: {
    title: "Ready for your next trip?",
    description: "Safety, punctuality and comfort.",
    button: "Book now →",
    locationEyebrow: "Our location",
    locationTitle: "Find us in Santo Domingo",
    locationAddress:
      "Las Américas International Airport (SDQ), Route 66, Punta Caucedo, Boca Chica, Dominican Republic.",
    mapTitle: "VIP Tourist Transfer location",
    footerDescription:
      "Private and tourist transportation with safety, punctuality and comfort throughout the Dominican Republic.",
    contact: "Contact",
    followUs: "Follow us",
    callAria: "Call VIP Tourist Transfer",
    callTitle: "Call",
  },

  fr: {
    title: "Prêt pour votre prochain voyage ?",
    description: "Sécurité, ponctualité et confort.",
    button: "Réserver maintenant →",
    locationEyebrow: "Notre emplacement",
    locationTitle: "Retrouvez-nous à Saint-Domingue",
    locationAddress:
      "Aéroport international Las Américas (SDQ), Route 66, Punta Caucedo, Boca Chica, République dominicaine.",
    mapTitle: "Emplacement de VIP Tourist Transfer",
    footerDescription:
      "Transport privé et touristique avec sécurité, ponctualité et confort en République dominicaine.",
    contact: "Contact",
    followUs: "Suivez-nous",
    callAria: "Appeler VIP Tourist Transfer",
    callTitle: "Appeler",
  },

  de: {
    title: "Bereit für Ihre nächste Reise?",
    description: "Sicherheit, Pünktlichkeit und Komfort.",
    button: "Jetzt buchen →",
    locationEyebrow: "Unser Standort",
    locationTitle: "Finden Sie uns in Santo Domingo",
    locationAddress:
      "Internationaler Flughafen Las Américas (SDQ), Route 66, Punta Caucedo, Boca Chica, Dominikanische Republik.",
    mapTitle: "Standort von VIP Tourist Transfer",
    footerDescription:
      "Privater und touristischer Transport mit Sicherheit, Pünktlichkeit und Komfort in der Dominikanischen Republik.",
    contact: "Kontakt",
    followUs: "Folgen Sie uns",
    callAria: "VIP Tourist Transfer anrufen",
    callTitle: "Anrufen",
  },

  it: {
    title: "Pronto per il tuo prossimo viaggio?",
    description: "Sicurezza, puntualità e comfort.",
    button: "Prenota ora →",
    locationEyebrow: "La nostra posizione",
    locationTitle: "Trovaci a Santo Domingo",
    locationAddress:
      "Aeroporto Internazionale Las Américas (SDQ), Route 66, Punta Caucedo, Boca Chica, Repubblica Dominicana.",
    mapTitle: "Posizione di VIP Tourist Transfer",
    footerDescription:
      "Trasporto privato e turistico con sicurezza, puntualità e comfort nella Repubblica Dominicana.",
    contact: "Contatti",
    followUs: "Seguici",
    callAria: "Chiama VIP Tourist Transfer",
    callTitle: "Chiama",
  },

  pt: {
    title: "Pronto para sua próxima viagem?",
    description: "Segurança, pontualidade e conforto.",
    button: "Reservar agora →",
    locationEyebrow: "Nossa localização",
    locationTitle: "Encontre-nos em Santo Domingo",
    locationAddress:
      "Aeroporto Internacional Las Américas (SDQ), Rota 66, Punta Caucedo, Boca Chica, República Dominicana.",
    mapTitle: "Localização da VIP Tourist Transfer",
    footerDescription:
      "Transporte privado e turístico com segurança, pontualidade e conforto na República Dominicana.",
    contact: "Contato",
    followUs: "Siga-nos",
    callAria: "Ligar para VIP Tourist Transfer",
    callTitle: "Ligar",
  },

  ja: {
    title: "次の旅の準備はできましたか？",
    description: "安全、時間厳守、快適な移動を。",
    button: "今すぐ予約 →",
    locationEyebrow: "所在地",
    locationTitle: "サントドミンゴでお待ちしています",
    locationAddress:
      "ラス・アメリカス国際空港（SDQ）、ルート66、プンタ・カウセド、ボカ・チカ、ドミニカ共和国。",
    mapTitle: "VIP Tourist Transferの所在地",
    footerDescription:
      "ドミニカ共和国で、安全・時間厳守・快適なプライベート観光送迎サービスを提供しています。",
    contact: "お問い合わせ",
    followUs: "フォローする",
    callAria: "VIP Tourist Transferに電話",
    callTitle: "電話する",
  },
};

const handleCancelReservation = async () => {
  const code = manageReservationCode.trim().toUpperCase();
  const email = manageReservationEmail.trim().toLowerCase();
  const reason = cancellationReason.trim();

  setCancellationMessage("");

  if (!code || !email) {
    setCancellationMessage(cancellationMessages[language].dataRequired);
    return;
  }

  if (!reason) {
    setCancellationMessage(cancellationMessages[language].reasonRequired);
    return;
  }


setCancellationLoading(true);

try {
  const response = await fetch("/api/cancel-reservation", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    code,
    email,
    reason,
  }),
});

const result = await response.json();

if (!response.ok || !result.ok) {
  setCancellationMessage(
  result.message || cancellationMessages[language].cancelError
);
  return;
}

setCancellationMessage(
  result.message || cancellationMessages[language].cancelSuccess
);

setCancellationSuccess(true);

setManageReservationCode("");
setManageReservationEmail("");
setCancellationReason("");

  } catch (error) {
    console.error("Error cancelando reserva:", error);
   setCancellationMessage(
  cancellationMessages[language].unexpectedError
);
  } finally {
    setCancellationLoading(false);
  }
};

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

type Language =
  | "es"
  | "en"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "ja";

const [language, setLanguage] = useState<Language>("es");

useEffect(() => {
  const savedLanguage = window.localStorage.getItem(
    "vip-language"
  ) as Language | null;

  if (
    savedLanguage === "es" ||
    savedLanguage === "en" ||
    savedLanguage === "fr" ||
    savedLanguage === "de" ||
    savedLanguage === "it" ||
    savedLanguage === "pt" ||
    savedLanguage === "ja"
  ) {
    setLanguage(savedLanguage);
    return;
  }

  const browserLanguage = navigator.language.toLowerCase();

  if (browserLanguage.startsWith("es")) {
    setLanguage("es");
  } else if (browserLanguage.startsWith("fr")) {
    setLanguage("fr");
  } else if (browserLanguage.startsWith("de")) {
    setLanguage("de");
  } else if (browserLanguage.startsWith("it")) {
    setLanguage("it");
  } else if (browserLanguage.startsWith("pt")) {
    setLanguage("pt");
  } else if (browserLanguage.startsWith("ja")) {
    setLanguage("ja");
  } else {
    setLanguage("en");
  }
}, []);

const changeLanguage = (newLanguage: Language) => {
  setLanguage(newLanguage);
  window.localStorage.setItem("vip-language", newLanguage);
};

const t = {
  es: {
    pickup: "Punto de recogida",
    destination: "Destino",
    search: "Buscar traslado",
    language: "Idioma",
    home: "Inicio",
    services: "Servicios",
    destinations: "Destinos",
    fleet: "Flota",
    reviews: "Opiniones",
    contact: "Contacto",
    myReservations: "Mis reservas",
    logout: "Cerrar sesión",
    login: "Iniciar sesión",
    createAccount: "Crear cuenta",
    bookNow: "Reservar ahora",
    menu: "Menú",
    bookTransfer: "Reserva tu traslado",
    accountRegisterDescription: "Crea tu cuenta para gestionar tus viajes y reservas.",
    accountLoginDescription: "Accede a tu cuenta para continuar.",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    processing: "Procesando...",
    createMyAccount: "Crear mi cuenta",
    alreadyHaveAccount: "¿Ya tienes cuenta? Inicia sesión",
    noAccount: "¿No tienes cuenta? Crear cuenta",
    close: "Cerrar",

    myReservationsDescription: "Consulta y gestiona los viajes asociados a tu cuenta.",
    loadingReservations: "Cargando tus reservas...",
    noReservations: "Todavía no tienes reservas asociadas a esta cuenta.",
    reservationCode: "Código de reserva",
    noCode: "Sin código",
    total: "Total",
    unspecified: "No especificado",
    dateAndTime: "Fecha y hora",
    vehicle: "Vehículo",
    passengers: "Pasajeros",
    passenger: "Pasajero",
    tripType: "Tipo de viaje",
    roundTrip: "Ida y vuelta",
    oneWay: "Solo ida",
    manageReservation: "Gestionar reserva",

    cancellationPolicy: "Política de cancelación",
    acceptCancellationPolicy: "He leído y acepto la",
    understood: "Entendido",
    manageReservationDescription: "Introduce los datos utilizados al realizar tu reservación.",
    reservationCodePlaceholder: "Código de reserva (Ej: VIP-123456)",
    reservationEmail: "Correo electrónico de la reserva",
    cancellationReason: "Motivo de la cancelación",
    cancellationSuccess: "Reserva cancelada correctamente",
    processingCancellation: "Procesando cancelación...",
    cancelReservation: "Cancelar mi reserva",

    heroCountry: "República Dominicana",
    largeLuggage: "Maletas grandes",
    carryOnLuggage: "Equipaje de mano",
    travelDate: "Fecha del viaje",
    travelTime: "Hora del viaje",
    returnDate: "Fecha de regreso",
    returnTime: "Hora de regreso",
    flightNumber: "Número de vuelo",

    executiveSedan: "Sedán Ejecutivo",
    premiumMinivan: "Minivan Premium",
    executiveVan: "Van Ejecutiva",

    previousReview: "Opinión anterior",
    nextReview: "Siguiente opinión",
    firstReview: "Sé el primero en compartir tu experiencia.",
    leaveReview: "Déjanos tu opinión",
    reviewDescription: "Cuéntanos cómo fue tu experiencia con VIP Tourist Transfer.",
    name: "Nombre",
    yourName: "Tu nombre",
    yourRating: "Tu calificación",
    comment: "Comentario",
    commentPlaceholder: "Escribe aquí tu experiencia...",
    sending: "Enviando...",
    publishReview: "Publicar opinión",
    reviewsModerated: "Las opiniones son revisadas antes de publicarse.",

    alsoTripadvisor: "También estamos en Tripadvisor",
    viewTripadvisor: "Ver en Tripadvisor",

    readyNextTrip: "¿Listo para tu próximo viaje?",
    safetyComfort: "Seguridad, puntualidad y confort.",
    ourLocation: "Nuestra ubicación",
    findUs: "Encuéntranos en Santo Domingo",
    footerDescription: "Transporte privado y turístico con seguridad, puntualidad y confort en República Dominicana.",
    followUs: "Síguenos",
    rightsReserved: "Todos los derechos reservados.",
  },

  en: {
    pickup: "Pickup location",
    destination: "Destination",
    search: "Search transfer",
    language: "Language",
    home: "Home",
    services: "Services",
    destinations: "Destinations",
    fleet: "Fleet",
    reviews: "Reviews",
    contact: "Contact",
    myReservations: "My reservations",
    logout: "Log out",
    login: "Log in",
    createAccount: "Create account",
    bookNow: "Book now",
    menu: "Menu",
    bookTransfer: "Book your transfer",
    accountRegisterDescription: "Create your account to manage your trips and reservations.",
    accountLoginDescription: "Log in to your account to continue.",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    processing: "Processing...",
    createMyAccount: "Create my account",
    alreadyHaveAccount: "Already have an account? Log in",
    noAccount: "Don't have an account? Create one",
    close: "Close",

    myReservationsDescription: "View and manage the trips associated with your account.",
    loadingReservations: "Loading your reservations...",
    noReservations: "You don't have any reservations associated with this account yet.",
    reservationCode: "Reservation code",
    noCode: "No code",
    total: "Total",
    unspecified: "Not specified",
    dateAndTime: "Date and time",
    vehicle: "Vehicle",
    passengers: "Passengers",
    passenger: "Passenger",
    tripType: "Trip type",
    roundTrip: "Round trip",
    oneWay: "One way",
    manageReservation: "Manage reservation",
    cancellationPolicy: "Cancellation policy",
    acceptCancellationPolicy: "I have read and accept the",
    understood: "Understood",
    manageReservationDescription: "Enter the information used when making your reservation.",
    reservationCodePlaceholder: "Reservation code (Example: VIP-123456)",
    reservationEmail: "Reservation email",
    cancellationReason: "Reason for cancellation",
    cancellationSuccess: "Reservation cancelled successfully",
    processingCancellation: "Processing cancellation...",
    cancelReservation: "Cancel my reservation",

    heroCountry: "Dominican Republic",
    largeLuggage: "Large luggage",
    carryOnLuggage: "Carry-on luggage",
    travelDate: "Travel date",
    travelTime: "Travel time",
    returnDate: "Return date",
    returnTime: "Return time",
    flightNumber: "Flight number",

    executiveSedan: "Executive Sedan",
    premiumMinivan: "Premium Minivan",
    executiveVan: "Executive Van",

    previousReview: "Previous review",
    nextReview: "Next review",
    firstReview: "Be the first to share your experience.",
    leaveReview: "Leave us a review",
    reviewDescription: "Tell us about your experience with VIP Tourist Transfer.",
    name: "Name",
    yourName: "Your name",
    yourRating: "Your rating",
    comment: "Comment",
    commentPlaceholder: "Write about your experience here...",
    sending: "Sending...",
    publishReview: "Publish review",
    reviewsModerated: "Reviews are checked before being published.",

    alsoTripadvisor: "We're also on Tripadvisor",
    viewTripadvisor: "View on Tripadvisor",

    readyNextTrip: "Ready for your next trip?",
    safetyComfort: "Safety, punctuality and comfort.",
    ourLocation: "Our location",
    findUs: "Find us in Santo Domingo",
    footerDescription: "Private and tourist transportation with safety, punctuality and comfort in the Dominican Republic.",
    followUs: "Follow us",
    rightsReserved: "All rights reserved.",
  },

  fr: {
    pickup: "Lieu de prise en charge",
    destination: "Destination",
    search: "Rechercher un transfert",
    language: "Langue",
    home: "Accueil",
    services: "Services",
    destinations: "Destinations",
    fleet: "Flotte",
    reviews: "Avis",
    contact: "Contact",
    myReservations: "Mes réservations",
    logout: "Se déconnecter",
    login: "Se connecter",
    createAccount: "Créer un compte",
    bookNow: "Réserver",
    menu: "Menu",
    bookTransfer: "Réservez votre transfert",
    accountRegisterDescription: "Créez votre compte pour gérer vos trajets et réservations.",
    accountLoginDescription: "Connectez-vous à votre compte pour continuer.",
    fullName: "Nom complet",
    email: "E-mail",
    password: "Mot de passe",
    processing: "Traitement...",
    createMyAccount: "Créer mon compte",
    alreadyHaveAccount: "Vous avez déjà un compte ? Connectez-vous",
    noAccount: "Vous n'avez pas de compte ? Créez-en un",
    close: "Fermer",

    myReservationsDescription: "Consultez et gérez les trajets associés à votre compte.",
    loadingReservations: "Chargement de vos réservations...",
    noReservations: "Vous n'avez encore aucune réservation associée à ce compte.",
    reservationCode: "Code de réservation",
    noCode: "Aucun code",
    total: "Total",
    unspecified: "Non spécifié",
    dateAndTime: "Date et heure",
    vehicle: "Véhicule",
    passengers: "Passagers",
    passenger: "Passager",
    tripType: "Type de trajet",
    roundTrip: "Aller-retour",
    oneWay: "Aller simple",
    manageReservation: "Gérer la réservation",
    cancellationPolicy: "Politique d'annulation",
    acceptCancellationPolicy: "J’ai lu et j’accepte la",
    understood: "Compris",
    manageReservationDescription: "Saisissez les informations utilisées lors de votre réservation.",
    reservationCodePlaceholder: "Code de réservation (Ex. : VIP-123456)",
    reservationEmail: "E-mail de la réservation",
    cancellationReason: "Motif de l'annulation",
    cancellationSuccess: "Réservation annulée avec succès",
    processingCancellation: "Annulation en cours...",
    cancelReservation: "Annuler ma réservation",

    heroCountry: "République dominicaine",
    largeLuggage: "Grandes valises",
    carryOnLuggage: "Bagages à main",
    travelDate: "Date du voyage",
    travelTime: "Heure du voyage",
    returnDate: "Date de retour",
    returnTime: "Heure de retour",
    flightNumber: "Numéro de vol",

    executiveSedan: "Berline Executive",
    premiumMinivan: "Minivan Premium",
    executiveVan: "Van Executive",

    previousReview: "Avis précédent",
    nextReview: "Avis suivant",
    firstReview: "Soyez le premier à partager votre expérience.",
    leaveReview: "Laissez-nous votre avis",
    reviewDescription: "Racontez-nous votre expérience avec VIP Tourist Transfer.",
    name: "Nom",
    yourName: "Votre nom",
    yourRating: "Votre note",
    comment: "Commentaire",
    commentPlaceholder: "Décrivez votre expérience ici...",
    sending: "Envoi...",
    publishReview: "Publier l'avis",
    reviewsModerated: "Les avis sont vérifiés avant leur publication.",

    alsoTripadvisor: "Nous sommes aussi sur Tripadvisor",
    viewTripadvisor: "Voir sur Tripadvisor",

    readyNextTrip: "Prêt pour votre prochain voyage ?",
    safetyComfort: "Sécurité, ponctualité et confort.",
    ourLocation: "Notre emplacement",
    findUs: "Retrouvez-nous à Saint-Domingue",
    footerDescription: "Transport privé et touristique avec sécurité, ponctualité et confort en République dominicaine.",
    followUs: "Suivez-nous",
    rightsReserved: "Tous droits réservés.",
  },

  de: {
    pickup: "Abholort",
    destination: "Ziel",
    search: "Transfer suchen",
    language: "Sprache",
    home: "Startseite",
    services: "Services",
    destinations: "Reiseziele",
    fleet: "Flotte",
    reviews: "Bewertungen",
    contact: "Kontakt",
    myReservations: "Meine Buchungen",
    logout: "Abmelden",
    login: "Anmelden",
    createAccount: "Konto erstellen",
    bookNow: "Jetzt buchen",
    menu: "Menü",
    bookTransfer: "Transfer buchen",
    accountRegisterDescription: "Erstellen Sie Ihr Konto, um Ihre Fahrten und Reservierungen zu verwalten.",
    accountLoginDescription: "Melden Sie sich bei Ihrem Konto an, um fortzufahren.",
    fullName: "Vollständiger Name",
    email: "E-Mail",
    password: "Passwort",
    processing: "Wird verarbeitet...",
    createMyAccount: "Mein Konto erstellen",
    alreadyHaveAccount: "Sie haben bereits ein Konto? Anmelden",
    noAccount: "Noch kein Konto? Konto erstellen",
    close: "Schließen",

    myReservationsDescription: "Sehen und verwalten Sie die mit Ihrem Konto verbundenen Fahrten.",
    loadingReservations: "Ihre Buchungen werden geladen...",
    noReservations: "Mit diesem Konto sind noch keine Buchungen verbunden.",
    reservationCode: "Buchungscode",
    noCode: "Kein Code",
    total: "Gesamt",
    unspecified: "Nicht angegeben",
    dateAndTime: "Datum und Uhrzeit",
    vehicle: "Fahrzeug",
    passengers: "Passagiere",
    passenger: "Passagier",
    tripType: "Reiseart",
    roundTrip: "Hin- und Rückfahrt",
    oneWay: "Einfache Fahrt",
    manageReservation: "Buchung verwalten",
    cancellationPolicy: "Stornierungsbedingungen",
    acceptCancellationPolicy: "Ich habe die Stornierungsbedingungen gelesen und akzeptiere sie",
    understood: "Verstanden",
    manageReservationDescription: "Geben Sie die bei der Buchung verwendeten Daten ein.",
    reservationCodePlaceholder: "Buchungscode (z. B. VIP-123456)",
    reservationEmail: "E-Mail der Buchung",
    cancellationReason: "Grund der Stornierung",
    cancellationSuccess: "Buchung erfolgreich storniert",
    processingCancellation: "Stornierung wird bearbeitet...",
    cancelReservation: "Meine Buchung stornieren",

    heroCountry: "Dominikanische Republik",
    largeLuggage: "Großes Gepäck",
    carryOnLuggage: "Handgepäck",
    travelDate: "Reisedatum",
    travelTime: "Reisezeit",
    returnDate: "Rückreisedatum",
    returnTime: "Rückreisezeit",
    flightNumber: "Flugnummer",

    executiveSedan: "Executive-Limousine",
    premiumMinivan: "Premium-Minivan",
    executiveVan: "Executive-Van",

    previousReview: "Vorherige Bewertung",
    nextReview: "Nächste Bewertung",
    firstReview: "Teilen Sie als Erster Ihre Erfahrung.",
    leaveReview: "Bewerten Sie uns",
    reviewDescription: "Erzählen Sie uns von Ihrer Erfahrung mit VIP Tourist Transfer.",
    name: "Name",
    yourName: "Ihr Name",
    yourRating: "Ihre Bewertung",
    comment: "Kommentar",
    commentPlaceholder: "Beschreiben Sie hier Ihre Erfahrung...",
    sending: "Wird gesendet...",
    publishReview: "Bewertung veröffentlichen",
    reviewsModerated: "Bewertungen werden vor der Veröffentlichung geprüft.",

    alsoTripadvisor: "Wir sind auch auf Tripadvisor",
    viewTripadvisor: "Auf Tripadvisor ansehen",

    readyNextTrip: "Bereit für Ihre nächste Reise?",
    safetyComfort: "Sicherheit, Pünktlichkeit und Komfort.",
    ourLocation: "Unser Standort",
    findUs: "Finden Sie uns in Santo Domingo",
    footerDescription: "Privater und touristischer Transport mit Sicherheit, Pünktlichkeit und Komfort in der Dominikanischen Republik.",
    followUs: "Folgen Sie uns",
    rightsReserved: "Alle Rechte vorbehalten.",
  },

  it: {
    pickup: "Luogo di ritiro",
    destination: "Destinazione",
    search: "Cerca trasferimento",
    language: "Lingua",
    home: "Home",
    services: "Servizi",
    destinations: "Destinazioni",
    fleet: "Flotta",
    reviews: "Recensioni",
    contact: "Contatti",
    myReservations: "Le mie prenotazioni",
    logout: "Esci",
    login: "Accedi",
    createAccount: "Crea account",
    bookNow: "Prenota ora",
    menu: "Menu",
    bookTransfer: "Prenota il tuo trasferimento",
    accountRegisterDescription: "Crea il tuo account per gestire i tuoi viaggi e le tue prenotazioni.",
    accountLoginDescription: "Accedi al tuo account per continuare.",
    fullName: "Nome completo",
    email: "Email",
    password: "Password",
    processing: "Elaborazione...",
    createMyAccount: "Crea il mio account",
    alreadyHaveAccount: "Hai già un account? Accedi",
    noAccount: "Non hai un account? Creane uno",
    close: "Chiudi",

    myReservationsDescription: "Visualizza e gestisci i viaggi associati al tuo account.",
    loadingReservations: "Caricamento delle prenotazioni...",
    noReservations: "Non hai ancora prenotazioni associate a questo account.",
    reservationCode: "Codice di prenotazione",
    noCode: "Nessun codice",
    total: "Totale",
    unspecified: "Non specificato",
    dateAndTime: "Data e ora",
    vehicle: "Veicolo",
    passengers: "Passeggeri",
    passenger: "Passeggero",
    tripType: "Tipo di viaggio",
    roundTrip: "Andata e ritorno",
    oneWay: "Solo andata",
    manageReservation: "Gestisci prenotazione",
    cancellationPolicy: "Politica di cancellazione",
    acceptCancellationPolicy: "Ho letto e accetto la",
    understood: "Ho capito",
    manageReservationDescription: "Inserisci i dati utilizzati per effettuare la prenotazione.",
    reservationCodePlaceholder: "Codice di prenotazione (Es: VIP-123456)",
    reservationEmail: "Email della prenotazione",
    cancellationReason: "Motivo della cancellazione",
    cancellationSuccess: "Prenotazione cancellata con successo",
    processingCancellation: "Cancellazione in corso...",
    cancelReservation: "Cancella la mia prenotazione",

    heroCountry: "Repubblica Dominicana",
    largeLuggage: "Bagagli grandi",
    carryOnLuggage: "Bagaglio a mano",
    travelDate: "Data del viaggio",
    travelTime: "Ora del viaggio",
    returnDate: "Data di ritorno",
    returnTime: "Ora di ritorno",
    flightNumber: "Numero del volo",

    executiveSedan: "Berlina Executive",
    premiumMinivan: "Minivan Premium",
    executiveVan: "Van Executive",

    previousReview: "Recensione precedente",
    nextReview: "Recensione successiva",
    firstReview: "Sii il primo a condividere la tua esperienza.",
    leaveReview: "Lasciaci una recensione",
    reviewDescription: "Raccontaci la tua esperienza con VIP Tourist Transfer.",
    name: "Nome",
    yourName: "Il tuo nome",
    yourRating: "La tua valutazione",
    comment: "Commento",
    commentPlaceholder: "Scrivi qui la tua esperienza...",
    sending: "Invio...",
    publishReview: "Pubblica recensione",
    reviewsModerated: "Le recensioni vengono controllate prima della pubblicazione.",

    alsoTripadvisor: "Siamo anche su Tripadvisor",
    viewTripadvisor: "Vedi su Tripadvisor",

    readyNextTrip: "Pronto per il tuo prossimo viaggio?",
    safetyComfort: "Sicurezza, puntualità e comfort.",
    ourLocation: "La nostra posizione",
    findUs: "Trovaci a Santo Domingo",
    footerDescription: "Trasporto privato e turistico con sicurezza, puntualità e comfort nella Repubblica Dominicana.",
    followUs: "Seguici",
    rightsReserved: "Tutti i diritti riservati.",
  },

  pt: {
    pickup: "Local de recolha",
    destination: "Destino",
    search: "Pesquisar transferência",
    language: "Idioma",
    home: "Início",
    services: "Serviços",
    destinations: "Destinos",
    fleet: "Frota",
    reviews: "Avaliações",
    contact: "Contato",
    myReservations: "Minhas reservas",
    logout: "Sair",
    login: "Entrar",
    createAccount: "Criar conta",
    bookNow: "Reservar agora",
    menu: "Menu",
    bookTransfer: "Reserve o seu transfer",
    accountRegisterDescription: "Crie a sua conta para gerir as suas viagens e reservas.",
    accountLoginDescription: "Inicie sessão na sua conta para continuar.",
    fullName: "Nome completo",
    email: "E-mail",
    password: "Senha",
    processing: "Processando...",
    createMyAccount: "Criar minha conta",
    alreadyHaveAccount: "Já tem uma conta? Entre",
    noAccount: "Não tem uma conta? Crie uma",
    close: "Fechar",

    myReservationsDescription: "Consulte e gerencie as viagens associadas à sua conta.",
    loadingReservations: "Carregando suas reservas...",
    noReservations: "Você ainda não tem reservas associadas a esta conta.",
    reservationCode: "Código da reserva",
    noCode: "Sem código",
    total: "Total",
    unspecified: "Não especificado",
    dateAndTime: "Data e hora",
    vehicle: "Veículo",
    passengers: "Passageiros",
    passenger: "Passageiro",
    tripType: "Tipo de viagem",
    roundTrip: "Ida e volta",
    oneWay: "Somente ida",
    manageReservation: "Gerenciar reserva",
    cancellationPolicy: "Política de cancelamento",
    acceptCancellationPolicy: "Li e aceito a",
    understood: "Entendido",
    manageReservationDescription: "Insira os dados utilizados ao fazer sua reserva.",
    reservationCodePlaceholder: "Código da reserva (Ex.: VIP-123456)",
    reservationEmail: "E-mail da reserva",
    cancellationReason: "Motivo do cancelamento",
    cancellationSuccess: "Reserva cancelada com sucesso",
    processingCancellation: "Processando cancelamento...",
    cancelReservation: "Cancelar minha reserva",

    heroCountry: "República Dominicana",
    largeLuggage: "Bagagem grande",
    carryOnLuggage: "Bagagem de mão",
    travelDate: "Data da viagem",
    travelTime: "Hora da viagem",
    returnDate: "Data de retorno",
    returnTime: "Hora de retorno",
    flightNumber: "Número do voo",

    executiveSedan: "Sedã Executivo",
    premiumMinivan: "Minivan Premium",
    executiveVan: "Van Executiva",

    previousReview: "Avaliação anterior",
    nextReview: "Próxima avaliação",
    firstReview: "Seja o primeiro a compartilhar sua experiência.",
    leaveReview: "Deixe sua avaliação",
    reviewDescription: "Conte-nos como foi sua experiência com a VIP Tourist Transfer.",
    name: "Nome",
    yourName: "Seu nome",
    yourRating: "Sua avaliação",
    comment: "Comentário",
    commentPlaceholder: "Escreva aqui sua experiência...",
    sending: "Enviando...",
    publishReview: "Publicar avaliação",
    reviewsModerated: "As avaliações são revisadas antes da publicação.",

    alsoTripadvisor: "Também estamos no Tripadvisor",
    viewTripadvisor: "Ver no Tripadvisor",

    readyNextTrip: "Pronto para sua próxima viagem?",
    safetyComfort: "Segurança, pontualidade e conforto.",
    ourLocation: "Nossa localização",
    findUs: "Encontre-nos em Santo Domingo",
    footerDescription: "Transporte privado e turístico com segurança, pontualidade e conforto na República Dominicana.",
    followUs: "Siga-nos",
    rightsReserved: "Todos os direitos reservados.",
  },

  ja: {
    pickup: "お迎え場所",
    destination: "目的地",
    search: "送迎を検索",
    language: "言語",
    home: "ホーム",
    services: "サービス",
    destinations: "目的地",
    fleet: "車両",
    reviews: "口コミ",
    contact: "お問い合わせ",
    myReservations: "予約一覧",
    logout: "ログアウト",
    login: "ログイン",
    createAccount: "アカウント作成",
    bookNow: "今すぐ予約",
    menu: "メニュー",
    bookTransfer: "送迎を予約",
    accountRegisterDescription: "アカウントを作成して、旅行や予約を管理できます。",
    accountLoginDescription: "続行するにはアカウントにログインしてください。",
    fullName: "氏名",
    email: "メールアドレス",
    password: "パスワード",
    processing: "処理中...",
    createMyAccount: "アカウントを作成",
    alreadyHaveAccount: "すでにアカウントをお持ちですか？ログイン",
    noAccount: "アカウントをお持ちでないですか？作成する",
    close: "閉じる",

    myReservationsDescription: "アカウントに関連付けられた旅行を確認・管理できます。",
    loadingReservations: "予約を読み込んでいます...",
    noReservations: "このアカウントに関連付けられた予約はまだありません。",
    reservationCode: "予約コード",
    noCode: "コードなし",
    total: "合計",
    unspecified: "未指定",
    dateAndTime: "日時",
    vehicle: "車両",
    passengers: "乗客",
    passenger: "乗客",
    tripType: "旅行タイプ",
    roundTrip: "往復",
    oneWay: "片道",
    manageReservation: "予約を管理",
    cancellationPolicy: "キャンセルポリシー",
    acceptCancellationPolicy: "以下を読み、同意します：",
    understood: "了解",
    manageReservationDescription: "予約時に使用した情報を入力してください。",
    reservationCodePlaceholder: "予約コード（例：VIP-123456）",
    reservationEmail: "予約時のメールアドレス",
    cancellationReason: "キャンセル理由",
    cancellationSuccess: "予約は正常にキャンセルされました",
    processingCancellation: "キャンセル処理中...",
    cancelReservation: "予約をキャンセル",

    heroCountry: "ドミニカ共和国",
    largeLuggage: "大型荷物",
    carryOnLuggage: "機内持ち込み手荷物",
    travelDate: "旅行日",
    travelTime: "出発時刻",
    returnDate: "帰りの日付",
    returnTime: "帰りの時刻",
    flightNumber: "便名",

    executiveSedan: "エグゼクティブセダン",
    premiumMinivan: "プレミアムミニバン",
    executiveVan: "エグゼクティブバン",

    previousReview: "前の口コミ",
    nextReview: "次の口コミ",
    firstReview: "最初の口コミを投稿してください。",
    leaveReview: "口コミを投稿",
    reviewDescription: "VIP Tourist Transferをご利用いただいた感想をお聞かせください。",
    name: "名前",
    yourName: "お名前",
    yourRating: "評価",
    comment: "コメント",
    commentPlaceholder: "体験についてご記入ください...",
    sending: "送信中...",
    publishReview: "口コミを投稿",
    reviewsModerated: "口コミは公開前に確認されます。",

    alsoTripadvisor: "Tripadvisorにも掲載されています",
    viewTripadvisor: "Tripadvisorで見る",

    readyNextTrip: "次の旅行の準備はできましたか？",
    safetyComfort: "安全、時間厳守、快適さ。",
    ourLocation: "所在地",
    findUs: "サントドミンゴでお待ちしています",
    footerDescription: "ドミニカ共和国で、安全・時間厳守・快適なプライベート観光送迎サービスを提供しています。",
    followUs: "フォローする",
    rightsReserved: "無断転載を禁じます。",
  },
};

const text = t[language];

const extra = {
  es: {
    tripSummary: "Resumen del viaje",
    pending: "Pendiente",
    roundTripTotalPrice: "Precio total ida y vuelta",
    transferTotalPrice: "Precio total del traslado",
    calculatingFare: "Calculando tarifa...",
    checkingDistance: "Estamos verificando la distancia de tu traslado.",
    fareUnavailable: "Tarifa no disponible automáticamente",
    selectSearchSuggestions:
      "Selecciona el punto de recogida y el destino desde las sugerencias de búsqueda.",
    pickupPlaceholder: "Ciudad, hotel, aeropuerto o dirección",
    destinationPlaceholder: "¿Adónde quieres ir?",
    calculatingRoute: "Calculando ruta...",
    selectTime: "Selecciona una hora",
    returnTripDetails: "Datos del viaje de regreso",
    viewServices: "Ver servicios",
safety: "Seguridad",
guaranteed: "Garantizada",
vehicles: "Vehículos",
premium: "Premium",
support: "Atención",
available247: "24/7",
  },

  en: {
    tripSummary: "Trip summary",
    pending: "Pending",
    roundTripTotalPrice: "Round-trip total price",
    transferTotalPrice: "Transfer total price",
    calculatingFare: "Calculating fare...",
    checkingDistance: "We are checking the distance of your transfer.",
    fareUnavailable: "Fare not automatically available",
    selectSearchSuggestions:
      "Select the pickup location and destination from the search suggestions.",
    pickupPlaceholder: "City, hotel, airport or address",
    destinationPlaceholder: "Where do you want to go?",
    calculatingRoute: "Calculating route...",
    selectTime: "Select a time",
    returnTripDetails: "Return trip details",
    viewServices: "View services",
safety: "Safety",
guaranteed: "Guaranteed",
vehicles: "Vehicles",
premium: "Premium",
support: "Support",
available247: "24/7",
  },

  fr: {
    tripSummary: "Résumé du trajet",
    pending: "En attente",
    roundTripTotalPrice: "Prix total aller-retour",
    transferTotalPrice: "Prix total du transfert",
    calculatingFare: "Calcul du tarif...",
    checkingDistance: "Nous vérifions la distance de votre transfert.",
    fareUnavailable: "Tarif non disponible automatiquement",
    selectSearchSuggestions:
      "Sélectionnez le lieu de prise en charge et la destination dans les suggestions de recherche.",
    pickupPlaceholder: "Ville, hôtel, aéroport ou adresse",
    destinationPlaceholder: "Où souhaitez-vous aller ?",
    calculatingRoute: "Calcul de l’itinéraire...",
    selectTime: "Sélectionnez une heure",
    returnTripDetails: "Détails du trajet retour",
    viewServices: "Voir les services",
safety: "Sécurité",
guaranteed: "Garantie",
vehicles: "Véhicules",
premium: "Premium",
support: "Assistance",
available247: "24/7",
  },

  de: {
    tripSummary: "Zusammenfassung der Fahrt",
    pending: "Ausstehend",
    roundTripTotalPrice: "Gesamtpreis für Hin- und Rückfahrt",
    transferTotalPrice: "Gesamtpreis des Transfers",
    calculatingFare: "Tarif wird berechnet...",
    checkingDistance: "Wir überprüfen die Entfernung Ihres Transfers.",
    fareUnavailable: "Tarif nicht automatisch verfügbar",
    selectSearchSuggestions:
      "Wählen Sie Abholort und Ziel aus den Suchvorschlägen aus.",
    pickupPlaceholder: "Stadt, Hotel, Flughafen oder Adresse",
    destinationPlaceholder: "Wohin möchten Sie fahren?",
    calculatingRoute: "Route wird berechnet...",
    selectTime: "Uhrzeit auswählen",
    returnTripDetails: "Details zur Rückfahrt",
    viewServices: "Services ansehen",
safety: "Sicherheit",
guaranteed: "Garantiert",
vehicles: "Fahrzeuge",
premium: "Premium",
support: "Betreuung",
available247: "24/7",
  },

  it: {
    tripSummary: "Riepilogo del viaggio",
    pending: "In attesa",
    roundTripTotalPrice: "Prezzo totale andata e ritorno",
    transferTotalPrice: "Prezzo totale del trasferimento",
    calculatingFare: "Calcolo della tariffa...",
    checkingDistance: "Stiamo verificando la distanza del tuo trasferimento.",
    fareUnavailable: "Tariffa non disponibile automaticamente",
    selectSearchSuggestions:
      "Seleziona il luogo di ritiro e la destinazione dai suggerimenti di ricerca.",
    pickupPlaceholder: "Città, hotel, aeroporto o indirizzo",
    destinationPlaceholder: "Dove vuoi andare?",
    calculatingRoute: "Calcolo del percorso...",
    selectTime: "Seleziona un orario",
    returnTripDetails: "Dettagli del viaggio di ritorno",
    viewServices: "Vedi servizi",
safety: "Sicurezza",
guaranteed: "Garantita",
vehicles: "Veicoli",
premium: "Premium",
support: "Assistenza",
available247: "24/7",
  },

  pt: {
    tripSummary: "Resumo da viagem",
    pending: "Pendente",
    roundTripTotalPrice: "Preço total de ida e volta",
    transferTotalPrice: "Preço total do transfer",
    calculatingFare: "Calculando tarifa...",
    checkingDistance: "Estamos verificando a distância do seu transfer.",
    fareUnavailable: "Tarifa não disponível automaticamente",
    selectSearchSuggestions:
      "Selecione o local de recolha e o destino nas sugestões de pesquisa.",
    pickupPlaceholder: "Cidade, hotel, aeroporto ou endereço",
    destinationPlaceholder: "Para onde você quer ir?",
    calculatingRoute: "Calculando rota...",
    selectTime: "Selecione um horário",
    returnTripDetails: "Dados da viagem de volta",
    viewServices: "Ver serviços",
safety: "Segurança",
guaranteed: "Garantida",
vehicles: "Veículos",
premium: "Premium",
support: "Atendimento",
available247: "24/7",
  },

  ja: {
    tripSummary: "旅行概要",
    pending: "保留中",
    roundTripTotalPrice: "往復の合計料金",
    transferTotalPrice: "送迎の合計料金",
    calculatingFare: "料金を計算中...",
    checkingDistance: "送迎距離を確認しています。",
    fareUnavailable: "料金を自動計算できません",
    selectSearchSuggestions:
      "検索候補からお迎え場所と目的地を選択してください。",
    pickupPlaceholder: "都市、ホテル、空港、または住所",
    destinationPlaceholder: "目的地はどちらですか？",
    calculatingRoute: "ルートを計算中...",
    selectTime: "時間を選択",
    returnTripDetails: "帰りの旅行情報",
    viewServices: "サービスを見る",
safety: "安全",
guaranteed: "保証",
vehicles: "車両",
premium: "プレミアム",
support: "サポート",
available247: "24時間年中無休",
  },
}[language];

const pageText = {
  es: {
    heroLine1: "Tu viaje",
    heroLine2: "comienza",
    heroLine3: "con nosotros.",
    heroDescription:
      "Traslados privados desde aeropuertos, hoteles y destinos turísticos con seguridad, puntualidad y confort.",
    whereGoing: "¿A dónde vamos?",
    completeTripData: "Completa los datos de tu viaje.",
    manageCancel: "Gestionar / Cancelar una reserva",
    reservationConfirmed: "Reserva confirmada",
    thanksBooking: "Gracias por reservar con VIP Tourist Transfer.",
bookAnother: "Hacer otra reserva",
code: "Código",
customerName: "Nombre",
pickupLabel: "Recogida",
destinationLabel: "Destino",
passengersLabel: "Pasajeros",
largeLuggageLabel: "Maletas grandes",
carryOnLabel: "Equipaje de mano",
dateLabel: "Fecha",
timeLabel: "Hora",
emailLabel: "Correo",
phoneLabel: "Teléfono",
vehicleLabel: "Vehículo",
paymentMethod: "Forma de pago",
cardPayPal: "Tarjeta / PayPal",
cashDriver: "Efectivo al conductor",
  },

  en: {
    heroLine1: "Your journey",
    heroLine2: "starts",
    heroLine3: "with us.",
    heroDescription:
      "Private transfers from airports, hotels and tourist destinations with safety, punctuality and comfort.",
    whereGoing: "Where are we going?",
    completeTripData: "Complete your trip details.",
    manageCancel: "Manage / Cancel a reservation",
    reservationConfirmed: "Reservation confirmed",
    thanksBooking: "Thank you for booking with VIP Tourist Transfer.",
bookAnother: "Make another reservation",
code: "Code",
    customerName: "Name",
    pickupLabel: "Pickup",
    destinationLabel: "Destination",
    passengersLabel: "Passengers",
    largeLuggageLabel: "Large luggage",
    carryOnLabel: "Carry-on luggage",
    dateLabel: "Date",
    timeLabel: "Time",
    emailLabel: "Email",
    phoneLabel: "Phone",
    vehicleLabel: "Vehicle",
    paymentMethod: "Payment method",
    cardPayPal: "Card / PayPal",
    cashDriver: "Cash to driver",
  },

  fr: {
    heroLine1: "Votre voyage",
    heroLine2: "commence",
    heroLine3: "avec nous.",
    heroDescription:
      "Transferts privés depuis les aéroports, hôtels et destinations touristiques, avec sécurité, ponctualité et confort.",
    whereGoing: "Où allons-nous ?",
    completeTripData: "Complétez les informations de votre voyage.",
    manageCancel: "Gérer / Annuler une réservation",
    reservationConfirmed: "Réservation confirmée",
    thanksBooking: "Merci d'avoir réservé avec VIP Tourist Transfer.",
bookAnother: "Faire une autre réservation",
code: "Code",
    customerName: "Nom",
    pickupLabel: "Prise en charge",
    destinationLabel: "Destination",
    passengersLabel: "Passagers",
    largeLuggageLabel: "Grandes valises",
    carryOnLabel: "Bagages à main",
    dateLabel: "Date",
    timeLabel: "Heure",
    emailLabel: "E-mail",
    phoneLabel: "Téléphone",
    vehicleLabel: "Véhicule",
    paymentMethod: "Mode de paiement",
    cardPayPal: "Carte / PayPal",
    cashDriver: "Espèces au chauffeur",
  },

  de: {
    heroLine1: "Ihre Reise",
    heroLine2: "beginnt",
    heroLine3: "mit uns.",
    heroDescription:
      "Private Transfers von Flughäfen, Hotels und Reisezielen mit Sicherheit, Pünktlichkeit und Komfort.",
    whereGoing: "Wohin geht es?",
    completeTripData: "Vervollständigen Sie Ihre Reisedaten.",
    manageCancel: "Buchung verwalten / stornieren",
    reservationConfirmed: "Buchung bestätigt",
    thanksBooking: "Vielen Dank für Ihre Buchung bei VIP Tourist Transfer.",
bookAnother: "Eine weitere Buchung vornehmen",
code: "Code",
    customerName: "Name",
    pickupLabel: "Abholung",
    destinationLabel: "Ziel",
    passengersLabel: "Passagiere",
    largeLuggageLabel: "Großes Gepäck",
    carryOnLabel: "Handgepäck",
    dateLabel: "Datum",
    timeLabel: "Uhrzeit",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    vehicleLabel: "Fahrzeug",
    paymentMethod: "Zahlungsmethode",
    cardPayPal: "Karte / PayPal",
    cashDriver: "Barzahlung beim Fahrer",
  },

  it: {
    heroLine1: "Il tuo viaggio",
    heroLine2: "inizia",
    heroLine3: "con noi.",
    heroDescription:
      "Trasferimenti privati da aeroporti, hotel e destinazioni turistiche con sicurezza, puntualità e comfort.",
    whereGoing: "Dove andiamo?",
    completeTripData: "Completa i dati del tuo viaggio.",
    manageCancel: "Gestisci / Cancella una prenotazione",
    reservationConfirmed: "Prenotazione confermata",
    thanksBooking: "Grazie per aver prenotato con VIP Tourist Transfer.",
    bookAnother: "Effettua un'altra prenotazione",
        code: "Codice",
    customerName: "Nome",
    pickupLabel: "Ritiro",
    destinationLabel: "Destinazione",
    passengersLabel: "Passeggeri",
    largeLuggageLabel: "Bagagli grandi",
    carryOnLabel: "Bagaglio a mano",
    dateLabel: "Data",
    timeLabel: "Ora",
    emailLabel: "Email",
    phoneLabel: "Telefono",
    vehicleLabel: "Veicolo",
    paymentMethod: "Metodo di pagamento",
    cardPayPal: "Carta / PayPal",
    cashDriver: "Contanti al conducente",
  },

  pt: {
    heroLine1: "Sua viagem",
    heroLine2: "começa",
    heroLine3: "conosco.",
    heroDescription:
      "Transfers privados de aeroportos, hotéis e destinos turísticos com segurança, pontualidade e conforto.",
    whereGoing: "Para onde vamos?",
    completeTripData: "Complete os dados da sua viagem.",
    manageCancel: "Gerenciar / Cancelar uma reserva",
    reservationConfirmed: "Reserva confirmada",
    thanksBooking: "Obrigado por reservar com a VIP Tourist Transfer.",
    bookAnother: "Fazer outra reserva",
        code: "Código",
    customerName: "Nome",
    pickupLabel: "Recolha",
    destinationLabel: "Destino",
    passengersLabel: "Passageiros",
    largeLuggageLabel: "Bagagem grande",
    carryOnLabel: "Bagagem de mão",
    dateLabel: "Data",
    timeLabel: "Hora",
    emailLabel: "E-mail",
    phoneLabel: "Telefone",
    vehicleLabel: "Veículo",
    paymentMethod: "Forma de pagamento",
    cardPayPal: "Cartão / PayPal",
    cashDriver: "Dinheiro ao motorista",
  },

  ja: {
    heroLine1: "あなたの旅は",
    heroLine2: "ここから",
    heroLine3: "始まります。",
    heroDescription:
      "空港、ホテル、観光地から、安全・時間厳守・快適なプライベート送迎をご提供します。",
    whereGoing: "目的地はどちらですか？",
    completeTripData: "旅行情報を入力してください。",
    manageCancel: "予約の管理 / キャンセル",
    reservationConfirmed: "予約が確定しました",
    thanksBooking: "VIP Tourist Transferをご予約いただきありがとうございます。",
    bookAnother: "別の予約をする",
        code: "コード",
    customerName: "名前",
    pickupLabel: "お迎え場所",
    destinationLabel: "目的地",
    passengersLabel: "乗客",
    largeLuggageLabel: "大型荷物",
    carryOnLabel: "機内持ち込み手荷物",
    dateLabel: "日付",
    timeLabel: "時刻",
    emailLabel: "メール",
    phoneLabel: "電話番号",
    vehicleLabel: "車両",
    paymentMethod: "支払い方法",
    cardPayPal: "カード / PayPal",
    cashDriver: "ドライバーへ現金払い",
  },
}[language];

  type VehiclePrice = {
  sedan: number;
  suv: number;
  van: number;
};

const tariffPrices: Record<string, VehiclePrice> = {
  "La Isabela airport (JBQ)": { sedan: 70, suv: 90, van: 120 },
  "Arena Gorda": { sedan: 155, suv: 180, van: 290 },
  "Azua": { sedan: 180, suv: 200, van: 280 },
  "Bani": { sedan: 120, suv: 170, van: 270 },
  "Barahona": { sedan: 270, suv: 270, van: 270 },
  "Bavaro": { sedan: 170, suv: 180, van: 290 },
  "Bayaguana": { sedan: 120, suv: 155, van: 200 },
  "Bayahibe": { sedan: 140, suv: 150, van: 200 },
  "Boca Chica": { sedan: 60, suv: 70, van: 120 },
  "Bonao": { sedan: 160, suv: 170, van: 200 },
  "Buen Hombre": { sedan: 320, suv: 400, van: 500 },
  "Cabarete": { sedan: 240, suv: 307, van: 410 },
  "Cabrera": { sedan: 240, suv: 240, van: 240 },
  "Cap Cana": { sedan: 160, suv: 170, van: 290 },
  "Cayo Levantado": { sedan: 190, suv: 195, van: 310 },
  "Cofresi": { sedan: 262, suv: 307, van: 400 },
  "Constanza": { sedan: 190, suv: 200, van: 300 },
  "Consuelo": { sedan: 95, suv: 95, van: 95 },
  "Cotui": { sedan: 150, suv: 150, van: 150 },
  "El Cortecito": { sedan: 155, suv: 180, van: 290 },
  "El Portillo": { sedan: 195, suv: 205, van: 300 },
  "Gran Bahia Principe La Romana": { sedan: 115, suv: 120, van: 190 },
  "Gran Bahia Príncipe San Juan": { sedan: 190, suv: 280, van: 370 },
  "Higuey": { sedan: 130, suv: 160, van: 250 },
  "Jarabacoa": { sedan: 180, suv: 200, van: 240 },
  "Juan Dolio": { sedan: 60, suv: 65, van: 115 },
  "La Romana": { sedan: 115, suv: 120, van: 190 },
  "La Romana airport (LRM)": { sedan: 115, suv: 120, van: 190 },
  "La Romana cruise port": { sedan: 115, suv: 120, van: 190 },
  "La Vega": { sedan: 160, suv: 180, van: 245 },
  "Laguna Bavaro": { sedan: 155, suv: 180, van: 290 },
  "Las Galeras": { sedan: 220, suv: 280, van: 340 },
  "Las Terrenas": { sedan: 190, suv: 210, van: 320 },
  "Macao": { sedan: 155, suv: 180, van: 290 },
  "Miches": { sedan: 175, suv: 200, van: 300 },
  "Nagua": { sedan: 160, suv: 200, van: 280 },
  "Palmar de Ocoa": { sedan: 160, suv: 200, van: 270 },
  "Pedernales (Dominican Republic)": { sedan: 320, suv: 410, van: 510 },
  "Pedro Brand": { sedan: 85, suv: 100, van: 210 },
  "Playa del Cortecito": { sedan: 170, suv: 170, van: 170 },
  "Playa Dominicus": { sedan: 130, suv: 150, van: 250 },
  "Playa Dorada": { sedan: 240, suv: 260, van: 440 },
  "Playa Grande": { sedan: 215, suv: 220, van: 300 },
  "Playa La Sardina": { sedan: 100, suv: 120, van: 210 },
  "Puerto Plata": { sedan: 240, suv: 260, van: 440 },
  "Puerto Plata airport (POP)": { sedan: 240, suv: 260, van: 440 },
  "Puerto Plata Port": { sedan: 240, suv: 260, van: 440 },
  "Punta Bonita": { sedan: 190, suv: 210, van: 320 },
  "Punta Cana airport (PUJ)": { sedan: 155, suv: 180, van: 290 },
  "Punta Cana town": { sedan: 155, suv: 180, van: 290 },
  "Rio San Juan": { sedan: 215, suv: 220, van: 300 },
  "Sabana Grande de Boya": { sedan: 140, suv: 160, van: 210 },
  "Samana El Catey airport (AZS)": { sedan: 190, suv: 200, van: 320 },
  "Samana Peninsula": { sedan: 190, suv: 200, van: 320 },
  "San Cristobal (Dominican Republic)": { sedan: 100, suv: 140, van: 200 },
  "San Jose de Ocoa": { sedan: 160, suv: 180, van: 210 },
  "San Juan de La Maguana": { sedan: 260, suv: 300, van: 400 },
  "San Pedro de Macoris": { sedan: 80, suv: 90, van: 170 },
  "San Souci": { sedan: 60, suv: 60, van: 60 },
  "Santiago": { sedan: 170, suv: 190, van: 250 },
  "Santiago Cibao airport (STI)": { sedan: 170, suv: 190, van: 250 },
  "Santo Domingo": { sedan: 60, suv: 80, van: 120 },
  "Sosua": { sedan: 240, suv: 260, van: 440 },
  "Uvero Alto": { sedan: 190, suv: 210, van: 290 },
};

const normalizePlace = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[(),.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizedPickup = normalizePlace(pickup);
const normalizedDestination = normalizePlace(destination);

const sdqAliases = [
  "sdq",
  "aeropuerto internacional las americas",
  "aeropuerto las americas",
  "las americas international airport",
  "las americas",
  "punta caucedo",
];

const isSdqPickup = sdqAliases.some((alias) =>
  normalizedPickup.includes(alias)
);

const isSdqDestination = sdqAliases.some((alias) =>
  normalizedDestination.includes(alias)
);

const destinationAliases: Record<string, string[]> = {
  "La Isabela airport (JBQ)": [
    "la isabela airport",
    "aeropuerto la isabela",
    "aeropuerto internacional dr joaquin balaguer",
    "joaquin balaguer airport",
    "jbq",
  ],
  "Arena Gorda": ["arena gorda"],
  "Azua": ["azua"],
  "Bani": ["bani", "bani republica dominicana"],
  "Barahona": ["barahona"],
  "Bavaro": ["bavaro"],
  "Bayaguana": ["bayaguana"],
  "Bayahibe": ["bayahibe"],
  "Boca Chica": ["boca chica"],
  "Bonao": ["bonao"],
  "Buen Hombre": ["buen hombre"],
  "Cabarete": ["cabarete"],
  "Cabrera": ["cabrera"],
  "Cap Cana": ["cap cana"],
  "Cayo Levantado": ["cayo levantado"],
  "Cofresi": ["cofresi"],
  "Constanza": ["constanza"],
  "Consuelo": ["consuelo"],
  "Cotui": ["cotui"],
  "El Cortecito": ["el cortecito"],
  "El Portillo": ["el portillo"],
  "Gran Bahia Principe La Romana": [
    "gran bahia principe la romana",
    "bahia principe la romana",
  ],
  "Gran Bahia Príncipe San Juan": [
    "gran bahia principe san juan",
    "bahia principe san juan",
  ],
  "Higuey": ["higuey"],
  "Jarabacoa": ["jarabacoa"],
  "Juan Dolio": ["juan dolio"],
  "La Romana airport (LRM)": [
    "la romana international airport",
    "aeropuerto internacional la romana",
    "aeropuerto la romana",
    "lrm",
  ],
  "La Romana cruise port": [
    "la romana cruise port",
    "puerto de la romana",
    "la romana port",
  ],
  "La Romana": ["la romana"],
  "La Vega": ["la vega"],
  "Laguna Bavaro": ["laguna bavaro"],
  "Las Galeras": ["las galeras"],
  "Las Terrenas": ["las terrenas"],
  "Macao": ["macao"],
  "Miches": ["miches"],
  "Nagua": ["nagua"],
  "Palmar de Ocoa": ["palmar de ocoa"],
  "Pedernales (Dominican Republic)": ["pedernales"],
  "Pedro Brand": ["pedro brand"],
  "Playa del Cortecito": ["playa del cortecito"],
  "Playa Dominicus": ["playa dominicus", "dominicus"],
  "Playa Dorada": ["playa dorada"],
  "Playa Grande": ["playa grande"],
  "Playa La Sardina": ["playa la sardina"],
  "Puerto Plata airport (POP)": [
    "gregorio luperon international airport",
    "aeropuerto internacional gregorio luperon",
    "puerto plata airport",
    "pop",
  ],
  "Puerto Plata Port": [
    "puerto plata port",
    "puerto de puerto plata",
    "taino bay",
    "amber cove",
  ],
  "Puerto Plata": ["puerto plata"],
  "Punta Bonita": ["punta bonita"],
  "Punta Cana airport (PUJ)": [
    "punta cana international airport",
    "aeropuerto internacional de punta cana",
    "aeropuerto punta cana",
    "puj",
  ],
  "Punta Cana town": [
    "punta cana",
    "punta cana village",
  ],
  "Rio San Juan": ["rio san juan"],
  "Sabana Grande de Boya": ["sabana grande de boya"],
  "Samana El Catey airport (AZS)": [
    "samana el catey international airport",
    "el catey international airport",
    "aeropuerto internacional el catey",
    "aeropuerto el catey",
    "azs",
  ],
  "Samana Peninsula": [
    "samana",
    "santa barbara de samana",
    "peninsula de samana",
  ],
  "San Cristobal (Dominican Republic)": ["san cristobal"],
  "San Jose de Ocoa": ["san jose de ocoa"],
  "San Juan de La Maguana": ["san juan de la maguana"],
  "San Pedro de Macoris": ["san pedro de macoris"],
  "San Souci": ["san souci", "sans souci"],
  "Santiago Cibao airport (STI)": [
    "cibao international airport",
    "aeropuerto internacional del cibao",
    "aeropuerto del cibao",
    "sti",
  ],
  "Santiago": ["santiago", "santiago de los caballeros"],
  "Santo Domingo": [
    "santo domingo",
    "distrito nacional",
  ],
  "Sosua": ["sosua"],
  "Uvero Alto": ["uvero alto"],
};

const placeHasAlias = (place: string, alias: string) => {
  const normalizedAlias = normalizePlace(alias);

  if (/^[a-z0-9]{2,4}$/.test(normalizedAlias)) {
    return (` ${place} `).includes(` ${normalizedAlias} `);
  }

  return place.includes(normalizedAlias);
};

const tariffSearchPlace = isSdqDestination
  ? normalizedPickup
  : normalizedDestination;

const matchingTariff = Object.entries(destinationAliases)
  .flatMap(([tariffName, aliases]) =>
    aliases.map((alias) => ({
      tariffName,
      alias: normalizePlace(alias),
    }))
  )
  .filter(({ alias }) => placeHasAlias(tariffSearchPlace, alias))
  .sort((a, b) => b.alias.length - a.alias.length)[0];

const passengerNumber = parseInt(passengers, 10) || 0;
const totalLuggage = largeLuggage + carryOnLuggage;

// Capacidad máxima de cada vehículo.
const vehicleCapacity = {
  sedan: {
    passengers: 3,
    largeLuggage: 2,
    carryOnLuggage: 2,
    totalLuggage: 3,
  },
  suv: {
    passengers: 6,
    largeLuggage: 5,
    carryOnLuggage: 5,
    totalLuggage: 6,
  },
  van: {
    passengers: 12,
    largeLuggage: 10,
    carryOnLuggage: 10,
    totalLuggage: 12,
  },
} as const;

const sedanFits =
  passengerNumber <= vehicleCapacity.sedan.passengers &&
  largeLuggage <= vehicleCapacity.sedan.largeLuggage &&
  carryOnLuggage <= vehicleCapacity.sedan.carryOnLuggage &&
  totalLuggage <= vehicleCapacity.sedan.totalLuggage;

const minivanFits =
  passengerNumber <= vehicleCapacity.suv.passengers &&
  largeLuggage <= vehicleCapacity.suv.largeLuggage &&
  carryOnLuggage <= vehicleCapacity.suv.carryOnLuggage &&
  totalLuggage <= vehicleCapacity.suv.totalLuggage;

const vanFits =
  passengerNumber <= vehicleCapacity.van.passengers &&
  largeLuggage <= vehicleCapacity.van.largeLuggage &&
  carryOnLuggage <= vehicleCapacity.van.carryOnLuggage &&
  totalLuggage <= vehicleCapacity.van.totalLuggage;

const requiresCustomQuote = !vanFits;

const pricingVehicle: "sedan" | "suv" | "van" =
  selectedVehicle === "sedan" ||
  selectedVehicle === "suv" ||
  selectedVehicle === "van"
    ? selectedVehicle
    : sedanFits
    ? "sedan"
    : minivanFits
    ? "suv"
    : "van";

// ============================================================
// MOTOR NACIONAL DE PRECIOS - VIP TOURIST TRANSFER
// República Dominicana completa
// ============================================================

const distanceKm = (() => {
  if (!routeDistance) return 0;

  const parsed = parseFloat(
    routeDistance
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );

  return Number.isFinite(parsed) ? parsed : 0;
})();

// ============================================================
// 1. TARIFA OFICIAL DEL DUEÑO
// Se conserva cuando el viaje conecta con SDQ y existe
// una tarifa específica en el tarifario.
// ============================================================

const exactTariffPrice =
  (isSdqPickup || isSdqDestination) && matchingTariff
    ? tariffPrices[matchingTariff.tariffName]?.[pricingVehicle] ?? null
    : null;

// ============================================================
// 2. MOTOR AUTOMÁTICO NACIONAL
// Para cualquier ruta válida dentro de RD.
// ============================================================

const calculateNationalPrice = (
  km: number,
  vehicle: "sedan" | "suv" | "van"
): number | null => {
  if (!Number.isFinite(km) || km <= 0) {
    return null;
  }

  let sedanPrice: number;

  // Precio base progresivo según distancia real por carretera.
  // Los tramos están calibrados alrededor del tarifario
  // comercial existente de VIP Tourist Transfer.

  if (km <= 10) {
    sedanPrice = 40;
  } else if (km <= 20) {
    sedanPrice = 50;
  } else if (km <= 35) {
    sedanPrice = 60;
  } else if (km <= 50) {
    sedanPrice = 75;
  } else if (km <= 75) {
    sedanPrice = 95;
  } else if (km <= 100) {
    sedanPrice = 115;
  } else if (km <= 125) {
    sedanPrice = 135;
  } else if (km <= 150) {
    sedanPrice = 155;
  } else if (km <= 175) {
    sedanPrice = 175;
  } else if (km <= 200) {
    sedanPrice = 190;
  } else if (km <= 225) {
    sedanPrice = 210;
  } else if (km <= 250) {
    sedanPrice = 230;
  } else if (km <= 275) {
    sedanPrice = 250;
  } else if (km <= 300) {
    sedanPrice = 270;
  } else if (km <= 325) {
    sedanPrice = 290;
  } else if (km <= 350) {
    sedanPrice = 310;
  } else if (km <= 375) {
    sedanPrice = 330;
  } else if (km <= 400) {
    sedanPrice = 350;
  } else {
    sedanPrice =
      350 + Math.ceil((km - 400) / 25) * 20;
  }

  // Ajuste por categoría del vehículo.
  if (vehicle === "suv") {
    return Math.round(sedanPrice * 1.2);
  }

  if (vehicle === "van") {
    return Math.round(sedanPrice * 1.55);
  }

  return sedanPrice;
};

// ============================================================
// 3. CALCULAR PRECIO POR LA RUTA REAL
// ============================================================

const nationalDistancePrice =
  distanceKm > 0
    ? calculateNationalPrice(distanceKm, pricingVehicle)
    : null;

// ============================================================
// 4. DECIDIR QUÉ TARIFA UTILIZAR
//
// Ruta oficial SDQ <-> destino conocido:
// usa el tarifario.
//
// Cualquier otra combinación:
// usa distancia real.
// ============================================================

const calculatedPrice: number | null =
  exactTariffPrice !== null && exactTariffPrice > 0
    ? exactTariffPrice
    : nationalDistancePrice;

// ============================================================
// 5. VALIDAR CAPACIDAD
// ============================================================

const priceWithVehicles =
  !requiresCustomQuote &&
  calculatedPrice !== null &&
  calculatedPrice > 0
    ? calculatedPrice
    : null;

// ============================================================
// 6. IDA / IDA Y VUELTA
// ============================================================

const tripPrice =
  priceWithVehicles !== null && priceWithVehicles > 0
    ? tripType === "roundtrip"
      ? priceWithVehicles * 2
      : priceWithVehicles
    : null;

// ============================================================
// 7. APLICAR 6%
// ============================================================

const finalPrice =
  tripPrice !== null && tripPrice > 0
    ? (tripPrice * 1.06).toFixed(2)
    : "";

// ============================================================
// 8. ESTADO DEL PRECIO
// ============================================================

const priceReady =
  finalPrice !== "" &&
  Number.isFinite(Number(finalPrice)) &&
  Number(finalPrice) > 0;

const priceIsCalculating =
  Boolean(pickup && destination) &&
  !priceReady &&
  routeLoading;

const priceUnavailable =
  Boolean(pickup && destination) &&
  !priceReady &&
  !routeLoading &&
  distanceKm <= 0;

const passengerCount = parseInt(passengers, 10) || 0;

// ============================================================
// CAPACIDAD REAL DE LOS VEHÍCULOS
// ============================================================

// Sedán: máximo 3 pasajeros.
// Máximo 2 maletas grandes, 2 de mano y 3 piezas en total.
const sedanUnavailable =
  passengerCount > 3 ||
  largeLuggage > 2 ||
  carryOnLuggage > 2 ||
  largeLuggage + carryOnLuggage > 3;

// Minivan: máximo 6 pasajeros.
// Máximo 5 maletas grandes, 5 de mano y 6 piezas en total.
const minivanUnavailable =
  passengerCount > 6 ||
  largeLuggage > 5 ||
  carryOnLuggage > 5 ||
  largeLuggage + carryOnLuggage > 6;

// Van: máximo 12 pasajeros.
// Máximo 10 maletas grandes, 10 de mano y 12 piezas en total.
const vanUnavailable =
  passengerCount > 12 ||
  largeLuggage > 10 ||
  carryOnLuggage > 10 ||
  largeLuggage + carryOnLuggage > 12;


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
    subtitle: {
      es: "Playas y resorts",
      en: "Beaches and resorts",
      fr: "Plages et resorts",
      de: "Strände und Resorts",
      it: "Spiagge e resort",
      pt: "Praias e resorts",
      ja: "ビーチとリゾート",
    },
    image: "/images/punta-cana.jpg",
  },
  {
    name: "Santo Domingo",
    subtitle: {
      es: "Historia y ciudad",
      en: "History and city",
      fr: "Histoire et ville",
      de: "Geschichte und Stadt",
      it: "Storia e città",
      pt: "História e cidade",
      ja: "歴史と都市",
    },
    image: "/images/santo-domingo.jpg",
  },
  {
    name: "La Romana",
    subtitle: {
      es: "Marina y lujo",
      en: "Marina and luxury",
      fr: "Marina et luxe",
      de: "Yachthafen und Luxus",
      it: "Marina e lusso",
      pt: "Marina e luxo",
      ja: "マリーナとラグジュアリー",
    },
    image: "/images/la-romana.jpg",
  },
  {
    name: "Bayahíbe",
    subtitle: {
      es: "Caribe y excursiones",
      en: "Caribbean and excursions",
      fr: "Caraïbes et excursions",
      de: "Karibik und Ausflüge",
      it: "Caraibi ed escursioni",
      pt: "Caribe e excursões",
      ja: "カリブ海とツアー",
    },
    image: "/images/bayahibe.jpg",
  },
];
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {/* HEADER */}
<header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-xl">

  <div className="mx-auto flex max-w-[1500px] items-center justify-between px-3 py-2 lg:px-4">

    {/* LOGO */}
    <a
      href="#inicio"
      className="flex items-center"
      onClick={() => setMobileMenuOpen(false)}
    >
      <img
        src="/vip-logo-nuevo.png"
        alt="VIP Tourist Transfer"
        className="h-24 w-auto object-contain md:h-28 lg:h-32"
      />
    </a>

    {/* MENÚ NORMAL - COMPUTADORA */}
    <nav className="hidden items-center gap-8 text-sm font-bold text-zinc-700 lg:flex">
      <a href="#inicio" className="transition hover:text-red-600">
        {text.home}
      </a>

      <a href="#servicios" className="transition hover:text-red-600">
        {text.services}
      </a>

      <a href="#destinos" className="transition hover:text-red-600">
        {text.destinations}
      </a>

      <a href="#flota" className="transition hover:text-red-600">
        {text.fleet}
      </a>

      <a href="#opiniones" className="transition hover:text-red-600">
  {text.reviews}
</a>

      <a href="#contacto" className="transition hover:text-red-600">
        {text.contact}
      </a>
    </nav>

    {/* CUENTA Y RESERVA - COMPUTADORA */}
<div className="ml-5 hidden items-center gap-3 lg:flex">
  <div className="relative">
    <select
      value={language}
      onChange={(e) =>
        changeLanguage(e.target.value as Language)
      }
      aria-label={text.language}
      className="cursor-pointer rounded-full border border-zinc-300 bg-white px-3 py-2 text-xs font-black text-zinc-800 outline-none transition hover:border-red-600 focus:border-red-600"
    >
      <option value="es">🇪🇸 Español</option>
      <option value="en">🇺🇸 English</option>
      <option value="fr">🇫🇷 Français</option>
      <option value="de">🇩🇪 Deutsch</option>
      <option value="it">🇮🇹 Italiano</option>
      <option value="pt">🇵🇹 Português</option>
      <option value="ja">🇯🇵 日本語</option>
    </select>
  </div>

  {currentUserEmail ? (
    <>
      <span className="max-w-[120px] truncate text-xs font-bold text-zinc-600">
        {currentUserEmail}
      </span>

      <button
        type="button"
        onClick={handleMyReservations}
        className="whitespace-nowrap rounded-full bg-red-600 px-3 py-2 text-xs font-black text-white transition hover:bg-red-700"
      >
        {text.myReservations}
      </button>

      <button
        type="button"
        onClick={handleLogout}
        className="whitespace-nowrap rounded-full border border-zinc-300 px-3 py-2 text-xs font-black text-zinc-800 transition hover:border-red-600 hover:text-red-600"
      >
        {text.logout}
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={() => {
          setAuthMode("login");
          setAuthMessage("");
        }}
        className="whitespace-nowrap rounded-full border border-zinc-300 px-3 py-2 text-xs font-black text-zinc-800 transition hover:border-red-600 hover:text-red-600"
      >
        {text.login}
      </button>

      <button
        type="button"
        onClick={() => {
          setAuthMode("register");
          setAuthMessage("");
        }}
        className="whitespace-nowrap rounded-full bg-zinc-950 px-3 py-2 text-xs font-black text-white transition hover:bg-zinc-800"
      >
        {text.createAccount}
      </button>
    </>
  )}

  <a
    href="#reservar"
    className="whitespace-nowrap rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white shadow-lg transition hover:bg-red-700"
  >
    {text.bookNow}
  </a>

</div>

    {/* MENÚ ☰ - CELULAR Y TABLET */}
    <button
      type="button"
      onClick={() => setMobileMenuOpen((open) => !open)}
      className="flex items-center gap-3 text-lg font-black text-zinc-950 lg:hidden"
      aria-label={`${mobileMenuOpen ? text.close : text.menu}`}
      aria-expanded={mobileMenuOpen}
    >
      <span>{text.menu}</span>

      {mobileMenuOpen ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>

  </div>

  {/* MENÚ DESPLEGABLE - CELULAR */}
  {mobileMenuOpen && (
    <div className="border-t border-zinc-200 bg-white shadow-xl lg:hidden">

      <div className="mx-auto flex max-w-7xl flex-col px-5 py-4">

        <a
          href="#inicio"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-zinc-100 py-4 text-lg font-black text-zinc-900"
        >
          {text.home}
        </a>

        <a
          href="#servicios"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-zinc-100 py-4 text-lg font-black text-zinc-900"
        >
          {text.services}
        </a>

        <a
          href="#destinos"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-zinc-100 py-4 text-lg font-black text-zinc-900"
        >
          {text.destinations}
        </a>

        <a
          href="#flota"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-zinc-100 py-4 text-lg font-black text-zinc-900"
        >
          {text.fleet}
        </a>

        <a
  href="#opiniones"
  onClick={() => setMobileMenuOpen(false)}
  className="border-b border-zinc-100 py-4 text-lg font-black text-zinc-900"
>
  {text.reviews}
</a>

        <a
          href="#contacto"
          onClick={() => setMobileMenuOpen(false)}
          className="border-b border-zinc-100 py-4 text-lg font-black text-zinc-900"
        >
          {text.contact}
        </a>

        {/* IDIOMA - CELULAR */}
<div className="mt-5">
  <label className="mb-2 block text-sm font-black text-zinc-700">
    🌐 {text.language}
  </label>

  <select
    value={language}
    onChange={(e) =>
      changeLanguage(e.target.value as Language)
    }
    className="w-full cursor-pointer rounded-xl border border-zinc-300 bg-white px-4 py-4 font-bold text-zinc-900 outline-none transition focus:border-red-600"
  >
    <option value="es">🇪🇸 Español</option>
    <option value="en">🇺🇸 English</option>
    <option value="fr">🇫🇷 Français</option>
    <option value="de">🇩🇪 Deutsch</option>
    <option value="it">🇮🇹 Italiano</option>
    <option value="pt">🇵🇹 Português</option>
    <option value="ja">🇯🇵 日本語</option>
  </select>
</div>

        {/* CUENTA */}
        {currentUserEmail ? (
          <div className="mt-5">
            <p className="mb-3 break-all text-sm font-bold text-zinc-600">
              {currentUserEmail}
            </p>

            <button
  type="button"
  onClick={() => {
    setMobileMenuOpen(false);
    handleMyReservations();
  }}
  className="mb-3 w-full rounded-xl bg-red-600 px-5 py-4 font-black text-white transition hover:bg-red-700"
>
  {text.myReservations}
</button>

            <button
              type="button"
              onClick={async () => {
                await handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full rounded-xl border border-zinc-300 px-5 py-4 font-black text-zinc-900"
            >
              {text.logout}
            </button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthMessage("");
                setMobileMenuOpen(false);
              }}
              className="rounded-xl border border-zinc-300 px-3 py-4 text-sm font-black text-zinc-900"
            >
              {text.login}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthMessage("");
                setMobileMenuOpen(false);
              }}
              className="rounded-xl bg-zinc-950 px-3 py-4 text-sm font-black text-white"
            >
              {text.createAccount}
            </button>

          </div>
        )}

        {/* RESERVA SIN NECESIDAD DE CUENTA */}
        <a
          href="#reservar"
          onClick={() => setMobileMenuOpen(false)}
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-red-600 px-6 py-4 font-black text-white shadow-lg"
        >
          {text.bookNow}
        </a>

      </div>
    </div>
  )}

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
        aria-label={language === "es" ? "Cerrar" : language === "en" ? "Close" : language === "fr" ? "Fermer" : language === "de" ? "Schließen" : language === "it" ? "Chiudi" : language === "pt" ? "Fechar" : "閉じる"}
      >
        ×
      </button>

      <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">
        VIP Tourist Transfer
      </p>

      <h2 className="mt-3 text-3xl font-black text-zinc-950">
        {authMode === "register" ? text.createAccount : text.login}
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {authMode === "register"
          ? text.accountRegisterDescription
          : text.accountLoginDescription}
      </p>

      <div className="mt-7 space-y-4">

        {authMode === "register" && (
          <input
            type="text"
            placeholder={language === "es" ? "Nombre completo" : language === "en" ? "Full name" : language === "fr" ? "Nom complet" : language === "de" ? "Vollständiger Name" : language === "it" ? "Nome completo" : language === "pt" ? "Nome completo" : "氏名"}
            value={authName}
            onChange={(e) => setAuthName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
          />
        )}

        <input
          type="email"
          placeholder={language === "es" ? "Correo electrónico" : language === "en" ? "Email address" : language === "fr" ? "Adresse e-mail" : language === "de" ? "E-Mail-Adresse" : language === "it" ? "Indirizzo email" : language === "pt" ? "Endereço de e-mail" : "メールアドレス"}
          value={authEmail}
          onChange={(e) => setAuthEmail(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
        />

        <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder={language === "es" ? "Contraseña" : language === "en" ? "Password" : language === "fr" ? "Mot de passe" : language === "de" ? "Passwort" : language === "it" ? "Password" : language === "pt" ? "Senha" : "パスワード"}
    value={authPassword}
    onChange={(e) => setAuthPassword(e.target.value)}
    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 pr-14 outline-none transition focus:border-red-500"
  />

  <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-red-600"
  aria-label={showPassword
  ? (language === "es" ? "Ocultar contraseña" : language === "en" ? "Hide password" : language === "fr" ? "Masquer le mot de passe" : language === "de" ? "Passwort ausblenden" : language === "it" ? "Nascondi password" : language === "pt" ? "Ocultar senha" : "パスワードを隠す")
  : (language === "es" ? "Mostrar contraseña" : language === "en" ? "Show password" : language === "fr" ? "Afficher le mot de passe" : language === "de" ? "Passwort anzeigen" : language === "it" ? "Mostra password" : language === "pt" ? "Mostrar senha" : "パスワードを表示")}
  title={showPassword
  ? (language === "es" ? "Ocultar contraseña" : language === "en" ? "Hide password" : language === "fr" ? "Masquer le mot de passe" : language === "de" ? "Passwort ausblenden" : language === "it" ? "Nascondi password" : language === "pt" ? "Ocultar senha" : "パスワードを隠す")
  : (language === "es" ? "Mostrar contraseña" : language === "en" ? "Show password" : language === "fr" ? "Afficher le mot de passe" : language === "de" ? "Passwort anzeigen" : language === "it" ? "Mostra password" : language === "pt" ? "Mostrar senha" : "パスワードを表示")}
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

{/* MODAL MIS RESERVAS */}
{myReservationsOpen && (
  <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
    <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-9">

      <button
        type="button"
        onClick={() => setMyReservationsOpen(false)}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-black text-zinc-700 transition hover:bg-red-600 hover:text-white"
        aria-label={text.close}
      >
        ×
      </button>

      <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">
        VIP Tourist Transfer
      </p>

      <h2 className="mt-3 pr-12 text-3xl font-black text-zinc-950">
        {text.myReservations}
      </h2>

      <p className="mt-2 text-sm text-zinc-500">
        {text.myReservationsDescription}
      </p>

      {myReservationsLoading ? (
        <div className="py-12 text-center font-bold text-zinc-600">
          {text.loadingReservations}
        </div>
      ) : myReservationsError ? (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
          {myReservationsError}
        </div>
      ) : myReservations.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-zinc-100 p-8 text-center">
          <p className="font-black text-zinc-900">
            {text.noReservations}
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {myReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-red-600">
                    {text.reservationCode}
                  </p>

                  <p className="mt-1 text-xl font-black text-zinc-950">
                    {reservation.reservation_code || text.noCode}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm font-bold text-zinc-500">
                    {text.total}
                  </p>
                  <p className="text-2xl font-black text-zinc-950">
                    US${Number(reservation.amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 border-t border-zinc-100 pt-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400">
                    {text.pickup}
                  </p>
                  <p className="mt-1 font-bold text-zinc-800">
                    {reservation.pickup || text.unspecified}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400">
                    {text.destination}
                  </p>
                  <p className="mt-1 font-bold text-zinc-800">
                    {reservation.destination || text.unspecified}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400">
                    {text.dateAndTime}
                  </p>
                  <p className="mt-1 font-bold text-zinc-800">
                    {reservation.travel_date
  ? new Date(
      `${reservation.travel_date}T${reservation.travel_time || "00:00:00"}`
    ).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  : "—"}
{" · "}
{reservation.travel_time
  ? new Date(
      `2000-01-01T${reservation.travel_time}`
    ).toLocaleTimeString("es-DO", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  : ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400">
                    {text.vehicle}
                  </p>
                  <p className="mt-1 font-bold text-zinc-800">
                    {reservation.vehicle === "sedan"
                      ? text.executiveSedan
                      : reservation.vehicle === "suv"
                      ? text.premiumMinivan
                      : reservation.vehicle === "van"
                      ? text.executiveVan
                      : reservation.vehicle || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400">
                    {text.passengers}
                  </p>
                  <p className="mt-1 font-bold text-zinc-800">
                    {reservation.passengers ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-zinc-400">
                    {text.tripType}
                  </p>
                  <p className="mt-1 font-bold text-zinc-800">
                    {reservation.trip_type === "roundtrip"
  ? text.roundTrip
  : text.oneWay}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setManageReservationCode(
                    reservation.reservation_code || ""
                  );
                  setManageReservationEmail(
                    reservation.customer_email || currentUserEmail || ""
                  );
                  setCancellationReason("");
                  setCancellationMessage("");
                  setCancellationSuccess(false);
                  setMyReservationsOpen(false);
                  setManageReservationOpen(true);
                }}
                className="mt-5 w-full rounded-xl bg-zinc-950 px-5 py-3 font-black text-white transition hover:bg-red-600 md:w-auto"
              >
                {text.manageReservation}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}


{/* MODAL POLÍTICA DE CANCELACIÓN */}
{cancellationPolicyOpen && (
  <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
    <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl md:p-9">

      <button
        type="button"
        onClick={() => setCancellationPolicyOpen(false)}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-black text-zinc-700 transition hover:bg-red-600 hover:text-white"
        aria-label={text.close}
      >
        ×
      </button>

      <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">
        VIP Tourist Transfer
      </p>

      <h2 className="mt-3 pr-12 text-3xl font-black text-zinc-950">
        {text.cancellationPolicy}
      </h2>

      <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-600">

        {language === "es" && (
  <>
    <p>
      Entendemos que los planes de viaje pueden cambiar. Las cancelaciones
      realizadas con <strong>24 horas o más de anticipación</strong> a la
      hora programada del servicio podrán recibir un{" "}
      <strong>reembolso del 100% del valor del traslado</strong>.
    </p>

    <p>
      Las cancelaciones realizadas con{" "}
      <strong>menos de 24 horas de anticipación</strong> no serán reembolsables.
    </p>

    <p>
      En caso de <strong>no presentarse (No-Show)</strong> en el lugar y hora
      acordados, el servicio se considerará utilizado y no aplicará reembolso.
    </p>

    <p>
      Si un vuelo se retrasa o cambia de horario, el cliente deberá comunicarse
      con VIP Tourist Transfer tan pronto como sea posible. Los retrasos de
      vuelos confirmados no se considerarán automáticamente como una cancelación.
    </p>

    <p>
      Cuando corresponda un reembolso, será procesado al{" "}
      <strong>mismo método de pago utilizado para realizar la reserva</strong>.
      El tiempo para que aparezca reflejado dependerá del proveedor de pago o
      de la institución financiera.
    </p>

    <p>
      Para solicitar una cancelación, el cliente deberá proporcionar su{" "}
      <strong>código de reserva</strong> y los datos utilizados al realizar
      la reservación.
    </p>
  </>
)}

{language === "en" && (
  <>
    <p>
      We understand that travel plans can change. Cancellations made{" "}
      <strong>24 hours or more in advance</strong> of the scheduled service
      time may receive a{" "}
      <strong>100% refund of the transfer value</strong>.
    </p>

    <p>
      Cancellations made with{" "}
      <strong>less than 24 hours&apos; notice</strong> are non-refundable.
    </p>

    <p>
      In the event of a <strong>No-Show</strong> at the agreed place and time,
      the service will be considered used and no refund will apply.
    </p>

    <p>
      If a flight is delayed or its schedule changes, the customer must contact
      VIP Tourist Transfer as soon as possible. Confirmed flight delays will not
      automatically be considered a cancellation.
    </p>

    <p>
      When a refund applies, it will be processed to the{" "}
      <strong>same payment method used to make the reservation</strong>.
      The time required for the refund to appear will depend on the payment
      provider or financial institution.
    </p>

    <p>
      To request a cancellation, the customer must provide the{" "}
      <strong>reservation code</strong> and the information used when making
      the reservation.
    </p>
  </>
)}

{language === "fr" && (
  <>
    <p>
      Nous comprenons que les projets de voyage peuvent changer. Les annulations
      effectuées <strong>24 heures ou plus à l&apos;avance</strong> par rapport
      à l&apos;heure prévue du service peuvent bénéficier d&apos;un{" "}
      <strong>remboursement de 100 % de la valeur du transfert</strong>.
    </p>

    <p>
      Les annulations effectuées{" "}
      <strong>moins de 24 heures à l&apos;avance</strong> ne sont pas remboursables.
    </p>

    <p>
      En cas de <strong>non-présentation (No-Show)</strong> au lieu et à
      l&apos;heure convenus, le service sera considéré comme utilisé et aucun
      remboursement ne sera accordé.
    </p>

    <p>
      Si un vol est retardé ou si son horaire change, le client doit contacter
      VIP Tourist Transfer dès que possible. Les retards de vol confirmés ne
      seront pas automatiquement considérés comme une annulation.
    </p>

    <p>
      Lorsqu&apos;un remboursement est applicable, il sera effectué sur le{" "}
      <strong>même moyen de paiement utilisé pour effectuer la réservation</strong>.
      Le délai d&apos;apparition du remboursement dépendra du prestataire de
      paiement ou de l&apos;institution financière.
    </p>

    <p>
      Pour demander une annulation, le client doit fournir son{" "}
      <strong>code de réservation</strong> ainsi que les informations utilisées
      lors de la réservation.
    </p>
  </>
)}

{language === "de" && (
  <>
    <p>
      Wir verstehen, dass sich Reisepläne ändern können. Stornierungen, die{" "}
      <strong>mindestens 24 Stunden vor</strong> der geplanten Servicezeit
      vorgenommen werden, können eine{" "}
      <strong>Rückerstattung von 100 % des Transferpreises</strong> erhalten.
    </p>

    <p>
      Stornierungen mit{" "}
      <strong>weniger als 24 Stunden Vorlaufzeit</strong> sind nicht
      erstattungsfähig.
    </p>

    <p>
      Bei <strong>Nichterscheinen (No-Show)</strong> am vereinbarten Ort und
      zur vereinbarten Zeit gilt der Service als genutzt und es erfolgt keine
      Rückerstattung.
    </p>

    <p>
      Wenn sich ein Flug verspätet oder der Flugplan geändert wird, muss der
      Kunde VIP Tourist Transfer so schnell wie möglich kontaktieren.
      Bestätigte Flugverspätungen gelten nicht automatisch als Stornierung.
    </p>

    <p>
      Wenn eine Rückerstattung vorgesehen ist, wird sie über die{" "}
      <strong>gleiche Zahlungsmethode wie bei der Reservierung</strong>{" "}
      abgewickelt. Wie lange es dauert, bis die Rückerstattung sichtbar ist,
      hängt vom Zahlungsanbieter oder Finanzinstitut ab.
    </p>

    <p>
      Um eine Stornierung zu beantragen, muss der Kunde den{" "}
      <strong>Reservierungscode</strong> und die bei der Reservierung
      verwendeten Daten angeben.
    </p>
  </>
)}

{language === "it" && (
  <>
    <p>
      Comprendiamo che i programmi di viaggio possono cambiare. Le cancellazioni
      effettuate con <strong>almeno 24 ore di anticipo</strong> rispetto
      all&apos;orario previsto del servizio possono ricevere un{" "}
      <strong>rimborso del 100% del valore del trasferimento</strong>.
    </p>

    <p>
      Le cancellazioni effettuate con{" "}
      <strong>meno di 24 ore di anticipo</strong> non sono rimborsabili.
    </p>

    <p>
      In caso di <strong>mancata presentazione (No-Show)</strong> nel luogo e
      all&apos;orario concordati, il servizio sarà considerato utilizzato e
      non sarà previsto alcun rimborso.
    </p>

    <p>
      Se un volo subisce un ritardo o un cambio di orario, il cliente deve
      contattare VIP Tourist Transfer il prima possibile. I ritardi dei voli
      confermati non saranno automaticamente considerati una cancellazione.
    </p>

    <p>
      Quando è previsto un rimborso, verrà elaborato tramite lo{" "}
      <strong>stesso metodo di pagamento utilizzato per la prenotazione</strong>.
      Il tempo necessario affinché il rimborso risulti visibile dipenderà dal
      fornitore del pagamento o dall&apos;istituto finanziario.
    </p>

    <p>
      Per richiedere una cancellazione, il cliente deve fornire il proprio{" "}
      <strong>codice di prenotazione</strong> e i dati utilizzati al momento
      della prenotazione.
    </p>
  </>
)}

{language === "pt" && (
  <>
    <p>
      Entendemos que os planos de viagem podem mudar. Os cancelamentos feitos
      com <strong>24 horas ou mais de antecedência</strong> em relação ao
      horário programado do serviço poderão receber um{" "}
      <strong>reembolso de 100% do valor do transfer</strong>.
    </p>

    <p>
      Os cancelamentos realizados com{" "}
      <strong>menos de 24 horas de antecedência</strong> não são reembolsáveis.
    </p>

    <p>
      Em caso de <strong>não comparecimento (No-Show)</strong> no local e
      horário combinados, o serviço será considerado utilizado e não haverá
      reembolso.
    </p>

    <p>
      Se um voo atrasar ou tiver seu horário alterado, o cliente deverá entrar
      em contato com a VIP Tourist Transfer o mais rápido possível. Atrasos de
      voos confirmados não serão automaticamente considerados cancelamentos.
    </p>

    <p>
      Quando houver direito a reembolso, ele será processado pelo{" "}
      <strong>mesmo método de pagamento utilizado na reserva</strong>. O prazo
      para que o valor apareça dependerá do provedor de pagamento ou da
      instituição financeira.
    </p>

    <p>
      Para solicitar um cancelamento, o cliente deverá fornecer o{" "}
      <strong>código da reserva</strong> e os dados utilizados ao realizar
      a reserva.
    </p>
  </>
)}

{language === "ja" && (
  <>
    <p>
      旅行の予定が変更になる場合があることを理解しております。サービス予定時刻の
      <strong>24時間以上前</strong>にキャンセルされた場合、
      <strong>送迎料金の100％を返金</strong>いたします。
    </p>

    <p>
      サービス予定時刻まで<strong>24時間未満</strong>のキャンセルについては、
      返金の対象となりません。
    </p>

    <p>
      指定された場所と時間に<strong>お客様がお越しにならなかった場合（No-Show）</strong>、
      サービスは利用済みとみなされ、返金は行われません。
    </p>

    <p>
      フライトの遅延または時刻変更が発生した場合は、できるだけ早く
      VIP Tourist Transferまでご連絡ください。確認されたフライトの遅延は、
      自動的にキャンセルとはみなされません。
    </p>

    <p>
      返金が適用される場合は、
      <strong>予約時に使用したものと同じ支払い方法</strong>で処理されます。
      返金が反映されるまでの期間は、決済事業者または金融機関によって異なります。
    </p>

    <p>
      キャンセルを申請するには、
      <strong>予約コード</strong>と予約時に使用した情報をご提示いただく必要があります。
    </p>
  </>
)}

      </div>

      <button
        type="button"
        onClick={() => setCancellationPolicyOpen(false)}
        className="mt-7 w-full rounded-xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700"
      >
        {text.understood}
      </button>

    </div>
  </div>
)}

{/* MODAL GESTIONAR / CANCELAR RESERVA */}
{manageReservationOpen && (
  <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
    <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl md:p-9">

      <button
        type="button"
        onClick={() => {
  setManageReservationOpen(false);
  setCancellationMessage("");
  setCancellationSuccess(false);
  setManageReservationCode("");
  setManageReservationEmail("");
  setCancellationReason("");
}}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-black text-zinc-700 transition hover:bg-red-600 hover:text-white"
        aria-label={text.close}
      >
        ×
      </button>

      <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">
        VIP Tourist Transfer
      </p>

      <h2 className="mt-3 text-3xl font-black text-zinc-950">
        {text.manageReservation}
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {text.manageReservationDescription}
      </p>

      <div className="mt-7 space-y-4">
        <input
          type="text"
          placeholder={text.reservationCodePlaceholder}
          value={manageReservationCode}
          onChange={(e) =>
            setManageReservationCode(e.target.value.toUpperCase())
          }
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
        />

        <input
          type="email"
          placeholder={text.reservationEmail}
          value={manageReservationEmail}
          onChange={(e) => setManageReservationEmail(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
        />

        <textarea
          placeholder={text.cancellationReason}
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
        />

        {cancellationMessage && (
  <div
    className={`rounded-xl border p-4 text-center font-bold ${
      cancellationSuccess
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-red-200 bg-red-50 text-red-700"
    }`}
  >
    {cancellationSuccess && (
      <div className="mb-2 text-4xl">✅</div>
    )}

    <p>
      {cancellationSuccess
        ? text.cancellationSuccess
        : cancellationMessage}
    </p>
  </div>
)}

        {!cancellationSuccess ? (
  <button
    type="button"
    onClick={handleCancelReservation}
    disabled={cancellationLoading}
    className="w-full rounded-xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {cancellationLoading
      ? text.processingCancellation
      : text.cancelReservation}
  </button>
) : (
  <button
    type="button"
    onClick={() => {
      setManageReservationOpen(false);
      setCancellationMessage("");
      setCancellationSuccess(false);
    }}
    className="w-full rounded-xl bg-zinc-950 px-6 py-4 font-black text-white transition hover:bg-zinc-800"
  >
    {text.close}
  </button>
)}

        <p className="text-center text-xs leading-5 text-zinc-500">
  {language === "es"
    ? "Las solicitudes de reembolso de pagos realizados con tarjeta o PayPal serán revisadas según la política de cancelación."
    : language === "en"
    ? "Refund requests for payments made by card or PayPal will be reviewed according to the cancellation policy."
    : language === "fr"
    ? "Les demandes de remboursement des paiements effectués par carte ou PayPal seront examinées conformément à la politique d’annulation."
    : language === "de"
    ? "Rückerstattungsanträge für Zahlungen per Karte oder PayPal werden gemäß den Stornierungsbedingungen geprüft."
    : language === "it"
    ? "Le richieste di rimborso per i pagamenti effettuati con carta o PayPal saranno esaminate in base alla politica di cancellazione."
    : language === "pt"
    ? "As solicitações de reembolso de pagamentos feitos por cartão ou PayPal serão analisadas de acordo com a política de cancelamento."
    : "カードまたはPayPalで行われた支払いの返金リクエストは、キャンセルポリシーに従って確認されます。"}
</p>
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
  {text.heroCountry}
</p>

<h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] md:text-6xl xl:text-7xl">
  {pageText.heroLine1}
  <span className="block">{pageText.heroLine2}</span>
  <span className="block text-red-600">{pageText.heroLine3}</span>
</h1>

<p className="mt-7 max-w-xl text-lg leading-8 text-zinc-300">
  {pageText.heroDescription}
</p>

<div className="mt-9 flex flex-wrap gap-4">
  <a
    href="#reservar"
    className="rounded-full bg-red-600 px-8 py-4 font-black text-white transition hover:bg-red-700"
  >
    {text.bookNow} →
  </a>

  <a
    href="#servicios"
    className="rounded-full border border-white/30 bg-white/5 px-8 py-4 font-black text-white backdrop-blur transition hover:bg-white hover:text-black"
  >
    {extra.viewServices}
  </a>
</div>

<div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-white/15 pt-7">
  <div>
    <div className="text-4xl leading-none" aria-hidden="true">
      🛡️
    </div>

    <p className="mt-2 font-black">{extra.safety}</p>
    <p className="text-sm text-zinc-400">{extra.guaranteed}</p>
  </div>

  <div>
    <div className="text-4xl leading-none" aria-hidden="true">
      🚘
    </div>

    <p className="mt-2 font-black">{extra.vehicles}</p>
    <p className="text-sm text-zinc-400">{extra.premium}</p>
  </div>

  <div>
    <div className="text-4xl leading-none" aria-hidden="true">
      🕐
    </div>

    <p className="mt-2 font-black">{extra.support}</p>
    <p className="text-sm text-zinc-400">{extra.available247}</p>
  </div>
</div>
          </div>

          {/* RESERVA */}
          <div
            id="reservar"
            className="rounded-[2rem] border border-white/20 bg-white p-7 text-zinc-950 shadow-2xl md:p-9"
          >
            <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-red-600">
              {text.bookTransfer}
            </p>

            <h2 className="mt-2 text-center text-3xl font-black">
              {pageText.whereGoing}
            </h2>

            <p className="mt-2 text-center text-zinc-500">
              {pageText.completeTripData}
            </p>

            <button
  type="button"
  onClick={() => {
    setManageReservationOpen(true);
    setCancellationMessage("");
  }}
  className="mt-5 w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-black text-zinc-700 transition hover:border-red-600 hover:bg-red-50 hover:text-red-600"
>
  {pageText.manageCancel}
</button>

            {confirmedReservation ? (
  <div className="mt-7 rounded-3xl border border-green-200 bg-green-50 p-6 text-center">
    <div className="text-5xl">✅</div>

    <h3 className="mt-3 text-2xl font-black text-green-700">
      {pageText.reservationConfirmed}
    </h3>

    <p className="mt-2 text-sm text-zinc-600">
      {pageText.thanksBooking}
    </p>

        <div className="mt-5 rounded-2xl bg-white p-5 text-left text-sm shadow-sm">
      <p>
        <strong>{pageText.code}:</strong> {confirmedReservation.code}
      </p>

      <p className="mt-2">
        <strong>{pageText.customerName}:</strong> {confirmedReservation.name}
      </p>

      <p className="mt-2">
        <strong>{pageText.pickupLabel}:</strong> {confirmedReservation.pickup}
      </p>

      <p className="mt-2">
        <strong>{pageText.destinationLabel}:</strong>{" "}
        {confirmedReservation.destination}
      </p>

      <p className="mt-2">
        <strong>{pageText.passengersLabel}:</strong>{" "}
        {confirmedReservation.passengers}
      </p>

      <p className="mt-2">
        <strong>{pageText.largeLuggageLabel}:</strong>{" "}
        {confirmedReservation.largeLuggage}
      </p>

      <p className="mt-2">
        <strong>{pageText.carryOnLabel}:</strong>{" "}
        {confirmedReservation.carryOnLuggage}
      </p>

      <p className="mt-2">
        <strong>{pageText.dateLabel}:</strong> {confirmedReservation.date}
      </p>

      <p className="mt-2">
        <strong>{pageText.timeLabel}:</strong> {confirmedReservation.time}
      </p>

      <p className="mt-2">
        <strong>{text.tripType}:</strong>{" "}
        {confirmedReservation.tripType === "roundtrip"
          ? text.roundTrip
          : text.oneWay}
      </p>

      {confirmedReservation.tripType === "roundtrip" && (
        <>
          <p className="mt-2">
            <strong>{text.returnDate}:</strong>{" "}
            {confirmedReservation.returnDate}
          </p>

          <p className="mt-2">
            <strong>{text.returnTime}:</strong>{" "}
            {confirmedReservation.returnTime}
          </p>
        </>
      )}

      <p className="mt-2">
        <strong>{pageText.emailLabel}:</strong> {confirmedReservation.email}
      </p>

      <p className="mt-2">
        <strong>{pageText.phoneLabel}:</strong> {confirmedReservation.phone}
      </p>

      {confirmedReservation.flightNumber && (
        <p className="mt-2">
          <strong>{text.flightNumber}:</strong>{" "}
          {confirmedReservation.flightNumber}
        </p>
      )}

      <p className="mt-2">
        <strong>{pageText.vehicleLabel}:</strong> {confirmedReservation.vehicle}
      </p>

      <p className="mt-2">
        <strong>{pageText.paymentMethod}:</strong>{" "}
        {confirmedReservation.paymentMethod === "card"
          ? pageText.cardPayPal
          : pageText.cashDriver}
      </p>

      <p className="mt-3 text-lg font-black">
        {text.total}: US${confirmedReservation.total}
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        setConfirmedReservation(null);
        setPickup("");
        setDestination("");
        setPassengers("");
        setLargeLuggage(0);
setCarryOnLuggage(0);
        setTravelDate("");
        setTravelTime("");
        setTripType("");
setReturnDate("");
setReturnTime("");
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setFlightNumber("");
        setSelectedVehicle("");
        setPaymentMethod("");
        setShowVehicles(false);
      }}
      className="mt-6 w-full rounded-xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700"
    >
      {pageText.bookAnother}
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
    {text.pickup}
  </label>

  <LocationAutocomplete
  value={pickup}
  placeholder={extra.pickupPlaceholder}
  onSelect={(place) => {
    setPickup(place.label);
    setPickupPlace(place);
  }}
  onClear={() => {
    setPickup("");
    setPickupPlace(null);
  }}
/>
</div>

<div>
  <label className="mb-2 block text-sm font-black">
    {text.destination}
  </label>

  <LocationAutocomplete
  value={destination}
  placeholder={extra.destinationPlaceholder}
  onSelect={(place) => {
    setDestination(place.label);
    setDestinationPlace(place);
  }}
  onClear={() => {
    setDestination("");
    setDestinationPlace(null);
  }}
/>
</div>

<div>
  <label className="mb-2 block text-sm font-black">
    {text.tripType}
  </label>

  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => {
        setTripType("oneway");
        setReturnDate("");
        setReturnTime("");
      }}
      className={`rounded-xl border px-4 py-4 font-black transition ${
        tripType === "oneway"
          ? "border-red-600 bg-red-600 text-white"
          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-red-400"
      }`}
    >
      ➡️ {text.oneWay}
    </button>

    <button
      type="button"
      onClick={() => setTripType("roundtrip")}
      className={`rounded-xl border px-4 py-4 font-black transition ${
        tripType === "roundtrip"
          ? "border-red-600 bg-red-600 text-white"
          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-red-400"
      }`}
    >
      🔄 {text.roundTrip}
    </button>
  </div>
</div>

{(routeLoading || routeDistance || routeDuration) && (
  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
    {routeLoading ? (
      <p className="text-center text-sm font-bold text-zinc-500">
        {extra.calculatingRoute}
      </p>
    ) : (
      <div className="flex items-center justify-center gap-4 text-sm font-black text-zinc-800">
        <span>🚗 {routeDistance}</span>
        <span className="text-zinc-300">•</span>
        <span>⏱️ {routeDuration}</span>
      </div>
    )}
  </div>
)}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-black">{text.travelDate}</label>
                  <input
  type="date"
  value={travelDate}
  min={
    new Date().getFullYear() +
    "-" +
    String(new Date().getMonth() + 1).padStart(2, "0") +
    "-" +
    String(new Date().getDate()).padStart(2, "0")
  }
  onChange={(e) => {
    setTravelDate(e.target.value);
    setTravelTime("");
    setReturnDate("");
    setReturnTime("");
    setReturnScheduleError("");
  }}
  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none"
/>
                </div>

                <div>
  <label className="mb-2 block text-sm font-black">
    {text.travelTime}
  </label>

  <select
    value={travelTime}
    onChange={(e) => setTravelTime(e.target.value)}
    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none"
  >
    <option value="">{extra.selectTime}</option>

    {getAvailableTravelTimes().map((time) => (
      <option key={time} value={time}>
        {time}
      </option>
    ))}
  </select>
</div>
              </div>

              {tripType === "roundtrip" && (
  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
    <p className="mb-3 text-sm font-black text-red-700">
      🔄 {extra.returnTripDetails}
    </p>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-2 block text-sm font-black">
          {text.returnDate}
        </label>

        <input
          type="date"
          value={returnDate}
          min={travelDate || undefined}
          onChange={(e) => {
  setReturnDate(e.target.value);
  setReturnScheduleError("");
}}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-4 outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-black">
          {text.returnTime}
        </label>

        <select
          value={returnTime}
          onChange={(e) => {
  setReturnTime(e.target.value);
  setReturnScheduleError("");
}}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-4 outline-none focus:border-red-500"
        >
          <option value="">{extra.selectTime}</option>

          <option value="12:00 AM">12:00 AM</option>
          <option value="1:00 AM">1:00 AM</option>
          <option value="2:00 AM">2:00 AM</option>
          <option value="3:00 AM">3:00 AM</option>
          <option value="4:00 AM">4:00 AM</option>
          <option value="5:00 AM">5:00 AM</option>
          <option value="6:00 AM">6:00 AM</option>
          <option value="7:00 AM">7:00 AM</option>
          <option value="8:00 AM">8:00 AM</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="10:00 AM">10:00 AM</option>
          <option value="11:00 AM">11:00 AM</option>

          <option value="12:00 PM">12:00 PM</option>
          <option value="1:00 PM">1:00 PM</option>
          <option value="2:00 PM">2:00 PM</option>
          <option value="3:00 PM">3:00 PM</option>
          <option value="4:00 PM">4:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
          <option value="6:00 PM">6:00 PM</option>
          <option value="7:00 PM">7:00 PM</option>
          <option value="8:00 PM">8:00 PM</option>
          <option value="9:00 PM">9:00 PM</option>
          <option value="10:00 PM">10:00 PM</option>
          <option value="11:00 PM">11:00 PM</option>
        </select>
      </div>
    </div>
    {returnScheduleError && (
  <div className="mt-4 rounded-xl border border-red-300 bg-white p-4 text-sm font-bold text-red-700">
    ⚠️ {returnScheduleError}
  </div>
)}
  </div>
)}

              <div className="border-t border-zinc-200 pt-4">
  <p className="mb-3 text-sm font-black">
    {language === "es" ? "Datos del pasajero" : language === "en" ? "Passenger details" : language === "fr" ? "Informations du passager" : language === "de" ? "Passagierdaten" : language === "it" ? "Dati del passeggero" : language === "pt" ? "Dados do passageiro" : "乗客情報"}
  </p>

  <div className="space-y-3">
    <input
      type="text"
      placeholder={text.fullName}
      value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none focus:border-red-500"
    />

    <input
      type="tel"
      placeholder={language === "es" ? "Teléfono / WhatsApp" : language === "en" ? "Phone / WhatsApp" : language === "fr" ? "Téléphone / WhatsApp" : language === "de" ? "Telefon / WhatsApp" : language === "it" ? "Telefono / WhatsApp" : language === "pt" ? "Telefone / WhatsApp" : "電話 / WhatsApp"}
      value={customerPhone}
      onChange={(e) => setCustomerPhone(e.target.value)}
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none focus:border-red-500"
    />

    <input
  type="text"
  placeholder={text.flightNumber}
  value={flightNumber}
  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none focus:border-red-500"
/>

    <input
      type="email"
      placeholder={text.email}
      value={customerEmail}
      onChange={(e) => setCustomerEmail(e.target.value)}
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none focus:border-red-500"
    />
  </div>
</div>

              <div>
                <label className="mb-2 block text-sm font-black">
                  {text.passengers}
                </label>
                <select
  value={passengers}
  onChange={(e) => {
  setPassengers(e.target.value);
  setSelectedVehicle("");
  setPaymentMethod("");
  setShowVehicles(false);
}}
  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none"
>
  <option value="">{text.passengers}</option>
<option value="1">{language === "ja" ? "1名" : `1 ${text.passenger}`}</option>
<option value="2">{language === "ja" ? "2名" : `2 ${text.passengers}`}</option>
<option value="3">{language === "ja" ? "3名" : `3 ${text.passengers}`}</option>
<option value="4">{language === "ja" ? "4名" : `4 ${text.passengers}`}</option>
<option value="5">{language === "ja" ? "5名" : `5 ${text.passengers}`}</option>
<option value="6">{language === "ja" ? "6名" : `6 ${text.passengers}`}</option>
<option value="7">{language === "ja" ? "7名" : `7 ${text.passengers}`}</option>
<option value="8">{language === "ja" ? "8名" : `8 ${text.passengers}`}</option>
<option value="9">{language === "ja" ? "9名" : `9 ${text.passengers}`}</option>
<option value="10">{language === "ja" ? "10名" : `10 ${text.passengers}`}</option>
<option value="11">{language === "ja" ? "11名" : `11 ${text.passengers}`}</option>
<option value="12">{language === "ja" ? "12名" : `12 ${text.passengers}`}</option>
<option value="13+">{language === "ja" ? "13名以上" : `13+ ${text.passengers}`}</option>
                </select>
              </div>

              {/* EQUIPAJE */}
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

  {/* MALETAS GRANDES */}
  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
    <p className="text-sm font-black text-zinc-900">
      {text.largeLuggage}
    </p>

    <p className="mt-1 text-xs text-zinc-500">
      {language === "es" ? "Equipaje para bodega" : language === "en" ? "Checked luggage" : language === "fr" ? "Bagages en soute" : language === "de" ? "Aufgabegepäck" : language === "it" ? "Bagaglio da stiva" : language === "pt" ? "Bagagem de porão" : "受託手荷物"}
    </p>

    <div className="mt-3 flex items-center justify-between">
      <button
        type="button"
        onClick={() => {
  setLargeLuggage((value) => Math.max(0, value - 1));
  setSelectedVehicle("");
  setPaymentMethod("");
  setShowVehicles(false);
}}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-xl font-black transition hover:border-red-600 hover:text-red-600"
      >
        −
      </button>

      <span className="text-xl font-black">
        {largeLuggage}
      </span>

      <button
        type="button"
        onClick={() => {
  setLargeLuggage((value) => value + 1);
  setSelectedVehicle("");
  setPaymentMethod("");
  setShowVehicles(false);
}}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white transition hover:bg-red-700"
      >
        +
      </button>
    </div>
  </div>

  {/* EQUIPAJE DE MANO */}
  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
    <p className="text-sm font-black text-zinc-900">
      {text.carryOnLuggage}
    </p>

    <p className="mt-1 text-xs text-zinc-500">
      {language === "es" ? "Mochilas y maletas pequeñas" : language === "en" ? "Backpacks and small bags" : language === "fr" ? "Sacs à dos et petits bagages" : language === "de" ? "Rucksäcke und kleine Taschen" : language === "it" ? "Zaini e bagagli piccoli" : language === "pt" ? "Mochilas e malas pequenas" : "リュックサックと小型手荷物"}
    </p>

    <div className="mt-3 flex items-center justify-between">
      <button
        type="button"
        onClick={() => {
  setCarryOnLuggage((value) => Math.max(0, value - 1));
  setSelectedVehicle("");
  setPaymentMethod("");
  setShowVehicles(false);
}}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-xl font-black transition hover:border-red-600 hover:text-red-600"
      >
        −
      </button>

      <span className="text-xl font-black">
        {carryOnLuggage}
      </span>

      <button
        type="button"
        onClick={() => {
  setCarryOnLuggage((value) => value + 1);
  setSelectedVehicle("");
  setPaymentMethod("");
  setShowVehicles(false);
}}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white transition hover:bg-red-700"
      >
        +
      </button>
    </div>
  </div>

</div>

  {pickup && destination && passengers !== "13+" && (
  <div className="mb-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
    <p className="text-center text-sm font-black uppercase tracking-[0.15em] text-red-600">
      {extra.tripSummary}
    </p>

    <div className="mt-4 space-y-2 text-sm text-zinc-700">
      <p>
        <strong>{text.pickup}:</strong> {pickup}
      </p>

      <p>
        <strong>{text.destination}:</strong> {destination}
      </p>

      <p>
        <strong>{text.tripType}:</strong>{" "}
{tripType === "roundtrip" ? text.roundTrip : text.oneWay}
      </p>

      <p>
        <strong>{text.travelDate}:</strong> {travelDate || extra.pending}
      </p>

      <p>
        <strong>{text.travelTime}:</strong> {travelTime || extra.pending}
      </p>

      {tripType === "roundtrip" && (
        <>
          <p>
            <strong>{text.returnDate}:</strong> {returnDate || extra.pending}
          </p>

          <p>
            <strong>{text.returnTime}:</strong> {returnTime || extra.pending}
          </p>
        </>
      )}
    </div>

    {!requiresCustomQuote && passengers !== "13+" && (
  <div className="mt-4 border-t border-zinc-200 pt-4 text-center">
    <p className="text-sm font-bold text-zinc-500">
      {tripType === "roundtrip"
  ? extra.roundTripTotalPrice
  : extra.transferTotalPrice}
    </p>

    {priceReady ? (
      <p className="mt-1 text-3xl font-black text-zinc-950">
        US${finalPrice}
      </p>
    ) : priceIsCalculating ? (
      <div className="mt-2">
        <p className="text-lg font-black text-zinc-700">
          {extra.calculatingFare}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {extra.checkingDistance}
        </p>
      </div>
    ) : (
      <div className="mt-2">
        <p className="text-lg font-black text-red-600">
          {extra.fareUnavailable}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {extra.selectSearchSuggestions}
        </p>
      </div>
    )}
  </div>
)}

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
    alert(bookingMessages[language].completeData);
    return;
  }

  const now = new Date();

const today =
  now.getFullYear() +
  "-" +
  String(now.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(now.getDate()).padStart(2, "0");

if (travelDate < today) {
  alert(bookingMessages[language].completeData);
  return;
}

if (
  travelDate === today &&
  !getAvailableTravelTimes().includes(travelTime)
) {
  alert(bookingMessages[language].completeData);
  return;
}

  if (tripType === "roundtrip" && (!returnDate || !returnTime)) {
  alert(bookingMessages[language].selectReturn);
  return;
}

if (tripType === "roundtrip" && travelDate && returnDate) {
  if (returnDate < travelDate) {
  setReturnScheduleError(
  bookingMessages[language].returnBeforeDeparture
);
  return;
}

  if (returnDate === travelDate) {
    const timeToMinutes = (time: string) => {
      const [clock, period] = time.split(" ");
      let [hours, minutes] = clock.split(":").map(Number);

      if (period === "AM" && hours === 12) hours = 0;
      if (period === "PM" && hours !== 12) hours += 12;

      return hours * 60 + minutes;
    };

    const departureMinutes = timeToMinutes(travelTime);
    const returnMinutes = timeToMinutes(returnTime);

    if (returnMinutes < departureMinutes + 60) {
  setReturnScheduleError(
  bookingMessages[language].returnOneHourLater
);
  return;
}

setReturnScheduleError("");
  }
}

  if (pickup === destination) {
    alert(bookingMessages[language].sameLocation);
    return;
  }

  if (requiresCustomQuote) {
  setSelectedVehicle("");
  setPaymentMethod("");
  setShowVehicles(true);
  return;
}

if (!priceReady) {
  if (routeLoading) {
    alert(
  bookingMessages[language].calculatingFare
);
  } else {
    alert(
  bookingMessages[language].fareUnavailable
);
  }

  return;
}

  setSelectedVehicle("");
setPaymentMethod("");
setShowVehicles(true);
}}
  className="relative z-50 w-full cursor-pointer rounded-xl bg-red-600 px-6 py-4 text-lg font-black text-white"
  >
         {text.search} →
    </button>

  </form>

  {showVehicles && requiresCustomQuote && (
  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-center shadow-sm">
    <p className="text-xl font-black text-zinc-950">
      {bookingUi[language].customQuote}
    </p>

    <p className="mt-2 text-sm leading-6 text-zinc-600">
      {bookingUi[language].customQuoteDescription}
    </p>

    <a
  href={`https://wa.me/18296502013?text=${encodeURIComponent(
    `${bookingUi[language].customQuote} - VIP Tourist Transfer

${text.pickup}: ${pickup}
${text.destination}: ${destination}
${text.passengers}: ${passengers}
${text.largeLuggage}: ${largeLuggage}
${text.carryOnLuggage}: ${carryOnLuggage}
${text.travelDate}: ${travelDate}
${text.travelTime}: ${travelTime}
${text.tripType}: ${tripType === "roundtrip" ? text.roundTrip : text.oneWay}${
      tripType === "roundtrip"
        ? `\n${text.returnDate}: ${returnDate}\n${text.returnTime}: ${returnTime}`
        : ""
    }`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#25D366] px-5 py-4 text-base font-black text-white transition hover:bg-[#20bd5a]"
>
  {bookingUi[language].whatsappQuote}
</a>
  </div>
)}

{showVehicles && !requiresCustomQuote && (
  <div className="mt-6">
    <h3 className="mb-4 text-xl font-bold">
      {bookingUi[language].selectVehicle}
    </h3>

    <div className="grid gap-4">

      {/* SEDÁN EJECUTIVO */}
<div
  onClick={() =>
    sedanUnavailable
  ? alert(bookingUi[language].sedanCapacityError)
  : setSelectedVehicle("sedan")
  }
  className={`rounded-xl border p-4 transition ${
    sedanUnavailable
      ? "cursor-not-allowed border-zinc-300 bg-zinc-100 opacity-50 grayscale"
      : selectedVehicle === "sedan"
      ? "cursor-pointer border-red-600 ring-2 ring-red-200"
      : "cursor-pointer border-zinc-200 hover:border-red-400"
  }`}
>
  <img
    src="/images/sedan-ejecutivo.jpg"
    alt="Sedán Ejecutivo"
    className="h-40 w-full rounded-lg object-cover"
  />

  <h4 className="mt-3 text-lg font-bold">
    {text.executiveSedan}
  </h4>

  <p className="text-sm text-gray-600">
  {bookingUi[language].sedanCapacity}
</p>

  <p className="mt-1 text-xs font-semibold text-zinc-500">
    {bookingUi[language].sedanLuggage}
  </p>

  {sedanUnavailable && (
    <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700">
      {bookingUi[language].unavailable}
    </p>
  )}
</div>

{/* MINIVAN PREMIUM */}
<div
  onClick={() =>
  minivanUnavailable
    ? alert(bookingUi[language].minivanCapacityError)
    : setSelectedVehicle("suv")
}
  className={`rounded-xl border p-4 transition ${
    minivanUnavailable
      ? "cursor-not-allowed border-zinc-300 bg-zinc-100 opacity-50 grayscale"
      : selectedVehicle === "suv"
      ? "cursor-pointer border-red-600 ring-2 ring-red-200"
      : "cursor-pointer border-zinc-200 hover:border-red-400"
  }`}
>
  <img
    src="/images/suv-premium.jpg"
    alt="Minivan Premium"
    className="h-40 w-full rounded-lg object-cover"
  />

  <h4 className="mt-3 text-lg font-bold">
    {text.premiumMinivan}
  </h4>

  <p className="text-sm text-gray-600">
    {bookingUi[language].minivanCapacity}
  </p>

  <p className="mt-1 text-xs font-semibold text-zinc-500">
    {bookingUi[language].minivanLuggage}
  </p>

  {minivanUnavailable && (
    <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700">
      {bookingUi[language].unavailable}
    </p>
  )}
</div>

{/* VAN EJECUTIVA */}
<div
  onClick={() =>
  vanUnavailable
    ? alert(bookingUi[language].vanCapacityError)
    : setSelectedVehicle("van")
}
  className={`rounded-xl border p-4 transition ${
    vanUnavailable
      ? "cursor-not-allowed border-zinc-300 bg-zinc-100 opacity-50 grayscale"
      : selectedVehicle === "van"
      ? "cursor-pointer border-red-600 ring-2 ring-red-200"
      : "cursor-pointer border-zinc-200 hover:border-red-400"
  }`}
>
  <img
    src="/images/van-ejecutiva.jpg"
    alt="Van Ejecutiva"
    className="h-40 w-full rounded-lg object-cover"
  />

  <h4 className="mt-3 text-lg font-bold">
    {text.executiveVan}
  </h4>

  <p className="text-sm text-gray-600">
    {bookingUi[language].vanCapacity}
  </p>

  <p className="mt-1 text-xs font-semibold text-zinc-500">
    {bookingUi[language].vanLuggage}
  </p>

  {vanUnavailable && (
    <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700">
      {bookingUi[language].unavailable}
    </p>
  )}
</div>

    </div>
  </div>
)}

{showVehicles && selectedVehicle && (
  <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
    <h3 className="mb-4 text-xl font-bold">
  {bookingUi[language].reservationSummary}
</h3>

    <div className="space-y-2 text-sm">
      <p>
        <span className="font-semibold">{pageText.customerName}:</span> {customerName}
      </p>

      <p>
        <span className="font-semibold">{pageText.pickupLabel}:</span> {pickup}
      </p>

      <p>
        <span className="font-semibold">{pageText.destinationLabel}:</span> {destination}
      </p>

      <p>
        <span className="font-semibold">{pageText.passengersLabel}:</span> {passengers}
      </p>

      <p>
  <span className="font-semibold">{pageText.dateLabel}:</span> {travelDate}
</p>

<p>
  <span className="font-semibold">{pageText.timeLabel}:</span> {travelTime}
</p>

<p>
  <span className="font-semibold">{pageText.emailLabel}:</span> {customerEmail}
</p>

<p>
  <span className="font-semibold">{pageText.largeLuggageLabel}:</span> {largeLuggage}
</p>

<p>
  <span className="font-semibold">{pageText.carryOnLabel}:</span> {carryOnLuggage}
</p>

<p>
  <span className="font-semibold">{pageText.phoneLabel}:</span> {customerPhone}
</p>

      <p>
        <span className="font-semibold">{pageText.vehicleLabel}:</span>{" "}
        {selectedVehicle === "sedan"
  ? text.executiveSedan
  : selectedVehicle === "suv"
  ? text.premiumMinivan
  : text.executiveVan}
      </p>

      {priceReady ? (
  <p className="pt-2 text-lg font-black">
    {text.total}: US${finalPrice}
  </p>
) : priceIsCalculating ? (
  <p className="pt-2 text-lg font-black text-zinc-600">
    {bookingMessages[language].calculatingFare}
  </p>
) : (
  <p className="pt-2 text-lg font-black text-red-600">
    {bookingMessages[language].fareUnavailable}
  </p>
)}
    </div>
  </div>
)}

  {selectedVehicle && (
  <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5">
    <p className="mb-3 text-sm font-black">
      {bookingUi[language].paymentMethod}
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
            <p className="font-black">{bookingUi[language].card}</p>
<p className="text-xs text-zinc-500">
  {bookingUi[language].payOnline}
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
            <p className="font-black">{bookingUi[language].cash}</p>
<p className="text-xs text-zinc-500">
  {bookingUi[language].payDriver}
</p>
          </div>
        </div>
      </label>
    </div>
  </div>
)}

{/* ACEPTACIÓN DE POLÍTICA DE CANCELACIÓN */}
{selectedVehicle && priceReady && (
  <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={cancellationPolicyAccepted}
        onChange={(e) => setCancellationPolicyAccepted(e.target.checked)}
        className="mt-1 h-5 w-5 cursor-pointer accent-red-600"
      />

      <span className="text-sm leading-6 text-zinc-700">
  {text.acceptCancellationPolicy}{" "}
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      setCancellationPolicyOpen(true);
    }}
    className="font-black text-red-600 underline transition hover:text-red-700"
  >
    {text.cancellationPolicy}
  </button>
  .
</span>
    </label>
  </div>
)}

  {selectedVehicle &&
  paymentMethod === "card" &&
  priceReady &&
  cancellationPolicyAccepted && (
  <div className="mt-5">
    <PayPalPayment
      amount={finalPrice}
      onBeforePayment={() => {
  const now = new Date();

  const today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  if (
    travelDate < today ||
    (travelDate === today &&
      !getAvailableTravelTimes().includes(travelTime))
  ) {
    alert(bookingMessages[language].completeData);
    return false;
  }

  return true;
}}
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
          tripType,
returnDate,
returnTime,
          paymentMethod: "card",
        };

       const { error } = await supabase.from("reservas").insert({
  reservation_code: reserva.reservationCode,
customer_name: reserva.customerName,
customer_phone: reserva.customerPhone,
customer_email: reserva.customerEmail,
flight_number: flightNumber.trim() || null,
pickup: reserva.pickup,
  destination: reserva.destination,
  passengers: Number(reserva.passengers),
  large_luggage: largeLuggage,
carry_on_luggage: carryOnLuggage,
  vehicle: reserva.vehicle,
  travel_date: reserva.travelDate,
  travel_time: reserva.travelTime,
  trip_type: reserva.tripType,
return_date: reserva.tripType === "roundtrip" ? reserva.returnDate : null,
return_time: reserva.tripType === "roundtrip" ? reserva.returnTime : null,
  amount: Number(reserva.amount),
  payment_method: reserva.paymentMethod,
  transaction_id: reserva.transactionId,
});

if (error) {
  console.error("Error guardando reserva:", error);
  alert(bookingMessages[language].paymentSaveError);
  return;
}

  setConfirmedReservation({
  code: data.reservationCode,
  name: customerName,
  phone: customerPhone,
  email: customerEmail,
  flightNumber: flightNumber,
  date: travelDate,
  time: travelTime,
  tripType: tripType === "roundtrip" ? "roundtrip" : "oneway",
returnDate: returnDate,
returnTime: returnTime,
  pickup: pickup,
  destination: destination,
  passengers: passengers,
  largeLuggage: largeLuggage,
  carryOnLuggage: carryOnLuggage,
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

{selectedVehicle &&
  paymentMethod === "cash" &&
  priceReady &&
  cancellationPolicyAccepted && (
  <button
    type="button"
    onClick={async () => {
      const now = new Date();

const today =
  now.getFullYear() +
  "-" +
  String(now.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(now.getDate()).padStart(2, "0");

if (
  travelDate < today ||
  (travelDate === today &&
    !getAvailableTravelTimes().includes(travelTime))
) {
  alert(bookingMessages[language].completeData);
  return;
}
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
        tripType,
returnDate,
returnTime,
        paymentMethod: "cash",
      };

      const { error } = await supabase.from("reservas").insert({
  reservation_code: reserva.reservationCode,
customer_name: reserva.customerName,
customer_phone: reserva.customerPhone,
customer_email: reserva.customerEmail,
flight_number: flightNumber.trim() || null,
pickup: reserva.pickup,
  destination: reserva.destination,
  passengers: Number(reserva.passengers),
  large_luggage: largeLuggage,
carry_on_luggage: carryOnLuggage,
  vehicle: reserva.vehicle,
  travel_date: reserva.travelDate,
  travel_time: reserva.travelTime,
  trip_type: reserva.tripType,
return_date: reserva.tripType === "roundtrip" ? reserva.returnDate : null,
return_time: reserva.tripType === "roundtrip" ? reserva.returnTime : null,
  amount: Number(reserva.amount),
  payment_method: reserva.paymentMethod,
  transaction_id: reserva.transactionId,
});

if (error) {
  console.error("Error guardando reserva:", error);
  alert(bookingMessages[language].saveError);
  return;
}

  setConfirmedReservation({
  code: reservationCode,
  name: customerName,
  phone: customerPhone,
  email: customerEmail,
  flightNumber: flightNumber,
  date: travelDate,
  time: travelTime,
tripType: tripType === "roundtrip" ? "roundtrip" : "oneway",
returnDate: returnDate,
returnTime: returnTime,
  pickup: pickup,
  destination: destination,
  passengers: passengers,
  largeLuggage: largeLuggage,
  carryOnLuggage: carryOnLuggage,
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
    {bookingUi[language].confirmCashReservation}
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
        {servicesUi[language].eyebrow}
      </p>

      <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
        {servicesUi[language].title}
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-500">
        {servicesUi[language].description}
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
          {servicesUi[language].airports}
        </p>

        <h3 className="mt-2 text-2xl font-black">
          {servicesUi[language].airportTitle}
        </h3>

        <p className="mt-4 leading-7 text-red-50">
          {servicesUi[language].airportDescription}
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
          {servicesUi[language].vip}
        </p>

        <h3 className="mt-2 text-2xl font-black">
          {servicesUi[language].privateTitle}
        </h3>

        <p className="mt-4 leading-7 text-zinc-300">
          {servicesUi[language].privateDescription}
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
          {servicesUi[language].experiences}
        </p>

        <h3 className="mt-2 text-2xl font-black text-zinc-950">
          {servicesUi[language].destinationsTitle}
        </h3>

        <p className="mt-4 leading-7 text-zinc-600">
          {servicesUi[language].destinationsDescription}
        </p>
      </article>

    </div>
  </div>
</section>

      {/* DESTINOS */}
      <section id="destinos" className="bg-zinc-100 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="font-black uppercase tracking-[0.25em] text-red-600">
            {destinationsUi[language].eyebrow}
          </p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            {destinationsUi[language].title}
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
                    {destination.subtitle[language]}
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
              {fleetUi[language].eyebrow}
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              {fleetUi[language].title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              {fleetUi[language].description}
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
        {text.executiveSedan}
      </h3>
      <p className="mt-2 text-zinc-400">
        {fleetUi[language].sedanDescription}
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
        {text.premiumMinivan}
      </h3>
      <p className="mt-2 text-zinc-400">
        {fleetUi[language].minivanDescription}
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
        {text.executiveVan}
      </h3>
      <p className="mt-2 text-zinc-400">
        {fleetUi[language].vanDescription}
      </p>
    </div>
  </div>

</div>
          </div>
      </section>

      {/* OPINIONES DE CLIENTES */}
<section id="opiniones" className="bg-white py-24">
  <div className="mx-auto max-w-7xl px-5 lg:px-8">

    <div className="text-center">
      <p className="font-black uppercase tracking-[0.25em] text-red-600">
        {reviewsUi[language].eyebrow}
      </p>

      <h2 className="mt-3 text-4xl font-black text-zinc-950 md:text-5xl">
        {reviewsUi[language].title}
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-500">
        {reviewsUi[language].description}
      </p>
    </div>

    {/* CARRUSEL DE OPINIONES APROBADAS */}
<div className="mx-auto mt-12 max-w-4xl">
  {reviews.length > 0 ? (
    <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50 px-6 py-10 shadow-sm md:px-16 md:py-14">

      <div className="text-center">
        <div className="flex justify-center gap-1 text-2xl">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className={
                index < reviews[currentReviewIndex].rating
                  ? "text-yellow-500"
                  : "text-zinc-300"
              }
            >
              ★
            </span>
          ))}
        </div>

        <p className="mx-auto mt-7 max-w-3xl text-xl font-semibold leading-9 text-zinc-700 md:text-2xl md:leading-10">
          “{reviews[currentReviewIndex].comment}”
        </p>

        <p className="mt-7 text-lg font-black text-zinc-950">
          {reviews[currentReviewIndex].name}
        </p>
      </div>

      {reviews.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setCurrentReviewIndex((current) =>
                current === 0 ? reviews.length - 1 : current - 1
              )
            }
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-2xl font-black text-zinc-900 shadow-md transition hover:bg-zinc-950 hover:text-white md:left-6"
            aria-label={reviewsUi[language].previousReview}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentReviewIndex((current) =>
                current === reviews.length - 1 ? 0 : current + 1
              )
            }
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-2xl font-black text-zinc-900 shadow-md transition hover:bg-zinc-950 hover:text-white md:right-6"
            aria-label={reviewsUi[language].nextReview}
          >
            ›
          </button>
        </>
      )}

      {reviews.length > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              type="button"
              onClick={() => setCurrentReviewIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentReviewIndex
                  ? "w-8 bg-red-600"
                  : "w-2.5 bg-zinc-300"
              }`}
              aria-label={`${reviewsUi[language].viewReview} ${index + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  ) : (
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 text-center">
      <p className="font-bold text-zinc-600">
        {reviewsUi[language].firstReview}
      </p>
    </div>
  )}
</div>

    {/* FORMULARIO PARA DEJAR OPINIÓN */}
    <div className="mx-auto mt-14 max-w-2xl rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-xl md:p-10">

      <h3 className="text-center text-2xl font-black text-zinc-950">
        {reviewsUi[language].leaveReview}
      </h3>

      <p className="mt-2 text-center text-sm text-zinc-500">
        {reviewsUi[language].formDescription}
      </p>

      <div className="mt-7">
        <label className="mb-2 block text-sm font-black text-zinc-800">
          {reviewsUi[language].name}
        </label>

        <input
          type="text"
          value={reviewName}
          onChange={(e) => setReviewName(e.target.value)}
          placeholder={reviewsUi[language].namePlaceholder}
          maxLength={80}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
        />
      </div>

      <div className="mt-5">
        <label className="mb-3 block text-sm font-black text-zinc-800">
          {reviewsUi[language].rating}
        </label>

        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const star = index + 1;

            return (
              <button
                key={star}
                type="button"
                onClick={() => setReviewRating(star)}
                className={`text-4xl transition hover:scale-110 ${
                  star <= reviewRating
                    ? "text-yellow-500"
                    : "text-zinc-300"
                }`}
                aria-label={`${star} ${reviewsUi[language].stars}`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-black text-zinc-800">
          {reviewsUi[language].comment}
        </label>

        <textarea
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder={reviewsUi[language].commentPlaceholder}
          maxLength={500}
          rows={5}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500"
        />

        <p className="mt-2 text-right text-xs font-semibold text-zinc-400">
          {reviewComment.length}/500
        </p>
      </div>

      {reviewMessage && (
        <p className="mt-4 rounded-xl bg-zinc-100 p-4 text-center text-sm font-bold text-zinc-700">
          {reviewMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleReviewSubmit}
        disabled={reviewSending}
        className="mt-6 w-full rounded-xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {reviewSending ? reviewsUi[language].sending : reviewsUi[language].publish}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-zinc-400">
        {reviewsUi[language].moderation}
      </p>

    </div>
  </div>
  </section>

  {/* TRIPADVISOR */}
<section className="bg-zinc-50 py-16">
  <div className="mx-auto max-w-7xl px-5 lg:px-8">
    <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl">
      <div className="grid items-center gap-8 p-7 md:grid-cols-[1fr_auto] md:p-10">

        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#00AA6C]">
            Tripadvisor
          </p>

          <h2 className="mt-3 text-3xl font-black text-zinc-950 md:text-4xl">
            {tripadvisorUi[language].title}
          </h2>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-2xl text-[#00AA6C]">
              ● ● ● ● ●
            </span>
          </div>

          <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
            {tripadvisorUi[language].description}
          </p>
        </div>

        <div className="md:text-right">
          <a
            href="https://www.tripadvisor.es/Attraction_Review-g147289-d33020734-Reviews-VIP_TOURIST_TRANSFERS-Santo_Domingo_Santo_Domingo_Province_Dominican_Republic.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[#00AA6C] px-8 py-4 font-black text-white shadow-lg transition hover:scale-105 hover:bg-[#008f5b]"
          >
            {tripadvisorUi[language].button}
          </a>

          <p className="mt-3 text-center text-xs font-semibold text-zinc-400 md:text-right">
            VIP TOURIST TRANSFERS
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
              VIP Tourist Transfer
            </p>
            <h2 className="mt-3 text-4xl font-black">
              {contactUi[language].title}
            </h2>
            <p className="mt-3 text-red-100">
              {contactUi[language].description}
            </p>
          </div>

          <a
            href="#reservar"
            className="rounded-full bg-white px-8 py-4 font-black text-red-600 transition hover:bg-zinc-950 hover:text-white"
          >
            {contactUi[language].button}
          </a>
        </div>
      </section>

            {/* MAPA / UBICACIÓN */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          <div className="mb-8 text-center">
            <p className="font-black uppercase tracking-[0.2em] text-red-600">
              {contactUi[language].locationEyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-black text-zinc-950 md:text-4xl">
              {contactUi[language].locationTitle}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
              {contactUi[language].locationAddress}
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
              title={contactUi[language].mapTitle}
              className={`w-full transition duration-700 ${
  isNight
    ? "invert-[90%] hue-rotate-180 brightness-[85%] contrast-[90%]"
    : ""
}`}
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
        alt="VIP Tourist Transfer"
        className="h-24 w-auto rounded-xl bg-white object-contain"
      />

      <p className="mt-4 max-w-xs text-sm leading-6">
        {contactUi[language].footerDescription}
      </p>
    </div>

    {/* CONTACTO */}
<div>
  <p className="text-lg font-black text-white">
    {contactUi[language].contact}
  </p>

  <div className="mt-4 space-y-3 text-sm">

    <a
      href="tel:+18296502013"
      className="block transition hover:text-white"
    >
      📞 +1 829-650-2013
    </a>

    <a
     href={`https://wa.me/18296502013?text=${encodeURIComponent(
  language === "es"
    ? "Hola, quiero información sobre un traslado con VIP Tourist Transfers."
    : language === "en"
    ? "Hello, I would like information about a transfer with VIP Tourist Transfers."
    : language === "fr"
    ? "Bonjour, je souhaite obtenir des informations sur un transfert avec VIP Tourist Transfers."
    : language === "de"
    ? "Hallo, ich möchte Informationen über einen Transfer mit VIP Tourist Transfers."
    : language === "it"
    ? "Ciao, vorrei informazioni su un trasferimento con VIP Tourist Transfers."
    : language === "pt"
    ? "Olá, gostaria de informações sobre um transfer com VIP Tourist Transfers."
    : "こんにちは。VIP Tourist Transfersの送迎について詳しく知りたいです。"
)}`}
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
  href="https://www.facebook.com/share/17revdigwc/"
  target="_blank"
  rel="noopener noreferrer"
  className="block transition hover:text-blue-400"
>
  Facebook: VIP Tourist Transfer
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
        {contactUi[language].followUs}
      </p>

      <div className="mt-4 flex gap-3 md:justify-end">

        {/* LLAMAR */}
<a
  href="tel:+18296502013"
  aria-label={contactUi[language].callAria}
  title={contactUi[language].callTitle}
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
          aria-label={language === "es" ? "Instagram de VIP Tourist Transfer" : language === "en" ? "VIP Tourist Transfer on Instagram" : language === "fr" ? "VIP Tourist Transfer sur Instagram" : language === "de" ? "VIP Tourist Transfer auf Instagram" : language === "it" ? "VIP Tourist Transfer su Instagram" : language === "pt" ? "VIP Tourist Transfer no Instagram" : "VIP Tourist TransferのInstagram"}
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

        {/* FACEBOOK */}
<a
  href="https://www.facebook.com/share/17revdigwc/"
  target="_blank"
  rel="noopener noreferrer"
  aria-label={language === "es" ? "Facebook de VIP Tourist Transfer" : language === "en" ? "VIP Tourist Transfer on Facebook" : language === "fr" ? "VIP Tourist Transfer sur Facebook" : language === "de" ? "VIP Tourist Transfer auf Facebook" : language === "it" ? "VIP Tourist Transfer su Facebook" : language === "pt" ? "VIP Tourist Transfer no Facebook" : "VIP Tourist TransferのFacebook"}
  title="Facebook"
  className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-110 hover:bg-blue-700"
>
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6"
    aria-hidden="true"
  >
    <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H17V2.4c-.3 0-1.4-.1-2.7-.1-2.7 0-4.6 1.7-4.6 4.7v2.5H7V13h2.7v9h3.8z" />
  </svg>
</a>

{/* TRIPADVISOR */}
<a
  href="https://www.tripadvisor.es/Attraction_Review-g147289-d33020734-Reviews-VIP_TOURIST_TRANSFERS-Santo_Domingo_Santo_Domingo_Province_Dominican_Republic.html"
  target="_blank"
  rel="noopener noreferrer"
  aria-label={language === "es" ? "Tripadvisor de VIP Tourist Transfer" : language === "en" ? "VIP Tourist Transfer on Tripadvisor" : language === "fr" ? "VIP Tourist Transfer sur Tripadvisor" : language === "de" ? "VIP Tourist Transfer auf Tripadvisor" : language === "it" ? "VIP Tourist Transfer su Tripadvisor" : language === "pt" ? "VIP Tourist Transfer no Tripadvisor" : "VIP Tourist TransferのTripadvisor"}
  title="Tripadvisor"
  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00AA6C] text-white shadow-lg transition hover:scale-110 hover:bg-[#008f5b]"
>
  <span className="text-xl font-black">TA</span>
</a>

        {/* WHATSAPP */}
<a
  href={`https://wa.me/18296502013?text=${encodeURIComponent(
  language === "es"
    ? "Hola, quiero información sobre un traslado con VIP Tourist Transfers."
    : language === "en"
    ? "Hello, I would like information about a transfer with VIP Tourist Transfers."
    : language === "fr"
    ? "Bonjour, je souhaite obtenir des informations sur un transfert avec VIP Tourist Transfers."
    : language === "de"
    ? "Hallo, ich möchte Informationen über einen Transfer mit VIP Tourist Transfers."
    : language === "it"
    ? "Ciao, vorrei informazioni su un trasferimento con VIP Tourist Transfers."
    : language === "pt"
    ? "Olá, gostaria de informações sobre um transfer com VIP Tourist Transfers."
    : "こんにちは。VIP Tourist Transfersの送迎について詳しく知りたいです。"
)}`}
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
        {contactUi[language].button}
      </a>
    </div>

  </div>

  <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-5 pt-6 text-center text-sm lg:px-8">
  <p>
    © 2026 VIP Tourist Transfer. {language === "es" ? "Todos los derechos reservados." : language === "en" ? "All rights reserved." : language === "fr" ? "Tous droits réservés." : language === "de" ? "Alle Rechte vorbehalten." : language === "it" ? "Tutti i diritti riservati." : language === "pt" ? "Todos os direitos reservados." : "無断転載を禁じます。"}
  </p>

  <p className="mt-2 text-[10px] tracking-wider text-zinc-700">
    Website by <span className="font-semibold text-zinc-600">Axel Roble</span>
  </p>
</div>
</footer>

  <div className="fixed bottom-5 right-3 z-[100] flex flex-col gap-2 sm:bottom-5 sm:right-5 sm:gap-3">

  {/* LLAMAR */}
  <a
    href="tel:+18296502013"
    aria-label={contactUi[language].callAria}
    title={contactUi[language].callTitle}
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
  aria-label={language === "es" ? "Instagram de VIP Tourist Transfer" : language === "en" ? "VIP Tourist Transfer on Instagram" : language === "fr" ? "VIP Tourist Transfer sur Instagram" : language === "de" ? "VIP Tourist Transfer auf Instagram" : language === "it" ? "VIP Tourist Transfer su Instagram" : language === "pt" ? "VIP Tourist Transfer no Instagram" : "VIP Tourist TransferのInstagram"}
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

{/* FACEBOOK */}
<a
  href="https://www.facebook.com/share/17revdigwc/"
  target="_blank"
  rel="noopener noreferrer"
  aria-label={language === "es" ? "Facebook de VIP Tourist Transfer" : language === "en" ? "VIP Tourist Transfer on Facebook" : language === "fr" ? "VIP Tourist Transfer sur Facebook" : language === "de" ? "VIP Tourist Transfer auf Facebook" : language === "it" ? "VIP Tourist Transfer su Facebook" : language === "pt" ? "VIP Tourist Transfer no Facebook" : "VIP Tourist TransferのFacebook"}
  title="Facebook"
  className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition hover:scale-110 hover:bg-blue-700"
>
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H17V2.4c-.3 0-1.4-.1-2.7-.1-2.7 0-4.6 1.7-4.6 4.7v2.5H7V13h2.7v9h3.8z" />
  </svg>
</a>

  {/* WHATSAPP */}
  <a
    href={`https://wa.me/18296502013?text=${encodeURIComponent(
  language === "es"
    ? "Hola, quiero información sobre un traslado con VIP Tourist Transfers."
    : language === "en"
    ? "Hello, I would like information about a transfer with VIP Tourist Transfers."
    : language === "fr"
    ? "Bonjour, je souhaite obtenir des informations sur un transfert avec VIP Tourist Transfers."
    : language === "de"
    ? "Hallo, ich möchte Informationen über einen Transfer mit VIP Tourist Transfers."
    : language === "it"
    ? "Ciao, vorrei informazioni su un trasferimento con VIP Tourist Transfers."
    : language === "pt"
    ? "Olá, gostaria de informações sobre um transfer com VIP Tourist Transfers."
    : "こんにちは。VIP Tourist Transfersの送迎について詳しく知りたいです。"
)}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="WhatsApp"
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