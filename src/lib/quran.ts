import { supabase } from "@/integrations/supabase/client";

export type SurahMeta = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

export type Ayah = {
  numberInSurah: number;
  globalNumber: number;
  arabic: string;
  french: string;
  audio: string;
};

const API = "https://api.alquran.cloud/v1";

export async function fetchSurahList(): Promise<SurahMeta[]> {
  const res = await fetch(`${API}/surah`);
  if (!res.ok) throw new Error("Impossible de charger la liste des sourates");
  const json = (await res.json()) as { data: SurahMeta[] };
  return json.data;
}

export async function fetchSurah(number: number): Promise<{ meta: SurahMeta; ayahs: Ayah[] }> {
  const res = await fetch(`${API}/surah/${number}/editions/quran-uthmani,fr.hamidullah`);
  if (!res.ok) throw new Error("Impossible de charger cette sourate");
  const json = (await res.json()) as {
    data: Array<
      SurahMeta & { ayahs: Array<{ number: number; numberInSurah: number; text: string }> }
    >;
  };
  const [arabic, french] = json.data;
  if (!arabic) throw new Error("Sourate introuvable");
  const ayahs: Ayah[] = arabic.ayahs.map((a, i) => ({
    numberInSurah: a.numberInSurah,
    globalNumber: a.number,
    arabic: a.text,
    french: french?.ayahs[i]?.text ?? "",
    audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${a.number}.mp3`,
  }));
  const { ayahs: _drop, ...meta } = arabic;
  return { meta, ayahs };
}

export type Bookmark = {
  id: string;
  surah_number: number;
  ayah_number: number;
  note: string | null;
};

export async function fetchBookmarks() {
  const { data, error } = await supabase
    .from("quran_bookmarks")
    .select("id, surah_number, ayah_number, note")
    .order("surah_number");
  if (error) throw new Error(error.message);
  return (data ?? []) as Bookmark[];
}

export async function toggleBookmark(userId: string, surah: number, ayah: number, existing?: string) {
  if (existing) {
    const { error } = await supabase.from("quran_bookmarks").delete().eq("id", existing);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase
    .from("quran_bookmarks")
    .insert({ user_id: userId, surah_number: surah, ayah_number: ayah });
  if (error) throw new Error(error.message);
}

export async function fetchLastRead() {
  const { data, error } = await supabase
    .from("quran_last_read")
    .select("surah_number, ayah_number")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as { surah_number: number; ayah_number: number } | null;
}

export async function saveLastRead(userId: string, surah: number, ayah: number) {
  const { error } = await supabase.from("quran_last_read").upsert(
    { user_id: userId, surah_number: surah, ayah_number: ayah, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
}
