import { useState, useMemo, ChangeEvent, useEffect } from 'react';
import flatten from 'lodash/flatten';

import { DataPoint, SpeciesData } from 'src/math/analysis';
import { Data } from 'src/math/main';
import { TimeSeriesData } from './types';

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
      return keys.every(key => !Number.isNaN(entry[key]) && entry[key] !== 0);
    });
  }, [data]);
}

export function useTimeSeriesDataWithIndividualRuns(data: Data, mainDataKey: 'M' | 'L' | 'P') {
  const [runOptions, setRunOptions] = useState<{ [runIdx: number]: boolean }>({});
  const combinedMoments = useMemo<TimeSeriesData[]>(() => {
    const mappedRunMoments = flatten<TimeSeriesData>(
      data.runMoments.map((runs, idx) => {
        // Don't include the data if it isn't part of the run options.
        // Otherwise, you get gaps
        if (!runOptions[idx]) return [];
        return runs.map(run => {
          return Object.keys(run).reduce((mapped: any, key) => {
            if (key === 't') {
              mapped[key] = run.t;
            } else {
              mapped[`${idx}.${key}`] = (run as any)[key] as number;
            }
            return mapped;
          }, {} as TimeSeriesData);
        });
      })
    );
    return [...(data.moments as any), ...mappedRunMoments];
  }, [runOptions, data.moments, data.runMoments]);
  const runMomentIndices = useMemo(() => {
    return data.runMoments.map((m, idx) => idx);
  }, [data.runMoments]);
  useEffect(() => {
    const newRunOptions = runMomentIndices.reduce<{ [runIdx: number]: boolean }>(
      (mapped, runIdx) => {
        mapped[runIdx] = false;
        return mapped;
      },
      {}
    );
    setRunOptions(newRunOptions);
  }, [runMomentIndices]);
  const runsSelected = runMomentIndices.some(runIdx => runOptions[runIdx]);
  const dataKeys = useMemo(() => {
    return [
      mainDataKey,
      ...runMomentIndices.filter(idx => runOptions[idx]).map(idx => `${idx}.${mainDataKey}`)
    ];
  }, [runOptions]);
  return {
    combinedMoments,
    dataKeys,
    runOptions,
    runMomentIndices,
    runsSelected,
    setRunOptions
  };
}
