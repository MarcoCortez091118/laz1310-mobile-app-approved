const DEFAULT_API_BASE_URL =
  'https://laz1310-fastapi-enaeaghwfhbhgsa9.canadacentral-01.azurewebsites.net';

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  timeoutMs: 10_000,
} as const;
