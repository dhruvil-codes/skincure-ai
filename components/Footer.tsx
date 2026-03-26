export default function Footer() {
  return (
    <footer className="bg-background pt-16 pb-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-16">
          {/* Column 1: Brand (spans 2 on large) */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-4 pr-10">
            <span
              className="font-display text-foreground text-2xl font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              SkinCure
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Scan, track, and understand your skin with clinical AI precision. The smart first step to dermatological care.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-muted border border-border text-muted-foreground px-2.5 py-1 rounded font-mono uppercase tracking-wider">PyTorch</span>
              <span className="text-[10px] bg-muted border border-border text-muted-foreground px-2.5 py-1 rounded font-mono uppercase tracking-wider">FastAPI</span>
            </div>
          </div>

          {/* Links 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-foreground text-xs font-bold uppercase tracking-wider">Sitemap</h4>
            {[
              { href: '#how-it-works', label: 'How it Works' },
              { href: '#upload', label: 'Skin Analysis' },
              { href: '#faq', label: 'FAQ' },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
          </div>

          {/* Links 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-foreground text-xs font-bold uppercase tracking-wider">Links</h4>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © 2026 Skin Cure. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-amber-600 dark:text-amber-500 text-xs font-medium flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full">
               System Status: InActive
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
