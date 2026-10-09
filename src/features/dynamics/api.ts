import { apiRequestWithMeta } from '../../api/client';

export type DynamicFieldType = 'text' | 'email' | 'phone' | 'textarea';
export type DynamicParticipationType = 'form' | 'external_url';

export interface DynamicFormField {
  key: string;
  type: DynamicFieldType;
  label: string;
  required: boolean;
}

export interface DynamicParticipationDefinition {
  type: DynamicParticipationType;
  url: string | null;
  requiresAuth: boolean;
  fields: DynamicFormField[];
}

export interface DynamicCampaign {
  id: string;
  slug: string;
  title: string;
  artworkLabel: string;
  context: string;
  description: string;
  instructions: string;
  imageUrl: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  featured: boolean;
  status: 'active' | 'closed';
  participation: DynamicParticipationDefinition;
  termsUrl: string;
  privacyUrl: string;
  consentVersion: string;
}

export interface DynamicCollection {
  items: DynamicCampaign[];
  releaseId: string | null;
}

export interface ParticipationReceipt {
  id: string;
  dynamicId: string;
  status: 'accepted';
  submittedAt: string;
}

export interface ParticipationStatusResponse {
  participated: boolean;
  receipt: ParticipationReceipt | null;
}

export interface UserParticipationItem extends ParticipationReceipt {
  dynamicTitle: string | null;
}

export interface UserParticipationPage {
  items: UserParticipationItem[];
  nextCursor: string | null;
}

export interface ParticipationSecurity {
  idToken?: string;
  appCheckToken?: string;
}

export interface SubmitParticipationInput {
  dynamicId: string;
  releaseId: string;
  values: Record<string, string>;
  consentVersion: string;
  idempotencyKey: string;
  security?: ParticipationSecurity;
}

function releaseHeader(headers: Headers) {
  return headers.get('X-Content-Release');
}

export async function getDynamics(releaseId?: string): Promise<DynamicCollection> {
  const query = releaseId ? '?releaseId=' + encodeURIComponent(releaseId) : '';
  const response = await apiRequestWithMeta<DynamicCampaign[]>(
    '/api/v1/dynamics' + query,
  );

  return {
    items: response.data,
    releaseId: releaseHeader(response.headers),
  };
}

export async function getDynamic(
  dynamicId: string,
  releaseId?: string,
): Promise<{ item: DynamicCampaign; releaseId: string | null }> {
  const query = releaseId ? '?releaseId=' + encodeURIComponent(releaseId) : '';
  const response = await apiRequestWithMeta<DynamicCampaign>(
    '/api/v1/dynamics/' + encodeURIComponent(dynamicId) + query,
  );

  return {
    item: response.data,
    releaseId: releaseHeader(response.headers),
  };
}

export async function submitParticipation({
  dynamicId,
  releaseId,
  values,
  consentVersion,
  idempotencyKey,
  security,
}: SubmitParticipationInput) {
  const headers: Record<string, string> = {
    'Idempotency-Key': idempotencyKey,
  };

  if (security?.idToken) {
    headers.Authorization = 'Bearer ' + security.idToken;
  }

  if (security?.appCheckToken) {
    headers['X-Firebase-AppCheck'] = security.appCheckToken;
  }

  return (
    await apiRequestWithMeta<ParticipationReceipt>(
      '/api/v1/dynamics/' +
        encodeURIComponent(dynamicId) +
        '/participations',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          releaseId,
          values,
          consent: {
            termsAccepted: true,
            privacyAccepted: true,
            version: consentVersion,
          },
        }),
      },
    )
  ).data;
}


function participationSecurityHeaders(
  security: ParticipationSecurity,
): Record<string, string> {
  if (!security.idToken) {
    throw new Error('Firebase ID token is required for account participation');
  }

  return {
    Authorization: 'Bearer ' + security.idToken,
    ...(security.appCheckToken
      ? { 'X-Firebase-AppCheck': security.appCheckToken }
      : {}),
  };
}

export async function getParticipationStatus(
  dynamicId: string,
  security: ParticipationSecurity,
) {
  return (
    await apiRequestWithMeta<ParticipationStatusResponse>(
      '/api/v1/dynamics/' +
        encodeURIComponent(dynamicId) +
        '/participation-status',
      {
        headers: participationSecurityHeaders(security),
      },
    )
  ).data;
}

export async function getMyParticipations(
  security: ParticipationSecurity,
  limit = 50,
  after?: string,
) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set('after', after);

  return (
    await apiRequestWithMeta<UserParticipationPage>(
      '/api/v1/me/dynamics/participations?' + params.toString(),
      {
        headers: participationSecurityHeaders(security),
      },
    )
  ).data;
}
