import type { Metadata } from 'next';
import { getSiteSettings, type SiteSettings } from '@/lib/api';
import { ContactContent } from './contact-content';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch — let\'s discuss your next project or collaboration.',
};

export default async function ContactPage() {
  let settings: SiteSettings = {};
  try {
    settings = await getSiteSettings();
  } catch {}

  return <ContactContent settings={settings} />;
}
