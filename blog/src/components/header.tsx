'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Mail, Code, Terminal, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UPLOAD_URL } from '@/lib/api';
import type { SiteSettings } from '@/lib/api';

const navLinks = [
  { href: '/', label: 'Home', icon: Terminal },
  { href: '/blog', label: 'Blog', icon: Code },
  { href: '/portfolio', label: 'Projects', icon: Book },
  { href: '/contact', label: 'Contact', icon: Mail },
];

function SiteLogo({ settings }: { settings?: SiteSettings }) {
  const name = settings?.app_name || 'DEV BLOG';
  const logo = settings?.app_logo;

  if (logo) {
    return (
      <img
        src={`${UPLOAD_URL}${logo}`}
        alt={name}
        className="h-7 w-auto object-contain"
      />
    );
  }

  // "dimaswysnu blog"  _dimaswysnu.blog
  // "My Portfolio"    _my.portfolio
  const words = name.trim().split(/\s+/);
  const suffix = words.length > 1 ? words[words.length - 1].toLowerCase() : null;
  const prefix = (words.length > 1 ? words.slice(0, -1).join('') : words[0]).toLowerCase();

  return (
    <span className="text-xl font-bold tracking-tight font-mono">
      <span className="text-[var(--primary)]">_</span>
      {prefix}
      {suffix && <span className="text-white/40">.{suffix}</span>}
    </span>
  );
}

interface HeaderProps {
  settings?: SiteSettings;
}

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-black/80 backdrop-blur-lg border-b border-white/10'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <SiteLogo settings={settings} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 bg-white/5 rounded-full border border-white/5 p-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5',
                      active
                        ? 'bg-[var(--primary)] text-black'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu  CSS transition, no framer-motion */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-200 ease-in-out',
            mobileMenuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          )}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="py-4 space-y-1 border-t border-white/10">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
