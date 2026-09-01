import { useEffect, useState } from "react";

import { PRAYER_LABELS, type PrayerName, type PrayerReminder } from "@/lib/dahara-queries";
import { minutesFromNow, type PrayerTimes } from "@/lib/prayer-times";

type Permission = "default" | "granted" | "denied" | "unsupported";

export function usePrayerNotifications(
  times: PrayerTimes | undefined,
  reminders: PrayerReminder[] | undefined,
) {
  const [permission, setPermission] = useState<Permission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as Permission);
  }, []);

  useEffect(() => {
    if (permission !== "granted" || !times || !reminders) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const reminder of reminders) {
      if (!reminder.enabled) continue;
      const time = times[reminder.prayer as PrayerName];
      if (!time) continue;
      const inMinutes = minutesFromNow(time);
      if (inMinutes === null) continue;
      const fireIn = inMinutes - reminder.offset_minutes;
      if (fireIn <= 0 || fireIn > 24 * 60) continue;
      timers.push(
        setTimeout(
          () => {
            new Notification(`${PRAYER_LABELS[reminder.prayer as PrayerName]} à ${time}`, {
              body: `Rappel : la prière commence dans ${reminder.offset_minutes} minutes.`,
            });
          },
          fireIn * 60_000,
        ),
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [permission, times, reminders]);

  async function requestPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as Permission);
  }

  return { permission, requestPermission };
}
