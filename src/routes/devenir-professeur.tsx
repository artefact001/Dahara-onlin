import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/devenir-professeur")({
  head: () => ({
    meta: [
      { title: "Devenir professeur sur Dahara Online" },
      {
        name: "description",
        content:
          "Enseignez l'arabe, le Coran ou les sciences islamiques en ligne : fixez vos tarifs, gérez votre planning et recevez vos paiements chaque semaine.",
      },
      { property: "og:title", content: "Devenir professeur — Dahara Online" },
      {
        property: "og:description",
        content:
          "Rejoignez les enseignants vérifiés de Dahara Online et transmettez le savoir au Sénégal et dans la diaspora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevenirProfesseurPage,
});

function DevenirProfesseurPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Enseigner" title="Transmettez votre savoir, où que soient vos élèves.">
        Vous êtes maître coranique, professeur d'arabe ou diplômé en sciences islamiques ?
        Rejoignez la communauté d'enseignants vérifiés de Dahara Online.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <h2 className="font-display font-medium text-2xl text-ink">Comment ça marche</h2>
            <ol className="mt-6 space-y-4">
              {[
                ["Candidatez", "Remplissez le formulaire avec vos matières et votre parcours."],
                ["Vérification", "Un entretien de 20 minutes et la validation de vos références."],
                ["Publiez votre profil", "Vous fixez vos tarifs, vos créneaux et vos formats."],
                ["Enseignez et soyez payé", "Paiement chaque semaine par Wave, Orange Money ou virement."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="size-8 shrink-0 grid place-items-center rounded-full bg-forest text-cream font-mono text-xs">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-display text-lg text-ink">{t}</div>
                    <p className="mt-1 text-sm text-ink-soft">{d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid sm:grid-cols-3 gap-3">
              {[
                ["Commission", "15 %"],
                ["Revenu moyen", "85 000 F/mois"],
                ["Élèves actifs", "6 200"],
              ].map(([l, v]) => (
                <div key={l} className="bg-cream rounded-[14px] ring-1 ring-black/5 p-5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-ink-soft/70">
                    {l}
                  </div>
                  <div className="mt-2 font-display text-xl text-ink">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="bg-cream rounded-[16px] ring-1 ring-black/5 p-6 sm:p-8"
            >
              <h2 className="font-display font-medium text-2xl text-ink">Votre candidature</h2>
              {sent ? (
                <p className="mt-4 text-sm text-forest">
                  Merci ! Votre candidature est enregistrée — nous revenons vers vous sous 48 h.
                </p>
              ) : (
                <>
                  <div className="mt-6 grid gap-3">
                    <Field label="Nom complet" placeholder="Ex. Ustadh Abdou Diop" />
                    <Field label="Email" type="email" placeholder="vous@exemple.com" />
                    <Field label="Téléphone / WhatsApp" placeholder="+221 …" />
                    <label className="block">
                      <span className="text-xs font-mono uppercase tracking-wider text-ink-soft/70">
                        Matières enseignées
                      </span>
                      <select className="mt-1.5 w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40">
                        <option>Coran &amp; Tajwid</option>
                        <option>Langue arabe</option>
                        <option>Hadith</option>
                        <option>Fiqh</option>
                        <option>Sirah</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-mono uppercase tracking-wider text-ink-soft/70">
                        Parcours &amp; expérience
                      </span>
                      <textarea
                        rows={4}
                        placeholder="Formation, dahra ou institut, années d'enseignement…"
                        className="mt-1.5 w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-terra/40"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="mt-6 w-full text-sm font-medium bg-forest text-cream rounded-[10px] py-3 ring-1 ring-forest-deep/20"
                  >
                    Envoyer ma candidature
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-mono uppercase tracking-wider text-ink-soft/70">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-terra/40"
      />
    </label>
  );
}
