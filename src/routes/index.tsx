import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import heroDahra from "@/assets/hero-dahra.jpg";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SUBJECTS, TEACHERS } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dahara Online — Apprenez. Progressez. Transmettez." },
      {
        name: "description",
        content:
          "Trouvez un professeur vérifié d'arabe, de Coran, de tajwid ou de sciences islamiques. Cours en direct, planning flexible, bibliothèque et suivi de progression.",
      },
      { property: "og:title", content: "Dahara Online — Apprenez. Progressez. Transmettez." },
      {
        property: "og:description",
        content:
          "Votre dahara accessible partout : enseignants vérifiés, cours en direct et ressources islamiques adaptées à votre rythme.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


function Index() {
  const [activeSubject, setActiveSubject] = useState("Coran");

  return (
    <div className="bg-cream text-ink font-body">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-24 sm:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-7 animate-fadein">
              <div className="flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                <span className="size-1.5 rounded-full bg-terra" /> Le dahara, dans votre poche
              </div>
              <h1 className="mt-5 font-display font-medium text-ink text-4xl sm:text-5xl max-w-[18ch] text-balance">
                Apprenez. <span className="text-terra">Progressez.</span> Transmettez.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-ink-soft max-w-[46ch] text-pretty leading-relaxed">
                Votre dahara accessible partout&nbsp;: des enseignants vérifiés, des cours en
                direct, et des ressources islamiques adaptées à votre rythme — du Sénégal à la
                diaspora.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#professeurs"
                  className="text-sm font-medium bg-terra text-cream rounded-[10px] px-5 py-3 ring-1 ring-terra-deep/30 transition-transform hover:-translate-y-0.5"
                >
                  Trouver un professeur
                </a>
                <a
                  href="#mon-dahara"
                  className="text-sm font-medium text-ink border border-ink/20 rounded-[10px] px-5 py-3 hover:bg-sand/60"
                >
                  Commencer gratuitement
                </a>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-ink-soft">
                <div className="flex items-center gap-2">
                  <span className="text-forest font-semibold">
                    4,9<span className="text-ink-soft/50">/5</span>
                  </span>{" "}
                  320 avis
                </div>
                <div className="hidden sm:block w-px h-4 bg-ink/15" />
                <span className="hidden sm:block">2 400 enseignants vérifiés</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <img
                src={heroDahra}
                width={1024}
                height={1280}
                alt="Cours du soir dans un dahra sénégalais, à la lueur d'une lampe"
                className="w-full aspect-[4/5] object-cover rounded-[16px] outline-1 -outline-offset-1 outline-black/5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MON DAHARA */}
      <section id="mon-dahara" className="bg-forest text-cream scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-gold">
                Mon Dahara
              </div>
              <h2 className="mt-2 font-display font-medium text-3xl max-w-[40ch] text-balance">
                Bonjour Cheikh, le savoir vous attend.
              </h2>
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
              <div className="mt-4 h-1 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gold animate-barfill"
                  style={{ width: "62%" }}
                />
              </div>
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
              <div className="mt-4 h-1 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gold animate-barfill"
                  style={{ width: "63%" }}
                />
              </div>
            </div>
            <div className="bg-forest-deep/50 rounded-[14px] p-5 ring-1 ring-white/10">
              <div className="text-cream/60 text-xs font-mono uppercase tracking-wider">
                Série &amp; objectif
              </div>
              <div className="mt-4 font-display text-2xl">
                <span className="text-terra">12</span> jours
              </div>
              <div className="mt-1 text-sm text-cream/70">Objectif&nbsp;: 30 min</div>
              <div className="mt-4 h-1 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-terra animate-barfill"
                  style={{ width: "40%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH + TEACHERS */}
      <section id="professeurs" className="bg-sand scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-[40ch]">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
              Trouver un professeur
            </div>
            <h2 className="mt-2 font-display font-medium text-3xl text-ink max-w-[40ch] text-balance">
              Des enseignants vérifiés, du débutant au perfectionnement.
            </h2>
          </div>

          <div className="mt-8 bg-cream rounded-[14px] ring-1 ring-black/5 p-3 sm:p-4">
            <div className="grid sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  placeholder="Matière, prénom du professeur…"
                  className="w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-terra/40"
                />
              </div>
              <div className="sm:col-span-3">
                <select className="w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm text-ink-soft focus:outline-none focus:ring-2 focus:ring-terra/40">
                  <option>Tous niveaux</option>
                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <select className="w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm text-ink-soft focus:outline-none focus:ring-2 focus:ring-terra/40">
                  <option>Format</option>
                  <option>Individuel</option>
                  <option>Groupe</option>
                  <option>Enfant</option>
                  <option>Adulte</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button className="w-full text-sm font-medium bg-forest text-cream rounded-[10px] px-4 py-3 ring-1 ring-forest-deep/20 transition-transform hover:-translate-y-0.5">
                  Rechercher
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-ink-soft/60 font-mono uppercase tracking-wider mr-1">
              Filtres
            </span>
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={
                  activeSubject === subject
                    ? "bg-forest text-cream rounded-full px-3.5 py-1.5 font-medium"
                    : "bg-cream ring-1 ring-black/5 text-ink-soft rounded-full px-3.5 py-1.5 hover:ring-ink/20"
                }
              >
                {subject}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-1.5 text-forest">
              <span className="size-2 rounded-full bg-forest" />
              Disponible aujourd'hui
            </span>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEACHERS.map((teacher) => (
              <article
                key={teacher.name}
                className="bg-cream rounded-[14px] ring-1 ring-black/5 p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={teacher.photo}
                    width={512}
                    height={512}
                    loading="lazy"
                    alt={`Portrait de ${teacher.name}`}
                    className="size-14 shrink-0 rounded-[12px] object-cover outline-1 -outline-offset-1 outline-black/5"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg text-ink leading-tight">
                        {teacher.name}
                      </h3>
                      <span className="text-[10px] font-mono uppercase tracking-wide bg-forest/10 text-forest rounded-full px-2 py-0.5">
                        Vérifié
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-ink-soft">{teacher.subjects}</div>
                    <div className="mt-1.5 text-xs text-ink-soft/70">{teacher.meta}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    {teacher.rating} <span className="text-ink-soft/50 text-xs">/5</span>
                  </span>
                  <div className="flex gap-1.5 text-[11px] font-mono text-ink-soft">
                    {teacher.languages.map((lang) => (
                      <span key={lang} className="px-1.5 py-0.5 bg-sand rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-ink/10 flex items-center justify-between">
                  <div>
                    <div className="font-display text-xl text-terra-deep">
                      {teacher.price}{" "}
                      <span className="text-xs text-ink-soft/60 font-body">FCFA</span>
                    </div>
                    <div className="text-xs text-ink-soft/70">{teacher.session}</div>
                  </div>
                  <span className="text-xs flex items-center gap-1.5 text-forest">
                    <span className="size-2 rounded-full bg-forest" />
                    {teacher.days}
                  </span>
                </div>
                <Link
                  to="/professeurs/$slug"
                  params={{ slug: teacher.slug }}
                  className="mt-4 block text-center w-full text-sm font-medium text-forest border border-forest/25 rounded-[10px] py-2.5 hover:bg-forest/5"
                >
                  Réserver une séance
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
