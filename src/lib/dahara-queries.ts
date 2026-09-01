import { supabase } from "@/integrations/supabase/client";

export const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerName = (typeof PRAYERS)[number];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  Fajr: "Fajr (aube)",
  Dhuhr: "Dhuhr (midi)",
  Asr: "Asr (après-midi)",
  Maghrib: "Maghrib (coucher)",
  Isha: "Isha (nuit)",
};

export type Profile = {
  id: string;
  full_name: string;
  city: string | null;
  bio: string | null;
  languages: string[];
  is_teacher: boolean;
  daily_minutes_goal: number;
  weekly_verses_goal: number;
};

export type PathStep = {
  id: string;
  title: string;
  detail: string | null;
  position: number;
  status: "a_faire" | "en_cours" | "termine";
  target_date: string | null;
};

export type Goal = {
  id: string;
  label: string;
  period: string;
  target_value: number;
  current_value: number;
  unit: string;
};

export type PrayerReminder = {
  id: string;
  prayer: string;
  enabled: boolean;
  offset_minutes: number;
  city: string;
};

export type SurahProgress = {
  id: string;
  surah_number: number;
  surah_name: string;
  total_verses: number;
  memorized_verses: number;
  last_reviewed_at: string | null;
};

export type MemoSession = {
  id: string;
  session_date: string;
  surah_number: number | null;
  verses: number;
  minutes: number;
};

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export async function fetchProfile(userId: string) {
  return unwrap<Profile>(
    (await supabase
      .from("profiles")
      .select("id, full_name, city, bio, languages, is_teacher, daily_minutes_goal, weekly_verses_goal")
      .eq("id", userId)
      .maybeSingle()) as never,
  );
}

export async function updateProfile(userId: string, values: Partial<Profile>) {
  const { error } = await supabase.from("profiles").update(values).eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function fetchRoles(userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.role as string);
}

export async function fetchPath() {
  const { data: path, error } = await supabase
    .from("learning_paths")
    .select("id, title, description")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!path) return { path: null, steps: [] as PathStep[] };

  const { data: steps, error: stepsError } = await supabase
    .from("path_steps")
    .select("id, title, detail, position, status, target_date")
    .eq("path_id", path.id)
    .order("position");
  if (stepsError) throw new Error(stepsError.message);

  return { path, steps: (steps ?? []) as PathStep[] };
}

export async function setStepStatus(stepId: string, status: PathStep["status"]) {
  const { error } = await supabase.from("path_steps").update({ status }).eq("id", stepId);
  if (error) throw new Error(error.message);
}

export async function addStep(pathId: string, userId: string, title: string, position: number) {
  const { error } = await supabase
    .from("path_steps")
    .insert({ path_id: pathId, user_id: userId, title, position });
  if (error) throw new Error(error.message);
}

export async function fetchGoals() {
  const { data, error } = await supabase
    .from("goals")
    .select("id, label, period, target_value, current_value, unit")
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as Goal[];
}

export async function updateGoal(id: string, values: Partial<Goal>) {
  const { error } = await supabase.from("goals").update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function fetchReminders() {
  const { data, error } = await supabase
    .from("prayer_reminders")
    .select("id, prayer, enabled, offset_minutes, city")
    .order("created_at");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as PrayerReminder[];
  return PRAYERS.map((p) => rows.find((r) => r.prayer === p)).filter(Boolean) as PrayerReminder[];
}

export async function updateReminder(id: string, values: Partial<PrayerReminder>) {
  const { error } = await supabase.from("prayer_reminders").update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setRemindersCity(userId: string, city: string) {
  const { error } = await supabase.from("prayer_reminders").update({ city }).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function fetchSurahProgress() {
  const { data, error } = await supabase
    .from("surah_progress")
    .select("id, surah_number, surah_name, total_verses, memorized_verses, last_reviewed_at")
    .order("surah_number");
  if (error) throw new Error(error.message);
  return (data ?? []) as SurahProgress[];
}

export async function upsertSurahProgress(row: {
  user_id: string;
  surah_number: number;
  surah_name: string;
  total_verses: number;
  memorized_verses: number;
}) {
  const { error } = await supabase
    .from("surah_progress")
    .upsert({ ...row, last_reviewed_at: new Date().toISOString() }, { onConflict: "user_id,surah_number" });
  if (error) throw new Error(error.message);
}

export async function fetchSessions() {
  const { data, error } = await supabase
    .from("memorization_sessions")
    .select("id, session_date, surah_number, verses, minutes")
    .order("session_date", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return (data ?? []) as MemoSession[];
}

export async function addSession(row: {
  user_id: string;
  surah_number: number | null;
  verses: number;
  minutes: number;
}) {
  const { error } = await supabase.from("memorization_sessions").insert(row);
  if (error) throw new Error(error.message);
}

export function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function weeklyVerses(sessions: MemoSession[]) {
  const start = startOfWeek();
  return sessions
    .filter((s) => new Date(s.session_date) >= start)
    .reduce((sum, s) => sum + s.verses, 0);
}

export function currentStreak(sessions: MemoSession[]) {
  const days = new Set(sessions.map((s) => s.session_date));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) {
      if (streak === 0 && days.size > 0) {
        cursor.setDate(cursor.getDate() - 1);
        if (days.has(cursor.toISOString().slice(0, 10))) continue;
      }
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
