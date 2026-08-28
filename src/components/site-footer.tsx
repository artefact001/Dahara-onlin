import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-forest-deep text-cream/70">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-xl text-cream">Dahara Online</div>
          <p className="mt-2 text-sm text-cream/50 max-w-[36ch]">
            Le dahara dans votre poche. Transmettre le savoir, de Dakar au monde.
          </p>
          <div
            className="mt-5 font-arabic text-2xl text-gold/80"
            dir="rtl"
            aria-hidden="true"
          >
            العلم نور
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-gold">
            Apprendre
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/professeurs" className="hover:text-cream">
                Professeurs
              </Link>
            </li>
            <li>
              <Link to="/coran" className="hover:text-cream">
                Coran
              </Link>
            </li>
            <li>
              <Link to="/bibliotheque" className="hover:text-cream">
                Bibliothèque
              </Link>
            </li>
            <li>
              <Link to="/mon-dahara" className="hover:text-cream">
                Mon Dahara
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-gold">
            Plateforme
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/tarifs" className="hover:text-cream">
                Tarifs
              </Link>
            </li>
            <li>
              <Link to="/devenir-professeur" className="hover:text-cream">
                Devenir professeur
              </Link>
            </li>
            <li>
              <Link to="/a-propos" className="hover:text-cream">
                À propos
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-cream">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-gold">
            Restons en contact
          </div>
          <p className="mt-4 text-sm text-cream/50">
            Dakar, Sénégal · salam@dahara.online
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-block text-sm font-medium bg-terra text-cream rounded-[10px] px-4 py-2.5"
          >
            Nous écrire
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 text-xs text-cream/40">
          © {new Date().getFullYear()} Dahara Online. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
