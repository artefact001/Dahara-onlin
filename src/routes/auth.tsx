import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion & inscription | Dahara Online" },
      {
        name: "description",
        content:
          "Créez votre compte élève ou professeur pour accéder à votre parcours personnalisé, vos rappels de prière et votre suivi de mémorisation.",
      },
      { property: "og:title", content: "Connexion & inscription — Dahara Online" },
      {
        property: "og:description",
        content: "Accédez à votre espace Dahara : parcours, objectifs, mémorisation et rappels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("Dakar");
  const [role, setRole] = useState<"eleve" | "professeur">("eleve");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/mon-dahara" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/mon-dahara`,
            data: { full_name: fullName, city, role },
          },
        });
        if (error) throw error;
        toast.success("Compte créé", {
          description: "Vérifiez votre boîte mail si une confirmation est demandée.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await router.invalidate();
        navigate({ to: "/mon-dahara" });
      }
    } catch (error) {
      toast.error("Échec", { description: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Connexion Google impossible", { description: result.error.message });
      return;
    }
    if (result.redirected) return;
    await router.invalidate();
    navigate({ to: "/mon-dahara" });
  }

  return (
    <div className="bg-cream text-ink font-body min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 bg-sand/40">
        <div className="max-w-md mx-auto px-5 py-16 animate-fadein">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
            {mode === "login" ? "Bon retour" : "Bienvenue"}
          </div>
          <h1 className="mt-2 font-display font-medium text-3xl text-ink text-balance">
            {mode === "login" ? "Entrez dans votre dahara" : "Créez votre compte"}
          </h1>

          <div className="mt-7 bg-cream rounded-[16px] ring-1 ring-black/5 p-6">
            <button
              onClick={onGoogle}
              className="w-full text-sm font-medium border border-ink/15 rounded-[10px] py-3 hover:bg-sand/60"
            >
              Continuer avec Google
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-ink-soft/60">
              <span className="h-px flex-1 bg-ink/10" /> ou <span className="h-px flex-1 bg-ink/10" />
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "signup" && (
                <>
                  <Field label="Nom complet">
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input"
                      placeholder="Cheikh Tidiane Sane"
                    />
                  </Field>
                  <Field label="Ville">
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input"
                      placeholder="Dakar"
                    />
                  </Field>
                  <Field label="Je m'inscris comme">
                    <div className="grid grid-cols-2 gap-2">
                      {(["eleve", "professeur"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`text-sm rounded-[10px] py-2.5 ring-1 ${
                            role === r
                              ? "bg-forest text-cream ring-forest"
                              : "bg-sand/60 text-ink-soft ring-black/5"
                          }`}
                        >
                          {r === "eleve" ? "Élève" : "Professeur"}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}
              <Field label="Adresse e-mail">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="vous@exemple.com"
                />
              </Field>
              <Field label="Mot de passe">
                <input
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </Field>

              <button
                disabled={busy}
                className="mt-2 w-full text-sm font-medium bg-forest text-cream rounded-[10px] py-3 disabled:opacity-60"
              >
                {busy ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
              </button>
            </form>

            <p className="mt-5 text-sm text-ink-soft text-center">
              {mode === "login" ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-terra-deep font-medium hover:underline"
              >
                {mode === "login" ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>
      </main>

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
