import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SURAHS } from "@/lib/site-data";

export const Route = createFileRoute("/coran")({
  head: () => ({
    meta: [
      { title: "Coran — lecture, mémorisation et tajwid | Dahara Online" },
      {
        name: "description",
        content:
          "Lisez et mémorisez le Coran sourate par sourate : texte arabe, traduction, audio des récitateurs et suivi de mémorisation.",
      },
      { property: "og:title", content: "Coran — lecture et mémorisation" },
      {
        property: "og:description",
        content:
          "Texte arabe, traduction française, récitations audio et suivi de votre mémorisation, sourate par sourate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoranPage,
});

const VERSES = [
  { n: 1, ar: "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَى عَبْدِهِ الْكِتَابَ", fr: "Louange à Allah qui a fait descendre sur Son serviteur le Livre" },
  { n: 2, ar: "قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ", fr: "et l'a préservé de toute tortuosité, afin qu'il avertisse d'un châtiment sévère venant de Sa part" },
  { n: 3, ar: "مَّاكِثِينَ فِيهِ أَبَدًا", fr: "où ils demeureront éternellement" },
];

function CoranPage() {
  const [selected, setSelected] = useState(SURAHS[2]!);

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Coran" title="Lire, écouter, mémoriser — à votre rythme.">
        Chaque sourate avec son texte arabe, la traduction française, l'audio du récitateur et un
        suivi de mémorisation qui reprend là où vous vous êtes arrêté.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-cream rounded-[16px] ring-1 ring-black/5 p-4">
              <input
                type="text"
                placeholder="Chercher une sourate…"
                className="w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-terra/40"
              />
              <ul className="mt-3 divide-y divide-ink/10">
                {SURAHS.map((s) => (
                  <li key={s.n}>
                    <button
                      onClick={() => setSelected(s)}
                      className={`w-full flex items-center gap-3 py-3 px-2 rounded-[10px] text-left ${
                        selected.n === s.n ? "bg-sand/70" : "hover:bg-sand/40"
                      }`}
                    >
                      <span className="size-8 shrink-0 grid place-items-center rounded-full bg-forest/10 text-forest text-xs font-mono">
                        {s.n}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-ink">{s.name}</span>
                        <span className="block text-xs text-ink-soft/70">{s.verses} versets</span>
                      </span>
                      <span className="font-arabic text-lg text-ink-soft" dir="rtl">
                        {s.ar}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-8">
            <article className="bg-cream rounded-[16px] ring-1 ring-black/5 p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                    Sourate {selected.n}
                  </div>
                  <h2 className="mt-2 font-display font-medium text-2xl text-ink">
                    {selected.name}
                  </h2>
                  <div className="mt-1 text-sm text-ink-soft">{selected.verses} versets</div>
                </div>
                <div className="font-arabic text-3xl text-forest" dir="rtl">
                  {selected.ar}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button className="text-sm font-medium bg-forest text-cream rounded-[10px] px-4 py-2.5">
                  ▶ Écouter la récitation
                </button>
                <button className="text-sm font-medium text-forest border border-forest/25 rounded-[10px] px-4 py-2.5 hover:bg-forest/5">
                  Mode mémorisation
                </button>
                <span className="ml-auto text-xs font-mono text-ink-soft/70">
                  Mémorisé · {selected.progress} %
                </span>
              </div>
              <div className="mt-3 h-1 rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-terra animate-barfill"
                  style={{ width: `${selected.progress}%` }}
                />
              </div>

              <div className="mt-8 divide-y divide-ink/10">
                {VERSES.map((v) => (
                  <div key={v.n} className="py-6">
                    <p className="font-arabic text-2xl leading-[2] text-ink text-right" dir="rtl">
                      {v.ar}
                      <span className="ms-2 text-sm text-gold font-mono">﴿{v.n}﴾</span>
                    </p>
                    <p className="mt-3 text-sm text-ink-soft leading-relaxed">{v.fr}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-soft/60 font-mono">
                Extrait de démonstration — le texte complet sera chargé depuis la bibliothèque.
              </p>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
