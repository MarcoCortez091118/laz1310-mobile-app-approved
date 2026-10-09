import type { AppLanguage } from '../i18n/LanguageProvider';

export const ADVERTISING_EMAIL = 'sales@laz1310.com';

/** Explicitly approved public LA Z 1310 destinations; never loaded from user input. */
export const CONTACT_CHANNELS = [
  {
    id: 'website',
    icon: 'globe-outline',
    labelEs: 'Sitio web',
    labelEn: 'Website',
    detail: 'laz1310.com',
    url: 'https://laz1310.com',
  },
  {
    id: 'facebook',
    icon: 'logo-facebook',
    labelEs: 'Facebook',
    labelEn: 'Facebook',
    detail: 'facebook.com/laz1310',
    url: 'https://www.facebook.com/laz1310',
  },
  {
    id: 'instagram',
    icon: 'logo-instagram',
    labelEs: 'Instagram',
    labelEn: 'Instagram',
    detail: '@laz1310am',
    url: 'https://www.instagram.com/laz1310am/',
  },
  {
    id: 'whatsapp',
    icon: 'logo-whatsapp',
    labelEs: 'WhatsApp',
    labelEn: 'WhatsApp',
    detail: '+1 313 291 1310',
    url: 'https://wa.me/13132911310',
  },
] as const;

export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export function advertisingMailto(language: AppLanguage): string {
  const subject = language === 'en'
    ? 'Advertising with LA Z 1310'
    : 'Quiero promocionarme en LA Z 1310';

  return `mailto:${ADVERTISING_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
