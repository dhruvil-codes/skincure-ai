'use client';

export default function MarqueeSection() {
  return (
    <section className="bg-background py-16 sm:py-24 overflow-hidden border-y border-border">
      <div className="flex whitespace-nowrap overflow-hidden">
        <div className="flex animate-marquee items-center gap-12">
          {/* Repeat the text cluster a few times for smooth infinite scroll */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 text-foreground">
              <span
                className="font-display font-medium opacity-90 tracking-tight"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 6vw, 5rem)' }}
              >
                Analyse With Us
              </span>
              <span className="text-primary opacity-60 text-2xl">·</span>
              <span
                className="font-display font-medium opacity-90 tracking-tight"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 6vw, 5rem)' }}
              >
                Start Your Journey
              </span>
              <span className="text-primary opacity-60 text-2xl">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
