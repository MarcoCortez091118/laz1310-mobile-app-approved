import { Share } from 'react-native';

import type { AppLanguage } from '../i18n/LanguageProvider';

// Do not share the obsolete third-party Android listing. Once NeuroMarket's
// LA Z 1310 store page is published, replace this link with its verified URL.
export const RADIO_WEBSITE_URL = 'https://www.laz1310.com/';

export function radioShareMessage(language: AppLanguage): string {
  return language === 'en'
    ? `I'm listening to LA Z Detroit. Listen with me: ${RADIO_WEBSITE_URL}`
    : `Estoy escuchando LA Z Detroit. Escúchanos aquí: ${RADIO_WEBSITE_URL}`;
}

export async function shareLiveRadio(language: AppLanguage): Promise<void> {
  await Share.share({ message: radioShareMessage(language) });
}
