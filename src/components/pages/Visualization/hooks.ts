import { useState, useMemo, ChangeEvent } from 'react';
import { DataPoint, SpeciesData } from 'src/math/analysis';

type Scale = 'linear' | 'log';

export const useScaleInputField = (name: string) => {
  const [scale, setScale] = useState<Scale>('linear');
  return {
    options: [
      { id: `${name}-linear`, value: 'linear', label: 'Linear' },
      { id: `${name}-log`, value: 'log', label: 'Log' }
    ],
    scale: scale,
    onChange: (evt: ChangeEvent) => {
      setScale((evt.target as any).value);
    }
  };
};

export function useFilteredDataPoints(points: Array<DataPoint | SpeciesData>) {
  return useMemo(() => {
    return points.filter(
      point => !Number.isNaN(point.t) && !Number.isNaN((point as DataPoint).p) && point.t !== 0
    );
  }, [points]);
}

export function useFilteredData(data: { [key: string]: number }[], keys: string[]) {
  return useMemo(() => {
    return data.filter(entry => {
      return keys.every(key => !Number.isNaN(entry[key]) && entry[key] !== 0 && entry);
    });
  }, [data]);
}
