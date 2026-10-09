import { apiRequest } from './client';

export type StationRecord = Record<string, unknown>;
export type NowPlayingRecord = Record<string, unknown>;

export function listStations(): Promise<StationRecord[]> {
  return apiRequest<StationRecord[]>('/api/v1/stations');
}

export function getNowPlaying(
  stationId: string,
): Promise<NowPlayingRecord> {
  return apiRequest<NowPlayingRecord>(
    '/api/v1/stations/' + encodeURIComponent(stationId) + '/now-playing',
  );
}
