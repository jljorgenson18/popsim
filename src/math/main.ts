import { SamplePayload } from 'src/db/sample';
import { ModelState, SpeciesPair, Species, GetProbabilitiesFunc } from './types';
import { buildModel as bdNucleationBuildModel } from './models/bdnucleation';
import { buildModel as beckerDoringBuildModel } from './models/beckerdoring';
import { buildModel as smoluchowskiBuildModel } from './models/smoluchowski';
import { buildModel as smoluchowskiCrowdersBuildModel } from './models/smoluchowskicrowders';
import { buildModel as bdCrowdersBuildModel } from './models/bdcrowders';
import {
  DataPoint,
  SpeciesData,
  numberSeries,
  massSeries,
  lengthSeries,
  splitSpecies,
  histSeries,
  DataSet,
  Histogram
} from './analysis';

import { deepClone, stateMoment, checkConserved } from './common';
import SampleForm from 'src/components/SampleForm';

export interface TimeSeries {
  [state: number]: ModelState;
}

export interface Data {
  series?: TimeSeries;
  variance?: TimeSeries;
  runs?: TimeSeries[];
  mass?: DataPoint[];
  length?: DataPoint[];
  number?: DataPoint[];
  species?: SpeciesData[];
  histograms?: Histogram[];
  [label: string]: any;
}

function fillSpecies(s: SpeciesPair[]): Species {
  const spec: Species = {};
  s.forEach(pair => {
    spec[pair.id] = pair.n;
  });
  return spec;
}

function createInitialState(N: SpeciesPair[]): ModelState {
  const state: ModelState = { t: 0, s: fillSpecies(N) };
  return state;
}

function advanceTime(initialState: ModelState, dt: number): ModelState {
  return {
    ...initialState,
    t: initialState.t + dt
  };
}

function fillBin(data: TimeSeries, inputState: ModelState, bin: number): TimeSeries {
  const state = deepClone(inputState);
  if (!data[bin]) {
    // check if that bin exists
    data[bin] = state;
  } else {
    const keys = Object.keys(state.s);
    keys.forEach(key => {
      const id = parseInt(key, 10);
      if (!data[bin].s[id]) {
        // if bin does not have that species
        data[bin].s[id] = state.s[id];
      } else {
        // if bin does have that species
        data[bin].s[id] += state.s[id];
      }
    });
  }
  return data;
}

function linearBin(data: TimeSeries, newData: TimeSeries, payload: SamplePayload): TimeSeries {
  const bins = payload.bins;
  const t_end = payload.tstop;
  const dt = t_end / bins;
  let t = 0;
  let idx = 0;

  for (let i = 0; i < bins; i++) {
    fillBin(data, newData[idx], i);
    data[i].t = t;
    // go to next state
    idx = idx + 1;
    // check if next state is still in the same bin
    while (newData[idx].t < t + dt) {
      // step through until current bin is exited
      idx = idx + 1;
    }
    // check if next state is more than one bin later
    if (newData[idx].t > t + 2 * dt) {
      // if step is bigger than a bin, use the last state
      idx = idx - 1;
    }
    t = t + dt;
  }
  return data;
}

function logBin(data: TimeSeries, newData: TimeSeries, payload: SamplePayload): TimeSeries {
  const bins = payload.bins;
  const t_end = payload.tstop;
  let dt = 0;
  if (!data[1]) {
    dt = newData[1].t;
  } else {
    dt = data[1].t;
  }
  const x = Math.pow(t_end / dt, 1 / bins);
  console.log(x);
  console.log(dt);
  let t = 0;
  let idx = 0;
  fillBin(data, newData[idx], 0);
  data[0].t = 0;
  idx = 1;
  t = dt;
  for (let i = 1; i < bins; i++) {
    while (newData[idx].t < dt * x) {
      idx = idx + 1;
    }
    if (newData[idx].t > dt * x * x) {
      idx = idx - 1;
    }
    fillBin(data, newData[idx], i);
    t = t * x;
    data[i].t = t;
  }
  return data;
}

function binData(data: TimeSeries, newData: TimeSeries, payload: SamplePayload): TimeSeries {
  // const bins = payload.bins;
  // const t_end = payload.tstop;
  // const dt = t_end / bins;
  // let t = 0;
  // let idx = 0;

  // for (let i = 0; i < bins; i++) {
  //   fillBin(data, newData[idx], i);
  //   data[i].t = t;
  //   // go to next state
  //   idx = idx + 1;
  //   // check if next state is still in the same bin
  //   while (newData[idx].t < t + dt) {
  //     // step through until current bin is exited
  //     idx = idx + 1;
  //   }
  //   // check if next state is more than one bin later
  //   if (newData[idx].t > t + 2 * dt) {
  //     // if step is bigger than a bin, use the last state
  //     idx = idx - 1;
  //   }
  //   t = t + dt;
  // }
  if (payload.bin_scale === 'linear') return linearBin(data, newData, payload);
  if (payload.bin_scale === 'log') return logBin(data, newData, payload);
}

function averageData(inputData: TimeSeries, runs: number, moment = 1): TimeSeries {
  const data = deepClone(inputData);
  const keys = Object.keys(data);
  keys.forEach(key => {
    const bin = parseInt(key, 10);
    const specKeys = Object.keys(data[bin].s);
    specKeys.forEach(specKey => {
      const spec = parseInt(specKey, 10);
      //console.log(data[bin].s[spec]);
      data[bin].s[spec] = Math.pow(data[bin].s[spec], moment) / runs;
      //console.log(data[bin].s[spec]);
    });
    //checkConserved(data[bin], 100);
  });
  return data;
}

function getVariance(data: TimeSeries, runs: number): TimeSeries {
  const avgData = averageData(data, runs);
  const avgDataSq = averageData(data, runs, 2);
  const keys = Object.keys(avgData);
  keys.forEach(key => {
    const bin = parseInt(key, 10);
    const subKeys = Object.keys(avgData[bin].s);
    subKeys.forEach(subKey => {
      const spec = parseInt(subKey, 10);
      avgData[bin].s[spec] = avgDataSq[bin].s[spec] - Math.pow(avgData[bin].s[spec], 2);
    });
  });
  return avgData;
}

function simStep(initialState: ModelState, getProbabilities: GetProbabilitiesFunc): ModelState {
  const u1 = Math.random();
  const u2 = Math.random();
  const iState = deepClone(initialState);
  const possibleStates = getProbabilities(iState);
  const summedProbabilities: number[] = [0];
  let PP = 0; // Probability amplitude
  possibleStates.forEach((state, index) => {
    summedProbabilities[index] = PP + state.P;
    PP += state.P;
  });
  const R = u1 * PP; // Determines which state is selected
  const dt = (1 / PP) * Math.log(1 / u2); // Generate the time step
  //console.log(initialState);
  const newState = possibleStates.find((state, index) => {
    return R < summedProbabilities[index];
  });

  if (!newState) {
    // if it makes it here its broken dawg
    throw new Error('Shits broken homie. Somehow a fraction of PP isnt less than PP');
  }
  return advanceTime(newState.s, dt);
}

function simRun(
  initialState: ModelState,
  t_end: number,
  getProbabilities: GetProbabilitiesFunc
): TimeSeries {
  let state = deepClone(initialState);
  console.log('here');
  const t_series: TimeSeries = [initialState];
  // simulate until end time is reached
  let idx = 0;
  while (state.t < t_end) {
    state = simStep(state, getProbabilities);
    idx = idx + 1;
    // console.log(JSON.stringify(state, null, '  '));
    t_series[idx] = state;
    // gotta have some kind of break here or maybe not idk
  }
  return t_series;
}

export const buildModel = (payload: SamplePayload): GetProbabilitiesFunc => {
  const { model } = payload;
  let getProbabilities: GetProbabilitiesFunc;
  switch (payload.model) {
    case 'BD-nucleation':
      getProbabilities = bdNucleationBuildModel(payload);
      break;
    case 'Becker-Doring':
      getProbabilities = beckerDoringBuildModel(payload);
      break;
    case 'Smoluchowski':
      getProbabilities = smoluchowskiBuildModel(payload);
      break;
    case 'Smoluchowski-crowders':
      getProbabilities = smoluchowskiCrowdersBuildModel(payload);
      break;
    case 'BD-crowders':
      getProbabilities = bdCrowdersBuildModel(payload);
      break;
    default:
      throw new Error('Invalid model type!');
  }
  return getProbabilities;
};

export function simulate(payload: SamplePayload): Data {
  console.log('Simulating...', payload);
  // const initialState = createInitialState([{ id: 1, n: payload.N }]);
  const getProbabilities = buildModel(payload);
  const t_end = payload.tstop;
  const runs = payload.runs;
  const data: Data = {};
  if (!payload.bins) payload.bins = 100;
  if (!payload.bin_scale) payload.bin_scale = 'linear';
  if (payload.ind_runs !== 0) data.runs = [];
  let binnedSeries: TimeSeries;
  binnedSeries = {};
  // Run simulation however many times is needed
  for (let i = 0; i < runs; i++) {
    // Generate new time series
    const iState = createInitialState([{ id: 1, n: payload.N }]);
    const tSeries = simRun(iState, t_end, getProbabilities);
    // Store individual runs if desired
    if (i < payload.ind_runs) {
      data.runs[i] = tSeries;
    }
    // console.log(JSON.stringify(tSeries, null, '  '));
    // Bin the new time series
    binnedSeries = binData(binnedSeries, tSeries, payload);
    // console.log(JSON.stringify(binnedSeries, null, '  '));
  }
  // Average data
  data.series = averageData(binnedSeries, runs);
  data.variance = getVariance(binnedSeries, runs);
  data.mass = massSeries(data.series);
  data.number = numberSeries(data.series);
  data.length = lengthSeries(data.series);
  data.species = splitSpecies(data.series);
  data.histograms = histSeries(data.series);
  // Below here can be done better but jank is fine for now
  data['V'] = payload.V;
  data['N'] = payload.N;
  data['end_time'] = payload.tstop;
  data['nc'] = payload.nc;
  return data;
}
