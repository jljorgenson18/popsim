import { ModelState } from 'src/math/types.d.ts';
import { TimeSeries, BinnedTimeSeries } from 'src/math/main.ts';
import { deepClone } from 'src/math/common.ts';
import { parse } from '@babel/core';

export interface DataPoint {
  t: number;
  p: number;
}

function polymerMass(state: ModelState): number {
  const keys = Object.keys(state.s);
  let mass = 0;
  keys.forEach(key => {
    const id = parseInt(key, 10);
    if (id > 1) {
      mass = mass + id * state.s[id];
    }
  });
  return mass;
}

function polymerNumber(state: ModelState): number {
  let num = 0;
  const keys = Object.keys(state.s);
  keys.forEach(key => {
    const idx = parseInt(key, 10);
    if (idx > 1) {
      num = num + state.s[idx];
    }
  });
  return num;
}

function avgLength(state: ModelState): number {
  return polymerMass(state) / polymerNumber(state);
}

export function massSeries(inputData: TimeSeries): DataPoint[] {
  const data: DataPoint[] = [];
  const keys = Object.keys(inputData);
  keys.forEach(key => {
    const idx = parseInt(key, 10);
    data[idx] = { t: inputData[idx].t, p: polymerMass(inputData[idx]) };
  });
  return data;
}

// export function binnedMassSeries(inputData: BinnedTimeSeries): DataPoint[] {
//   const data: DataPoint[] = [];
//   const keys = Object.keys(inputData);
//   keys.forEach(key => {
//     const bin = parseInt(key, 10);
//     data[bin] = { t: inputData[bin].t, p: polymerMass(inputData[bin]) };
//   });
//   return data;
// }

export function numberSeries(inputData: TimeSeries): DataPoint[] {
  const data: DataPoint[] = [];
  const keys = Object.keys(inputData);
  keys.forEach(key => {
    const idx = parseInt(key, 10);
    data[idx] = { t: inputData[idx].t, p: polymerNumber(inputData[idx]) };
  });
  return data;
}

// export function binnedNumberSeries(inputData: BinnedTimeSeries): DataPoint[] {
//   const data: DataPoint[] = [];
//   const keys = Object.keys(inputData);
//   keys.forEach(key => {
//     const bin = parseInt(key, 10);
//     data[bin] = { t: inputData[bin].t, p: polymerNumber(inputData[bin]) };
//   });
//   return data;
// }

export function lengthSeries(inputData: TimeSeries): DataPoint[] {
  const data: DataPoint[] = [];
  const keys = Object.keys(inputData);
  keys.forEach(key => {
    const idx = parseInt(key, 10);
    data[idx] = { t: inputData[idx].t, p: avgLength(inputData[idx]) };
  });
  return data;
}

// export function binnedLengthSeries(inputData: BinnedTimeSeries): DataPoint[] {
//   const data: DataPoint[] = [];
//   const keys = Object.keys(inputData);
//   keys.forEach(key => {
//     const bin = parseInt(key, 10);
//     data[bin] = { t: inputData[bin].t, p: avgLength(inputData[bin]) };
//   });
//   return data;
// }
