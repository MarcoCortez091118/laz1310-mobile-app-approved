export type RadioPlaybackState =
  | 'idle'
  | 'connecting'
  | 'playing'
  | 'paused'
  | 'reconnecting'
  | 'error';

export interface RadioContextValue {
  state: RadioPlaybackState;
  error: string | null;
  isPlaying: boolean;
  hasStarted: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  retry: () => void;
}
