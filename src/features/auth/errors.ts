import type { AppLanguage } from '../../i18n/LanguageProvider';

export function authErrorMessage(error: unknown, language: AppLanguage = 'es') {
  const english = language === 'en';
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return error instanceof Error
      ? error.message
      : english
        ? 'We could not complete authentication.'
        : 'No pudimos completar la autenticación.';
  }

  const code = String(error.code);

  switch (code) {
    case 'auth/email-already-in-use':
      return english
        ? 'An account already exists with this email.'
        : 'Ya existe una cuenta con este correo.';
    case 'auth/invalid-email':
      return english ? 'Enter a valid email.' : 'Ingresa un correo válido.';
    case 'auth/weak-password':
      return english
        ? 'The password does not meet the security policy.'
        : 'La contraseña no cumple la política de seguridad.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return english ? 'Incorrect email or password.' : 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return english
        ? 'Too many attempts. Wait a moment and try again.'
        : 'Demasiados intentos. Espera un momento e inténtalo nuevamente.';
    case 'auth/network-request-failed':
      return english
        ? 'We could not reach Firebase. Check your connection.'
        : 'No pudimos comunicarnos con Firebase. Revisa tu conexión.';
    case 'auth/user-disabled':
      return english ? 'This account is disabled.' : 'Esta cuenta está deshabilitada.';
    default:
      return english
        ? 'We could not complete authentication.'
        : 'No pudimos completar la autenticación.';
  }
}
