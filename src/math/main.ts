import { SamplePayload, SampleData } from 'src/db/sample';
import { ModelState, SpeciesPair, Species, GetProbabilitiesFunc } from './types';
import { buildModel as bdNucleationBuildModel } from './models/bdnucleation';
import { buildModel as beckerDoringBuildModel } from './models/beckerdoring';
import { buildModel as smoluchowskiBuildModel } from './models/smoluchowski';

import { deepClone, stateMoment, checkConserved } from './common';

interface TimeSeries {
  states: ModelState[];
}

export interface BinnedTimeSeries {
  [bins: number]: ModelState;
  dt?: number;
  t_end?: number;
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
  let t = 0;
  let bin = 0;
  let store = true;
  let previousState: ModelState;

  const keys = Object.keys(newData.states);
  keys.forEach(key => {
    const id = parseInt(key, 10);
    if (newData.states[id].t > t + dt) {
      // check if new bin is entered
      store = true;
      t = t + dt;
      bin = bin + 1;
    }
    if (store) {
      store = false;
      while (newData.states[id].t > t + dt) {
        // fill bins with last state until we get to the current bin
        fillBin(data, newData.states[id - 1], bin);
        bin = bin + 1;
        t = t + dt;
      }
      if (newData.states[id].t < t + dt) {
        // fill current bin
        fillBin(data, newData.states[id], bin);
        bin = bin + 1;
        t = t + dt;
      }
    }
  });
  return data;
}

function averageData(data: BinnedTimeSeries, runs: number): BinnedTimeSeries {
  const keys = Object.keys(data);
  keys.forEach(key => {
    const bin = parseInt(key, 10);
    const specKeys = Object.keys(data[bin]);
    specKeys.forEach(specKey => {
      const spec = parseInt(specKey, 10);
      data[bin].s[spec] = data[bin].s[spec] / runs;
    });
    checkConserved(data[bin], 100);
  });
  return data;
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

export function simulate(payload: SamplePayload): BinnedTimeSeries {
  console.log('Simulating...', payload);
  const initialState = createInitialState([{ id: 1, n: payload.N }]);
  const getProbabilities = buildModel(payload);
  const t_end = payload.tstop;
  const runs = payload.runs;
  let binnedSeries: BinnedTimeSeries = {};
  // Run simulation however many times is needed
  for (let i = 0; i < runs; i++) {
    // Generate new time series
    const iState = deepClone(initialState);
    const tSeries = simRun(iState, t_end, getProbabilities);
    // console.log(JSON.stringify(tSeries, null, '  '));
    // Bin the new time series
    binnedSeries = binData(binnedSeries, tSeries, t_end);
    // console.log(JSON.stringify(binnedSeries, null, '  '));
  }
  // Average data
  const data = averageData(binnedSeries, runs);
  console.log(data);
  return data;
}
