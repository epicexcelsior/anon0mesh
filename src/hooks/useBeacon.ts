import { useState, useEffect } from 'react';
import { useAdapters } from '@/src/providers/AdapterProvider';

export function useBeacon() {
  const [mode, setModeState] = useState<string>('passive');
  const [advertising, setAdvertising] = useState(false);
  const adapters = useAdapters();

  useEffect(() => {
    adapters.beacon.getMode().then(setModeState).catch(() => {});
    adapters.beacon.isAdvertising().then(setAdvertising).catch(() => {});
  }, [adapters]);

  return { mode, advertising };
}
