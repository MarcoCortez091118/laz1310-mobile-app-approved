import { useCallback, useEffect, useState } from 'react';

import { useContentVersion } from '../content/ContentVersionProvider';
import { getPublishedPrograms, type PublishedProgram } from './api';

interface ProgramsState {
  programs: PublishedProgram[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePrograms(): ProgramsState {
  const { releaseId } = useContentVersion();
  const [programs, setPrograms] = useState<PublishedProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getPublishedPrograms(releaseId);
      setPrograms(next);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos cargar los programas.',
      );
    } finally {
      setLoading(false);
    }
  }, [releaseId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { programs, loading, error, refresh };
}
