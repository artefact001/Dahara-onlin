import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PLANS } from "@/lib/site-data";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — abonnements et séances | Dahara Online" },
      {
        name: "description",
        content:
          "Trois formules simples : Découverte gratuite, Dahara avec professeur attitré et Famille jusqu'à 4 apprenants. Sans engagement.",
      },
      { property: "og:title", content: "Tarifs Dahara Online" },
      {
        property: "og:description",
        content:
          "Découverte gratuite, Dahara à 9 900 FCFA/mois ou Famille à 17 900 FCFA/mois. Sans engagement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TarifsPage,
});

const FAQ = [
  ["Puis-je changer de professeur ?", "Oui, à tout moment et sans frais depuis votre espace Mon Dahara."],
  ["Y a-t-il un engagement ?", "Non. Les abonnements sont mensuels et résiliables en un clic."],
  ["Comment payer depuis le Sénégal ?", "Wave, Orange Money, carte bancaire et virement sont acceptés."],
  ["Les cours sont-ils enregistrés ?", "Oui, les séances individuelles restent disponibles 30 jours en replay."],
];

function TarifsPage() {
  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Tarifs" title="Un dahara accessible, sans engagement.">
        Commencez gratuitement, puis passez à un parcours accompagné quand vous êtes prêt. Les
        séances à l'unité restent toujours possibles.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-3 gap-4">
            {PLANS.map((p) => (
              <article
                key={p.name}
                className={
                  p.highlight
                    ? "bg-forest text-cream rounded-[16px] p-7 ring-1 ring-forest-deep/30"
                    : "bg-cream rounded-[16px] p-7 ring-1 ring-black/5"
                }
              >
                <div
                  className={`text-[11px] font-mono uppercase tracking-[0.22em] ${
                    p.highlight ? "text-gold" : "text-terra-deep"
                  }`}
                >
                  {p.name}
                </div>
                <div className="mt-4 font-display text-3xl">
                  {p.price}{" "}
                  <span
                    className={`text-sm font-body ${p.highlight ? "text-cream/60" : "text-ink-soft/70"}`}
                  >
                    {p.unit}
                  </span>
                </div>
                <p className={`mt-3 text-sm ${p.highlight ? "text-cream/70" : "text-ink-soft"}`}>
                  {p.tagline}
                </p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <span className={p.highlight ? "text-gold" : "text-terra"}>✓</span>
                      <span className={p.highlight ? "text-cream/85" : "text-ink-soft"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`mt-7 block text-center w-full text-sm font-medium rounded-[10px] py-3 ${
                    p.highlight
                      ? "bg-terra text-cream"
                      : "text-forest border border-forest/25 hover:bg-forest/5"
                  }`}
                >
                  {p.cta}
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 bg-cream rounded-[16px] ring-1 ring-black/5 p-7">
            <h2 className="font-display font-medium text-2xl text-ink">Séances à l'unité</h2>
            <p className="mt-2 text-sm text-ink-soft max-w-[52ch]">
              Sans abonnement, vous payez uniquement la séance réservée — de 4 000 à 6 500 FCFA
              selon le professeur et la durée.
            </p>
            <Link
              to="/professeurs"
              className="mt-5 inline-block text-sm font-medium bg-forest text-cream rounded-[10px] px-5 py-3"
            >
              Voir les professeurs
            </Link>
          </div>

          <div className="mt-12">
            <h2 className="font-display font-medium text-2xl text-ink">Questions fréquentes</h2>
            <dl className="mt-6 grid sm:grid-cols-2 gap-4">
              {FAQ.map(([q, a]) => (
                <div key={q} className="bg-cream rounded-[14px] ring-1 ring-black/5 p-5">
                  <dt className="font-display text-lg text-ink">{q}</dt>
                  <dd className="mt-2 text-sm text-ink-soft leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
