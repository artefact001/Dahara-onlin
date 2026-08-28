import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="bg-cream border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-14 animate-fadein">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
          {eyebrow}
        </div>
        <h1 className="mt-3 font-display font-medium text-ink text-3xl sm:text-4xl max-w-[24ch] text-balance">
          {title}
        </h1>
        {children ? (
          <div className="mt-5 text-base text-ink-soft max-w-[52ch] leading-relaxed text-pretty">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
