import { apiRequest } from '../../api/client';

export interface PublishedStation {
  id: string;
  slug: string;
  name: string;
  callsign: string | null;
  frequencyAm: string | null;
  frequencyFm: string | null;
  timezone: string;
  locale: string;
}

export interface PublishedShow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hostName: string | null;
  imageUrl: string | null;
}

export interface PublishedScheduleEntry {
  id: string;
  weekday: number;
  startsAt: string;
  endsAt: string;
  show: PublishedShow;
}

export interface PublishedProgram extends PublishedShow {
  stationId: string;
  stationName: string;
  timezone: string;
  schedule: PublishedScheduleEntry[];
}

function releaseQuery(releaseId: string | null): string {
  return releaseId ? `?releaseId=${encodeURIComponent(releaseId)}` : '';
}

async function stationPrograms(
  station: PublishedStation,
  releaseId: string | null,
): Promise<PublishedProgram[]> {
  const stationId = encodeURIComponent(station.id);
  const query = releaseQuery(releaseId);
  const [shows, schedule] = await Promise.all([
    apiRequest<PublishedShow[]>(`/api/v1/stations/${stationId}/shows${query}`),
    apiRequest<PublishedScheduleEntry[]>(`/api/v1/stations/${stationId}/schedule${query}`),
  ]);

  return shows.map((show) => ({
    ...show,
    stationId: station.id,
    stationName: station.name,
    timezone: station.timezone,
    schedule: schedule
      .filter((entry) => entry.show.id === show.id)
      .slice()
      .sort((left, right) =>
        left.weekday === right.weekday
          ? left.startsAt.localeCompare(right.startsAt)
          : left.weekday - right.weekday,
      ),
  }));
}

export async function getPublishedPrograms(
  releaseId: string | null,
): Promise<PublishedProgram[]> {
  const query = releaseQuery(releaseId);
  const stations = await apiRequest<PublishedStation[]>(`/api/v1/stations${query}`);
  const programs = await Promise.all(
    stations.map((station) => stationPrograms(station, releaseId)),
  );

  return programs
    .flat()
    .sort((left, right) => left.name.localeCompare(right.name, 'es'));
}
