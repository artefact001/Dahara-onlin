import { PRAYERS, type PrayerName } from "@/lib/dahara-queries";

export type PrayerTimes = Record<PrayerName, string>;

export const CITIES = [
  { city: "Dakar", country: "Senegal" },
  { city: "Thiès", country: "Senegal" },
  { city: "Saint-Louis", country: "Senegal" },
  { city: "Touba", country: "Senegal" },
  { city: "Paris", country: "France" },
  { city: "Bruxelles", country: "Belgium" },
  { city: "Montréal", country: "Canada" },
  { city: "New York", country: "United States" },
];

export async function fetchPrayerTimes(city: string): Promise<PrayerTimes> {
  const match = CITIES.find((c) => c.city === city) ?? CITIES[0]!;
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
    match.city,
  )}&country=${encodeURIComponent(match.country)}&method=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Impossible de récupérer les horaires de prière");
  const json = (await res.json()) as { data?: { timings?: Record<string, string> } };
  const timings = json.data?.timings;
  if (!timings) throw new Error("Horaires indisponibles");
  return PRAYERS.reduce((acc, p) => {
    acc[p] = (timings[p] ?? "--:--").slice(0, 5);
    return acc;
  }, {} as PrayerTimes);
}

export function minutesFromNow(time: string) {
  const parts = time.split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

export function nextPrayer(times: PrayerTimes) {
  const upcoming = PRAYERS.map((p) => ({ prayer: p, time: times[p], in: minutesFromNow(times[p]) }))
    .filter((p) => p.in !== null && p.in >= 0)
    .sort((a, b) => (a.in ?? 0) - (b.in ?? 0));
  return upcoming[0] ?? null;
}
