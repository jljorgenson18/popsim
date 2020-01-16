import { SamplePayload, SampleData } from 'src/db/sample';
import { ModelState, SpeciesPair, Species, GetProbabilitiesFunc } from './types';
import { buildModel as bdNucleationBuildModel } from './models/bdnucleation';
import { buildModel as beckerDoringBuildModel } from './models/beckerdoring';
import { buildModel as smoluchowskiBuildModel } from './models/smoluchowski';

import { deepClone } from './common';

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

function fillBin(data: BinnedTimeSeries, prevState: ModelState, bin: number): BinnedTimeSeries {
  if (!data[bin]) {
    data[bin] = prevState;
  } else {
    for (const spec in prevState.s) {
      if (data[bin].s[+spec] != null) {
        data[bin].s[+spec] += prevState.s[+spec];
      } else {
        data[bin].s[+spec] = prevState.s[+spec];
      }
    }
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
  let bin = 0;
  let previousState: ModelState;
  for (const state of newData.states) {
    while (state.t > t) {
      // fill bins with previous state
      t = t + dt;
      bin = bin + 1;
      data = fillBin(data, previousState, bin);
    }
    previousState = state;
    // console.log(bin);
    if (!data[bin]) {
      // create bin
      data[bin] = state;
    } else {
      for (const spec in state.s) {
        // combine values
        if (data[bin].s[+spec] != null) {
          data[bin].s[+spec] += state.s[+spec];
        } else {
          data[bin].s[+spec] = state.s[+spec];
        }
      }
    }
  }
  return data;
}

function averageData(data: BinnedTimeSeries, runs: number): BinnedTimeSeries {
  for (const bin in data) {
    for (const sumState in data[bin].s) {
      data[bin].s[+sumState] = data[bin].s[+sumState] / runs;
    }
  }
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
    console.log(JSON.stringify(tSeries, null, '  '));
    // Bin the new time series
    binnedSeries = binData(binnedSeries, tSeries, t_end);
    // console.log(JSON.stringify(binnedSeries, null, '  '));
  }
  // Average data
  const data = averageData(binnedSeries, runs);
  //console.log(data);
  return data;
}
