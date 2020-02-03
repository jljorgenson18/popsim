import { ModelState } from 'src/math/types.d.ts';
import { TimeSeries } from 'src/math/main.ts';
import { deepClone } from 'src/math/common.ts';
import { parse } from '@babel/core';

export interface DataPoint {
  t: number;
  p: number;
}

export interface SpeciesData {
  t: number;
  [p: number]: number;
}

export interface DataSet {
  [label: number]: DataPoint[];
}

export interface Histogram {
  t: number;
  h: DataPoint[];
}

function getLargestStateID(state: ModelState): number {
  let largest = 0;
  const keys = Object.keys(state.s);
  keys.forEach(key => {
    const id = parseInt(key, 10);
    if (id > largest) largest = id;
  });
  return largest;
}

function getLargestID(series: TimeSeries): number {
  let largest = 0;
  const keys = Object.keys(series);
  keys.forEach(key => {
    const idx = parseInt(key, 10);
    const largestId = getLargestStateID(series[idx]);
    if (largestId > largest) largest = largestId;
  });
  return largest;
}

export function splitSpecies(series: TimeSeries, ignore?: number[]): SpeciesData[] {
  const keys = Object.keys(series);
  const numSets = getLargestID(series);
  const sets: SpeciesData[] = [];
  if (!ignore) ignore = [];
  keys.forEach(key => {
    const idx = parseInt(key, 10);
    const dat: SpeciesData = { t: series[idx].t };
    //dat.t = series[1].t;
    for (let i = 1; i < numSets; i++) {
      if (!ignore.includes(i)) {
        if (!series[idx].s[i]) {
          dat[i] = 0;
        } else {
          dat[i] = i * series[idx].s[i];
        }
      }
    }
    sets.push(dat);
  });
  return sets;
}

// export function splitSpecies(series: TimeSeries, ignore?: number[]): DataSet {
//   const keys = Object.keys(series);
//   const numSets = getLargestID(series);
//   const sets: DataSet = {};
//   if (!ignore) ignore = [];
//   keys.forEach(key => {
//     const idx = parseInt(key, 10);
//     for (let i = 1; i < numSets; i++) {
//       if (!ignore.includes(i)) {
//         if (!sets[i]) sets[i] = [];
//         if (series[idx].s[i] != null) {
//           sets[i].push({ t: series[idx].t, p: series[idx].s[i] });
//         } else {
//           sets[i].push({ t: series[idx].t, p: 0 });
//         }
//       }
//     }
//   });
//   return sets;
// }

export function expandToHistogram(state: ModelState, ignore?: number[], num?: number): Histogram {
  let numSpec = 0;
  if (!num) {
    numSpec = getLargestStateID(state);
  } else {
    numSpec = num;
  }
  if (!ignore) ignore = [];
  const hist: Histogram = { t: state.t, h: [] };
  for (let i = 1; i < numSpec; i++) {
    if (!ignore.includes(i)) {
      if (state.s[i] != null) {
        hist.h.push({ t: i, p: i * state.s[i] });
      } else {
        hist.h.push({ t: i, p: 0 });
      }
    }
  }
  return hist;
}

// export function expandToHistogram(state: ModelState, ignore?: number[], num?: number): ModelState {
//   let numSpec = 0;
//   if (!num) {
//     numSpec = getLargestStateID(state);
//   } else {
//     numSpec = num;
//   }
//   const hist: ModelState = { t: state.t, s: {} };
//   if (!ignore) ignore = [];
//   for (let i = 1; i < numSpec; i++) {
//     if (!ignore.includes(i)) {
//       if (state.s[i] != null) {
//         hist.s[i] = state.s[i];
//       } else {
//         hist.s[i] = 0;
//       }
//     }
//   }
//   return hist;
// }

export function histSeries(series: TimeSeries, ignore?: number[]): Histogram[] {
  const histSer: Histogram[] = [];
  const keys = Object.keys(series);
  const num = getLargestID(series);
  keys.forEach(key => {
    const idx = parseInt(key, 10);
    histSer.push(expandToHistogram(series[idx], ignore, num));
  });
  return histSer;
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
  let l: number;
  l = polymerMass(state) / polymerNumber(state);
  if (l === null) l = 0;
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
