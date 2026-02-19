import Link from 'next/link';
import { Github, Twitter, Mail, Instagram, Linkedin } from 'lucide-react';
import { getSiteSettings } from '@/lib/api';

export async function Footer() {
  const currentYear = new Date().getFullYear();
  let settings = { app_name: 'DEV BLOG', app_subtitle: '', contact_email: '', social_github: '', social_twitter: '', social_linkedin: '', social_instagram: '' };
  try {
    const s = await getSiteSettings();
    settings = { ...settings, ...s };
  } catch {}

  const name = settings.app_name || 'DEV BLOG';
  const words = name.trim().split(/\s+/);
  const suffix = words.length > 1 ? words[words.length - 1].toLowerCase() : null;
  const prefix = (words.length > 1 ? words.slice(0, -1).join('') : words[0]).toLowerCase();

  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-6  py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight font-mono">
                <span className="text-[var(--primary)]">_</span>
                {prefix}
                {suffix && <span className="text-white/40">.{suffix}</span>}
              </span>
            </Link>
            <p className="text-sm text-white/40">{settings.app_subtitle || 'Crafting digital experiences'}</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {settings.social_github && (
              <a href={settings.social_github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all">
                <Github className="w-4 h-4" />
              </a>
            )}
            {settings.social_twitter && (
              <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {settings.social_linkedin && (
              <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {settings.social_instagram && (
              <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {settings.contact_email && (
              <a href={`mailto:${settings.contact_email}`} aria-label="Email"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-white/30 font-mono">
            &copy; {currentYear} {prefix}{suffix ? `.${suffix}` : ''}. Built with Next.js &amp; Go.
          </p>
        </div>
      </div>
    </footer>
  );
}
