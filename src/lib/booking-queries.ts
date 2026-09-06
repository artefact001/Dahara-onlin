import { supabase } from "@/integrations/supabase/client";

export const WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export type TeacherProfile = {
  id: string;
  user_id: string | null;
  slug: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  photo_url: string | null;
  subjects: string[];
  languages: string[];
  hourly_price: number;
  rating: number;
  status: string;
  created_at: string;
};

export type Availability = {
  id: string;
  teacher_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

export type Booking = {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  starts_at: string;
  duration_minutes: number;
  price: number;
  status: string;
  notes: string | null;
  room_name: string;
  recording_url: string | null;
};

const TEACHER_COLS =
  "id, user_id, slug, full_name, headline, bio, city, photo_url, subjects, languages, hourly_price, rating, status, created_at";

export async function fetchTeachers() {
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select(TEACHER_COLS)
    .eq("status", "valide")
    .order("rating", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as TeacherProfile[];
}

export async function fetchTeacherBySlug(slug: string) {
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select(TEACHER_COLS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as TeacherProfile | null;
}

export async function fetchMyTeacherProfile(userId: string) {
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select(TEACHER_COLS)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as TeacherProfile | null;
}

export async function fetchAllApplications() {
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select(TEACHER_COLS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as TeacherProfile[];
}

export async function setTeacherStatus(id: string, status: "valide" | "refuse" | "en_attente") {
  const { error } = await supabase.from("teacher_profiles").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function applyAsTeacher(input: {
  user_id: string;
  full_name: string;
  headline: string;
  bio: string;
  city: string;
  subjects: string[];
  languages: string[];
  hourly_price: number;
}) {
  const base = input.full_name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${base || "professeur"}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await supabase.from("teacher_profiles").insert({ ...input, slug });
  if (error) throw new Error(error.message);
}

export async function updateTeacherProfile(id: string, values: Partial<TeacherProfile>) {
  const { error } = await supabase.from("teacher_profiles").update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function fetchAvailability(teacherId: string) {
  const { data, error } = await supabase
    .from("teacher_availability")
    .select("id, teacher_id, weekday, start_time, end_time")
    .eq("teacher_id", teacherId)
    .order("weekday");
  if (error) throw new Error(error.message);
  return (data ?? []) as Availability[];
}

export async function addAvailability(teacherId: string, weekday: number, start: string, end: string) {
  const { error } = await supabase
    .from("teacher_availability")
    .insert({ teacher_id: teacherId, weekday, start_time: start, end_time: end });
  if (error) throw new Error(error.message);
}

export async function removeAvailability(id: string) {
  const { error } = await supabase.from("teacher_availability").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

const BOOKING_COLS =
  "id, student_id, teacher_id, subject, starts_at, duration_minutes, price, status, notes, room_name, recording_url";

export async function fetchTeacherBookings(teacherId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_COLS)
    .eq("teacher_id", teacherId)
    .order("starts_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as Booking[];
}

export async function fetchBookedSlots(teacherId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("starts_at, duration_minutes")
    .eq("teacher_id", teacherId)
    .in("status", ["en_attente", "confirme"]);
  if (error) return [] as { starts_at: string; duration_minutes: number }[];
  return (data ?? []) as { starts_at: string; duration_minutes: number }[];
}

export async function fetchMyBookings(userId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_COLS)
    .eq("student_id", userId)
    .order("starts_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as Booking[];
}

export async function createBooking(input: {
  student_id: string;
  teacher_id: string;
  subject: string;
  starts_at: string;
  duration_minutes: number;
  price: number;
  notes?: string;
}) {
  const { error } = await supabase.from("bookings").insert(input);
  if (error) throw new Error(error.message);
}

export async function setBookingStatus(
  id: string,
  status: "confirme" | "annule" | "termine" | "en_attente",
) {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function saveRecordingUrl(id: string, url: string) {
  const { error } = await supabase.from("bookings").update({ recording_url: url }).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Créneaux d'une heure générés à partir des disponibilités hebdomadaires, sur 14 jours. */
export function generateSlots(
  availability: Availability[],
  booked: { starts_at: string; duration_minutes: number }[],
  days = 14,
) {
  const takenKeys = new Set(booked.map((b) => new Date(b.starts_at).toISOString().slice(0, 16)));
  const slots: { start: Date; taken: boolean }[] = [];
  const now = new Date();
  for (let d = 0; d < days; d += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);
    for (const a of availability.filter((x) => x.weekday === day.getDay())) {
      const [sh = 0, sm = 0] = a.start_time.split(":").map(Number);
      const [eh = 0] = a.end_time.split(":").map(Number);
      for (let h = sh; h < eh; h += 1) {
        const start = new Date(day);
        start.setHours(h, sm, 0, 0);
        if (start <= now) continue;
        slots.push({ start, taken: takenKeys.has(start.toISOString().slice(0, 16)) });
      }
    }
  }
  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function formatSlot(d: Date) {
  return d.toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(n: number) {
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

export const BOOKING_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirme: "Confirmé",
  annule: "Annulé",
  termine: "Terminé",
};
