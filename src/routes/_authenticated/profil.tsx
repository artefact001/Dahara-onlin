import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { fetchProfile, fetchRoles, updateProfile } from "@/lib/dahara-queries";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — élève ou professeur | Dahara Online" },
      {
        name: "description",
        content:
          "Gérez vos informations, votre ville, vos langues et vos objectifs quotidiens et hebdomadaires d'apprentissage.",
      },
      { property: "og:title", content: "Mon profil — Dahara Online" },
      {
        property: "og:description",
        content: "Informations personnelles, rôle, langues enseignées et objectifs d'apprentissage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilPage,
});

function ProfilPage() {
  const { user, signOut } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const profile = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
  const roles = useQuery({
    queryKey: ["roles", userId],
    queryFn: () => fetchRoles(userId!),
    enabled: !!userId,
  });

  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [weeklyVerses, setWeeklyVerses] = useState(20);

  useEffect(() => {
    const p = profile.data;
    if (!p) return;
    setFullName(p.full_name);
    setCity(p.city ?? "");
    setBio(p.bio ?? "");
    setLanguages((p.languages ?? []).join(", "));
    setDailyMinutes(p.daily_minutes_goal);
    setWeeklyVerses(p.weekly_verses_goal);
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () =>
      updateProfile(userId!, {
        full_name: fullName,
        city: city || null,
        bio: bio || null,
        languages: languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        daily_minutes_goal: dailyMinutes,
        weekly_verses_goal: weeklyVerses,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Profil enregistré");
    },
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const isTeacher = roles.data?.includes("professeur") || profile.data?.is_teacher;

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Mon espace" title="Votre profil Dahara">
        Vos informations, votre rôle et vos objectifs d'apprentissage. Tout reste privé, à
        l'exception du profil public des professeurs.
      </PageHero>

      <section className="bg-cream">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 grid lg:grid-cols-3 gap-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6 space-y-4">
              <h2 className="font-display font-medium text-xl text-ink">Informations</h2>
              <Field label="Nom complet">
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="field" />
              </Field>
              <Field label="Ville">
                <input value={city} onChange={(e) => setCity(e.target.value)} className="field" />
              </Field>
              <Field label={isTeacher ? "Présentation publique" : "À propos de moi"}>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="Langues (séparées par des virgules)">
                <input
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="field"
                  placeholder="Wolof, Français, العربية"
                />
              </Field>
            </div>

            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6 space-y-4">
              <h2 className="font-display font-medium text-xl text-ink">Mes objectifs</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Minutes de révision par jour">
                  <input
                    type="number"
                    min={5}
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="field"
                  />
                </Field>
                <Field label="Versets par semaine">
                  <input
                    type="number"
                    min={1}
                    value={weeklyVerses}
                    onChange={(e) => setWeeklyVerses(Number(e.target.value))}
                    className="field"
                  />
                </Field>
              </div>
            </div>

            <button
              disabled={save.isPending}
              className="text-sm font-medium bg-forest text-cream rounded-[10px] px-5 py-3 disabled:opacity-60"
            >
              Enregistrer
            </button>
          </form>

          <aside className="space-y-4">
            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                Compte
              </div>
              <div className="mt-4 text-sm text-ink-soft break-words">{user?.email}</div>
              <div className="mt-3 inline-block text-xs font-mono px-2.5 py-1 rounded-full bg-forest/10 text-forest">
                {isTeacher ? "Professeur" : "Élève"}
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  qc.clear();
                  navigate({ to: "/" });
                }}
                className="mt-6 w-full text-sm font-medium rounded-[10px] py-3 ring-1 ring-black/10 text-ink-soft hover:bg-cream"
              >
                Se déconnecter
              </button>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono uppercase tracking-wider text-ink-soft/70">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
