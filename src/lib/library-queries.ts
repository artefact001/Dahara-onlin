import { supabase } from "@/integrations/supabase/client";

export type Chapter = { title: string; content: string };

export type Book = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  language: string;
  description: string | null;
  cover_url: string | null;
  chapters: Chapter[];
};

export type Progress = {
  book_id: string;
  chapter_index: number;
  percent: number;
  last_read_at: string;
};

export async function fetchBooks() {
  const { data, error } = await supabase
    .from("books")
    .select("id, slug, title, author, category, language, description, cover_url, chapters")
    .order("title");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Book[];
}

export async function fetchBook(slug: string) {
  const { data, error } = await supabase
    .from("books")
    .select("id, slug, title, author, category, language, description, cover_url, chapters")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as Book | null;
}

export async function fetchFavorites() {
  const { data, error } = await supabase.from("book_favorites").select("id, book_id");
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; book_id: string }[];
}

export async function toggleFavorite(userId: string, bookId: string, existingId?: string) {
  if (existingId) {
    const { error } = await supabase.from("book_favorites").delete().eq("id", existingId);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase.from("book_favorites").insert({ user_id: userId, book_id: bookId });
  if (error) throw new Error(error.message);
}

export async function fetchReadingProgress() {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("book_id, chapter_index, percent, last_read_at")
    .order("last_read_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Progress[];
}

export async function saveReadingProgress(
  userId: string,
  bookId: string,
  chapterIndex: number,
  percent: number,
) {
  const { error } = await supabase.from("reading_progress").upsert(
    {
      user_id: userId,
      book_id: bookId,
      chapter_index: chapterIndex,
      percent,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_id" },
  );
  if (error) throw new Error(error.message);
}
