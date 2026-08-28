import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — parler à l'équipe Dahara Online" },
      {
        name: "description",
        content:
          "Une question sur les cours, les abonnements ou un partenariat ? Écrivez à l'équipe Dahara Online, réponse sous 24 h ouvrées.",
      },
      { property: "og:title", content: "Contact — Dahara Online" },
      {
        property: "og:description",
        content: "Écrivez-nous : cours, abonnements, écoles et partenariats. Réponse sous 24 h.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Contact" title="Parlons de votre apprentissage.">
        Élève, parent, enseignant ou école : notre équipe à Dakar vous répond sous 24 heures
        ouvrées.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 grid lg:grid-cols-12 gap-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="lg:col-span-7 bg-cream rounded-[16px] ring-1 ring-black/5 p-6 sm:p-8"
          >
            {sent ? (
              <p className="text-sm text-forest">
                Merci, votre message est envoyé. Nous vous répondons très vite, in shâ'a Allah.
              </p>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-mono uppercase tracking-wider text-ink-soft/70">
                      Nom
                    </span>
                    <input
                      required
                      className="mt-1.5 w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-mono uppercase tracking-wider text-ink-soft/70">
                      Email
                    </span>
                    <input
                      required
                      type="email"
                      className="mt-1.5 w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
                    />
                  </label>
                </div>
                <label className="mt-3 block">
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-soft/70">
                    Sujet
                  </span>
                  <select className="mt-1.5 w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40">
                    <option>Trouver un professeur</option>
                    <option>Abonnement &amp; paiement</option>
                    <option>Devenir professeur</option>
                    <option>École ou association</option>
                    <option>Autre</option>
                  </select>
                </label>
                <label className="mt-3 block">
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-soft/70">
                    Message
                  </span>
                  <textarea
                    required
                    rows={6}
                    className="mt-1.5 w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-6 w-full sm:w-auto text-sm font-medium bg-forest text-cream rounded-[10px] px-6 py-3 ring-1 ring-forest-deep/20"
                >
                  Envoyer le message
                </button>
              </>
            )}
          </form>

          <aside className="lg:col-span-5 space-y-4">
            {[
              ["Email", "salam@dahara.online"],
              ["WhatsApp", "+221 77 000 00 00"],
              ["Bureau", "Sacré-Cœur 3, Dakar, Sénégal"],
              ["Horaires", "Lun – Sam · 9h – 19h (GMT)"],
            ].map(([l, v]) => (
              <div key={l} className="bg-cream rounded-[14px] ring-1 ring-black/5 p-5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-ink-soft/70">
                  {l}
                </div>
                <div className="mt-2 text-ink">{v}</div>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
