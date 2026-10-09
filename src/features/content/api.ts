import { apiRequest } from '../../api/client';

export interface ContentVersion {
  schemaVersion: 1;
  revision: number;
  releaseId: string | null;
  updatedAt: string | null;
}

export function getContentVersion() {
  return apiRequest<ContentVersion>('/api/v1/content-version');
}


export interface BootstrapTheme {
  primary: string;
  background: string;
  logoUrl: string | null;
  backgroundImageUrl?: string | null;
  backgroundEnabled?: boolean;
}

export interface BootstrapConfiguration {
  maintenance: boolean;
  theme: BootstrapTheme;
}

export function getBootstrap(releaseId: string | null) {
  const query = releaseId
    ? `?releaseId=${encodeURIComponent(releaseId)}`
    : '';

  return apiRequest<BootstrapConfiguration>(`/api/v1/bootstrap${query}`);
}
