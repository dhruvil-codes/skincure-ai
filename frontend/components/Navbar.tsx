'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const links = [
    { href: '#how-it-works', label: 'How it Works' },
    { href: '#upload', label: 'Analyse' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <div className="fixed top-4 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50 transition-all duration-300">
      <nav
        className={`rounded-full transition-all duration-300 border ${
          scrolled 
            ? 'bg-background/90 backdrop-blur-md border-border shadow-lg py-3 px-6 md:px-8' 
            : 'bg-background/50 backdrop-blur-sm border-transparent py-4 px-6 md:px-8 shadow-sm hover:bg-background/80 hover:border-border'
        }`}
      >
        <div className="flex items-center justify-between gap-6 md:gap-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span
              className="font-display font-semibold text-3xl md:text-4xl tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Skin<span className="text-primary italic">Cure</span>
            </span>
          </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href}
               className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button asChild className="rounded-full px-5 py-2.5 font-medium">
            <a href="#upload">
              Get Started
            </a>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -mr-2 text-foreground focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background z-50 flex flex-col p-6 md:hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <span
                className="font-display font-semibold text-2xl tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Skin<span className="text-primary italic">Cure</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-foreground focus:outline-none"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-6 mt-8">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-auto">
              <Button asChild className="w-full rounded-full py-6 text-lg">
                <a href="#upload" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
