import type { AppLanguage } from '../../i18n/LanguageProvider';
import { DynamicFormField } from './api';

export function dynamicDeadline(
  endsAt: string,
  timezone: string,
  language: AppLanguage = 'es',
) {
  try {
    const date = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }).format(new Date(endsAt));
    return language === 'en' ? `Until ${date}` : `Hasta ${date}`;
  } catch {
    return language === 'en' ? 'Check campaign dates' : 'Consulta la vigencia';
  }
}

export function validateDynamicField(
  field: DynamicFormField,
  value: string,
  language: AppLanguage = 'es',
) {
  const english = language === 'en';
  const normalized = value.trim();

  if (!normalized) {
    return field.required
      ? english
        ? 'This field is required.'
        : 'Este campo es obligatorio.'
      : null;
  }

  if (
    field.type === 'email' &&
    (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
  ) {
    return english ? 'Enter a valid email.' : 'Ingresa un correo válido.';
  }

  if (field.type === 'phone' && !/^\+[1-9]\d{6,14}$/.test(normalized)) {
    return english
      ? 'Use international format, for example +13135550123.'
      : 'Usa formato internacional, por ejemplo +13135550123.';
  }

  if (field.type === 'text' && normalized.length > 200) {
    return english ? 'Maximum 200 characters.' : 'Máximo 200 caracteres.';
  }

  if (field.type === 'textarea' && normalized.length > 4000) {
    return english ? 'Maximum 4000 characters.' : 'Máximo 4000 caracteres.';
  }

  return null;
}

export function createIdempotencyKey() {
  const cryptoApi = (globalThis as {
    crypto?: { randomUUID?: () => string };
  }).crypto;

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  let timestamp = Date.now();
  let highResolution = typeof performance !== 'undefined' ? performance.now() * 1000 : 0;

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    let random = Math.random() * 16;
    if (timestamp > 0) {
      random = (timestamp + random) % 16;
      timestamp = Math.floor(timestamp / 16);
    } else {
      random = (highResolution + random) % 16;
      highResolution = Math.floor(highResolution / 16);
    }
    const value = char === 'x' ? random : (random % 4) + 8;
    return Math.floor(value).toString(16);
  });
}
