import { Alert, Linking } from 'react-native';

import {
  ADVERTISING_EMAIL,
  advertisingMailto,
  type ContactChannel,
} from '../../config/contact';
import type { AppLanguage } from '../../i18n/LanguageProvider';

/** Handles only the allowlisted destinations in src/config/contact.ts. */
export async function openContactChannel(
  channel: ContactChannel,
  language: AppLanguage,
): Promise<void> {
  try {
    await Linking.openURL(channel.url);
  } catch {
    const label = language === 'en' ? channel.labelEn : channel.labelEs;
    Alert.alert(
      language === 'en' ? 'Could not open the link' : 'No se pudo abrir el enlace',
      language === 'en'
        ? `Please try again later or open ${label} manually: ${channel.url}`
        : `Inténtalo más tarde o abre ${label} manualmente: ${channel.url}`,
    );
  }
}

export async function openAdvertisingEmail(language: AppLanguage): Promise<void> {
  try {
    await Linking.openURL(advertisingMailto(language));
  } catch {
    Alert.alert(
      language === 'en' ? 'No email app available' : 'No hay una app de correo disponible',
      language === 'en'
        ? `Contact our advertising team at ${ADVERTISING_EMAIL}.`
        : `Contacta a nuestro equipo comercial en ${ADVERTISING_EMAIL}.`,
    );
  }
}
