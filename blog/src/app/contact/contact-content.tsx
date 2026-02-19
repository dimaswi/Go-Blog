'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Mail, MapPin, Send, Github, Twitter, Linkedin, Instagram, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { FadeInUp, PageTransition } from '@/components/motion';
import { type SiteSettings } from '@/lib/api';

// API call lewat Next.js rewrite (/api → backend internal) agar tidak mixed content
const API_URL = '/api';

// ── Canvas CAPTCHA ────────────────────────────────────────────────
type CaptchaData = { a: number; b: number; op: string; answer: number };

function generateCaptcha(): CaptchaData {
  const ops = ['+', '+', '+', '-'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const a = Math.floor(Math.random() * 12) + 2;
  const b = op === '-' ? Math.floor(Math.random() * (a - 1)) + 1 : Math.floor(Math.random() * 12) + 1;
  return { a, b, op, answer: op === '+' ? a + b : a - b };
}

function drawCaptcha(canvas: HTMLCanvasElement, data: CaptchaData) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;

  // Background
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0d0d18');
  bg.addColorStop(1, '#080812');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grid lines (subtle)
  ctx.strokeStyle = 'rgba(0,229,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 18) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 18) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Noise dots
  for (let i = 0; i < 60; i++) {
    const hue = Math.random() > 0.5 ? 'rgba(0,229,255,' : 'rgba(168,85,247,';
    ctx.fillStyle = hue + (Math.random() * 0.35 + 0.05) + ')';
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Noise lines
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(0,229,255,${Math.random() * 0.12 + 0.04})`;
    ctx.lineWidth = Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * W, Math.random() * H);
    ctx.bezierCurveTo(
      Math.random() * W, Math.random() * H,
      Math.random() * W, Math.random() * H,
      Math.random() * W, Math.random() * H,
    );
    ctx.stroke();
  }

  // Text characters
  const text = `${data.a} ${data.op} ${data.b} = ?`;
  const chars = text.split('');
  const startX = (W - chars.length * 19) / 2 + 10;

  chars.forEach((ch, i) => {
    ctx.save();
    const x = startX + i * 19;
    const y = H / 2 + (Math.random() * 8 - 4);
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.35);

    // Glow
    const isCyan = ['0','1','2','3','4','5','6','7','8','9','+','-'].includes(ch);
    if (isCyan) {
      ctx.shadowColor = ch === '?' ? '#a855f7' : '#00e5ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = ch === '?' ? '#d8b4fe' : '#00e5ff';
    } else {
      ctx.shadowColor = 'rgba(255,255,255,0.3)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
    }

    const size = Math.floor(Math.random() * 5) + 22;
    ctx.font = `${Math.random() > 0.5 ? '700' : '600'} ${size}px monospace`;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  // Border
  ctx.strokeStyle = 'rgba(0,229,255,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
}

function CanvasCaptcha({ data, onRefresh }: { data: CaptchaData; onRefresh: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) drawCaptcha(ref.current, data);
  }, [data]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative rounded-lg overflow-hidden border border-white/10">
        <canvas ref={ref} width={220} height={56} className="block" />
      </div>
      <button
        type="button"
        onClick={onRefresh}
        title="New challenge"
        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────

interface ContactContentProps {
  settings?: SiteSettings;
}

export function ContactContent({ settings = {} }: ContactContentProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError(false);
  }, []);

  const email = settings.contact_email || 'contact@devblog.com';
  const location = settings.contact_location || 'Indonesia';
  const locationDetail = settings.contact_location_detail || 'Available Worldwide';

  const socials = [
    settings.social_github && {
      href: settings.social_github, icon: Github, label: 'GitHub',
    },
    settings.social_twitter && {
      href: settings.social_twitter, icon: Twitter, label: 'Twitter',
    },
    settings.social_linkedin && {
      href: settings.social_linkedin, icon: Linkedin, label: 'LinkedIn',
    },
    settings.social_instagram && {
      href: settings.social_instagram, icon: Instagram, label: 'Instagram',
    },
    // fallback: always show email as social link
    { href: `mailto:${email}`, icon: Mail, label: 'Email' },
  ].filter(Boolean) as { href: string; icon: React.ElementType; label: string }[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate CAPTCHA
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError(true);
      refreshCaptcha();
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSent(true);
      setFormData({ name: '', email: '', message: '' });
      setCaptchaInput('');
      refreshCaptcha();
      setTimeout(() => setSent(false), 6000);
    } catch {
      setError('Failed to send message. Please try again or email directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[var(--primary)]/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-[var(--secondary)]/10 rounded-full blur-[128px]" />

          <div className="relative z-10 container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">

              {/* Left column — heading + contact info */}
              <FadeInUp delay={0.1}>
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                      Let&apos;s <span className="text-[var(--primary)]">Connect</span>
                    </h1>
                    <p className="text-lg text-white/40 max-w-xl">
                      Have a project in mind or just want to chat? I&apos;m always open to
                      discussing new opportunities and ideas.
                    </p>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                      <Mail size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">Email</h3>
                      <a
                        href={`mailto:${email}`}
                        className="text-white/40 hover:text-[var(--primary)] transition-colors"
                      >
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] border border-[var(--secondary)]/20">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">Location</h3>
                      <p className="text-white/40">
                        {location}
                        <br />
                        {locationDetail}
                      </p>
                    </div>
                  </div>

                  {/* Social */}
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-sm text-white/30 mb-3 font-mono">// social links</p>
                    <div className="flex gap-3 flex-wrap">
                      {socials.map(({ href, icon: Icon, label }) => (
                        <a
                          key={label}
                          href={href}
                          target={href.startsWith('mailto') ? undefined : '_blank'}
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all"
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeInUp>

              {/* Right column — form */}
              <FadeInUp delay={0.2}>
                <div className="glass-panel p-8">
                  {sent ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-white/40">Thanks for reaching out. I&apos;ll get back to you soon.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--primary)]/50 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--primary)]/50 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Message</label>
                        <textarea
                          required
                          rows={5}
                          placeholder="Tell me about your project..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--primary)]/50 transition-colors resize-none"
                        />
                      </div>

                      {/* Canvas CAPTCHA */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/60">
                          Verification — solve the equation
                        </label>
                        <CanvasCaptcha data={captcha} onRefresh={refreshCaptcha} />
                        <div className="relative">
                          <input
                            type="number"
                            required
                            placeholder="Your answer"
                            value={captchaInput}
                            onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(false); }}
                            className={`w-full px-4 py-3 rounded-lg bg-black/30 border text-white placeholder:text-white/20 focus:outline-none transition-colors
                              ${captchaError ? 'border-red-500/60 focus:border-red-500/80' : 'border-white/10 focus:border-[var(--primary)]/50'}`}
                          />
                          {captchaError && (
                            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" /> Incorrect — a new challenge has been generated
                            </p>
                          )}
                        </div>
                      </div>

                      {error && (
                        <p className="text-sm text-red-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] text-black font-semibold hover:bg-[var(--primary)]/90 transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </FadeInUp>

            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
