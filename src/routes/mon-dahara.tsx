import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/mon-dahara")({
  head: () => ({
    meta: [
      { title: "Mon Dahara — tableau de bord d'apprentissage" },
      {
        name: "description",
        content:
          "Suivez vos cours, votre mémorisation du Coran, vos séries de révision et vos rappels de prière depuis un seul tableau de bord.",
      },
      { property: "og:title", content: "Mon Dahara — votre tableau de bord" },
      {
        property: "og:description",
        content:
          "Prochain cours, progression du Coran, série de régularité et objectifs quotidiens réunis en une page.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MonDaharaPage,
});

export function Bar({ value, color = "bg-gold" }: { value: number; color?: string }) {
  return (
    <div className="mt-4 h-1 rounded-full bg-white/10">
      <div
        className={`h-full rounded-full ${color} animate-barfill`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function MonDaharaPage() {
  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />

      <section className="bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16 animate-fadein">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-gold">
                Mon Dahara
              </div>
              <h1 className="mt-2 font-display font-medium text-3xl max-w-[40ch] text-balance">
                Bonjour Cheikh, le savoir vous attend.
              </h1>
            </div>
            <span className="hidden sm:block font-mono text-xs text-cream/50">Dakar · 18:42</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-forest-deep/50 rounded-[14px] p-5 ring-1 ring-white/10">
              <div className="text-cream/60 text-xs font-mono uppercase tracking-wider">
                Prochaine prière
              </div>
              <div className="mt-4 font-display text-2xl">Asr</div>
              <div className="mt-1 text-sm text-cream/70">
                dans <span className="font-mono text-gold">37 min</span>
              </div>
              <Bar value={62} />
            </div>
            <div className="bg-forest-deep/50 rounded-[14px] p-5 ring-1 ring-white/10">
              <div className="text-cream/60 text-xs font-mono uppercase tracking-wider">
                Prochain cours
              </div>
              <div className="mt-4 font-display text-2xl">Arabe</div>
              <div className="mt-1 text-sm text-cream/70">Aujourd'hui · 18h00</div>
              <div className="mt-4 font-mono text-xs text-cream/50">avec Ustadh Abdou</div>
            </div>
            <div className="bg-forest-deep/50 rounded-[14px] p-5 ring-1 ring-white/10">
              <div className="text-cream/60 text-xs font-mono uppercase tracking-wider">
                Livre en cours
              </div>
              <div className="mt-4 font-display text-2xl">63&nbsp;%</div>
              <div className="mt-1 text-sm text-cream/70">Introduction au Fiqh</div>
              <Bar value={63} />
            </div>
            <div className="bg-forest-deep/50 rounded-[14px] p-5 ring-1 ring-white/10">
              <div className="text-cream/60 text-xs font-mono uppercase tracking-wider">
                Série &amp; objectif
              </div>
              <div className="mt-4 font-display text-2xl">
                <span className="text-terra">12</span> jours
              </div>
              <div className="mt-1 text-sm text-cream/70">Objectif&nbsp;: 30 min</div>
              <Bar value={40} color="bg-terra" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <h2 className="font-display font-medium text-2xl text-ink">Mes prochaines séances</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Arabe · niveau 2", "Ustadh Abdou", "Aujourd'hui · 18h00", "45 min"],
                ["Tajwid", "Mme Aïcha Sarr", "Jeudi · 19h30", "40 min"],
                ["Fiqh des actes d'adoration", "Cheikh Moussa", "Samedi · 10h00", "60 min"],
              ].map(([title, teacher, when, dur]) => (
                <div
                  key={title}
                  className="bg-sand rounded-[14px] ring-1 ring-black/5 p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-display text-lg text-ink">{title}</div>
                    <div className="mt-1 text-sm text-ink-soft">{teacher}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-ink">{when}</div>
                    <div className="text-xs font-mono text-ink-soft/70">{dur}</div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-12 font-display font-medium text-2xl text-ink">Ma progression</h2>
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              {[
                ["Coran mémorisé", "12 sourates"],
                ["Heures de cours", "38 h"],
                ["Assiduité", "92 %"],
              ].map(([label, value]) => (
                <div key={label} className="bg-sand rounded-[14px] ring-1 ring-black/5 p-5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-ink-soft/70">
                    {label}
                  </div>
                  <div className="mt-3 font-display text-2xl text-ink">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-4">
            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                Objectif du jour
              </div>
              <p className="mt-3 text-ink-soft text-sm leading-relaxed">
                Réviser les 10 premiers versets d'Al-Kahf et 20 minutes de vocabulaire arabe.
              </p>
              <button className="mt-5 w-full text-sm font-medium bg-terra text-cream rounded-[10px] py-3">
                Lancer le minuteur
              </button>
            </div>
            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                Continuer
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <Link to="/coran" className="block text-ink hover:text-terra">
                  Sourate Al-Kahf · 45 %
                </Link>
                <Link to="/bibliotheque" className="block text-ink hover:text-terra">
                  Introduction au Fiqh · 63 %
                </Link>
                <Link to="/professeurs" className="block text-ink hover:text-terra">
                  Réserver une nouvelle séance
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
