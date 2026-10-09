import { Alert, Linking } from 'react-native';

export const SUPPORT_EMAIL = 'Support@neuromarket.io';

export async function openSupportEmail(english: boolean): Promise<void> {
  try {
    const subject = encodeURIComponent(english ? 'LA Z 1310 Support' : 'Soporte LA Z 1310');
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`);
  } catch {
    Alert.alert(
      english ? 'Email app unavailable' : 'No hay una app de correo disponible',
      english
        ? `Please contact us at ${SUPPORT_EMAIL}.`
        : `Escríbenos a ${SUPPORT_EMAIL}.`,
    );
  }
}
