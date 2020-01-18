import { SamplePayload, SampleData } from 'src/db/sample';
import { ModelState, SpeciesPair, Species, GetProbabilitiesFunc } from './types';
import { buildModel as bdNucleationBuildModel } from './models/bdnucleation';
import { buildModel as beckerDoringBuildModel } from './models/beckerdoring';
import { buildModel as smoluchowskiBuildModel } from './models/smoluchowski';

import { deepClone, stateMoment, checkConserved } from './common';

export interface TimeSeries {
  states: ModelState[];
}

export interface BinnedTimeSeries {
  [bins: number]: ModelState;
  dt?: number;
  t_end?: number;
}

export interface IndividualRuns {
  [run: number]: TimeSeries;
}

export interface Data {
  series?: BinnedTimeSeries;
  variance?: BinnedTimeSeries;
  runs?: IndividualRuns;
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

function fillBin(data: BinnedTimeSeries, inputState: ModelState, bin: number): BinnedTimeSeries {
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

function binData(
  data: BinnedTimeSeries,
  newData: TimeSeries,
  t_end: number,
  bins = 100
): BinnedTimeSeries {
  const dt = t_end / bins;
  let t = dt;
  let idx = 0;

  for (let i = 0; i < bins; i++) {
    fillBin(data, newData.states[idx], i);
    while (newData.states[idx].t < t) {
      idx = idx + 1;
    }
    t = t + dt;
  }
  return data;
}

function averageData(inputData: BinnedTimeSeries, runs: number, moment = 1): BinnedTimeSeries {
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

function getVariance(data: BinnedTimeSeries, runs: number): BinnedTimeSeries {
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
  const t_series: TimeSeries = { states: [initialState] };
  // simulate until end time is reached
  while (state.t < t_end) {
    state = simStep(state, getProbabilities);
    // console.log(JSON.stringify(state, null, '  '));
    t_series.states.push(state);
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
  data.runs = {};
  let binnedSeries: BinnedTimeSeries = {};
  // Run simulation however many times is needed
  for (let i = 0; i < runs; i++) {
    // Generate new time series
    const iState = createInitialState([{ id: 1, n: payload.N }]);
    const tSeries = simRun(iState, t_end, getProbabilities);
    // Store individual runs if desired
    if (payload.ind_runs !== 0) {
      if (i < payload.ind_runs) {
        data.runs[i] = tSeries;
      }
    }
    // console.log(JSON.stringify(tSeries, null, '  '));
    // Bin the new time series
    binnedSeries = binData(binnedSeries, tSeries, t_end);
    // console.log(JSON.stringify(binnedSeries, null, '  '));
  }
  // Average data
  data.series = averageData(binnedSeries, runs);
  data.variance = getVariance(binnedSeries, runs);
  return data;
}
