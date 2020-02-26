import { useState, useMemo, ChangeEvent } from 'react';
import { DataPoint, SpeciesData } from 'src/math/analysis';
import { Moments } from 'src/math/types.d';

type Scale = 'linear' | 'log';

export const useScaleInputField = () => {
  const [scale, setScale] = useState<Scale>('linear');
  return {
    options: ['linear', 'log'],
    scale: scale,
    onChange: (evt: ChangeEvent) => setScale((evt.target as any).value)
  };
};

export function useFilteredDataPoints(points: Array<DataPoint | SpeciesData>) {
  return useMemo(() => {
    return points.filter(
      point => !Number.isNaN(point.t) && !Number.isNaN((point as DataPoint).p) && point.t !== 0
    );
  }, [points]);
}

export function useFilteredMoments(points: Array<Moments>) {
  return useMemo(() => {
    return points.filter(point => !Number.isNaN(point.t) && point.t !== 0);
  }, [points]);
}
