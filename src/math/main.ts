import { SamplePayload } from 'src/db/sample';
import {
  ModelState,
  SpeciesPair,
  Species,
  GetProbabilitiesFunc,
  InitialStateFunc,
  Moments,
  ReactionCount,
  ReactionSeries,
  Solution,
  SolutionStep,
  Step,
  ReactionElement
} from './types';
import { buildModel as bdNucleationBuildModel } from './models/bdnucleation';
import { initialConditions as bdnInitialConditions } from './models/bdnucleation';
import { buildModel as beckerDoringBuildModel } from './models/beckerdoring';
import { initialConditions as bdInitialConditions } from './models/beckerdoring';
import { buildModel as smoluchowskiBuildModel } from './models/smoluchowski';
import { initialConditions as smolInitialConditions } from './models/smoluchowski';
import { buildModel as smoluchowskiCrowdersBuildModel } from './models/smoluchowskicrowders';
import { initialConditions as smolCrowdersInitialConditions } from './models/smoluchowskicrowders';
import { buildModel as smoluchowskiSecondaryBuildModel } from './models/smolsecondarynucleation';
import { initialConditions as smolSecondaryInitialConditions } from './models/smolsecondarynucleation';
import { buildModel as bdCrowdersBuildModel } from './models/bdcrowders';
import { initialConditions as bdCrowdersInitialConditions } from './models/bdcrowders';
import {
  DataPoint,
  SpeciesData,
  numberSeries,
  massSeries,
  lengthSeries,
  splitSpecies,
  histSeries,
  DataSet,
  Histogram,
  addToMoments,
  averageMoments,
  calculateMomentDevs
} from './analysis';

import { deepClone, removeSpecies, reduceIndividualRun, reduceIndividualMoments } from './common';

export interface TimeSeries {
  [state: number]: ModelState;
}

export interface Data {
  series?: TimeSeries;
  variance?: SpeciesData[];
  runs?: SpeciesData[][];
  runMoments?: Moments[][];
  species?: SpeciesData[];
  histograms?: Histogram[];
  moments?: Moments[];
  reactions?: ReactionCount[];
  [label: string]: any;
}

// function fillSpecies(s: SpeciesPair[]): Species {
//   const spec: Species = {};
//   s.forEach(pair => {
//     spec[pair.id] = pair.n;
//   });
//   return spec;
// }

// function createInitialState(N: SpeciesPair[]): ModelState {
//   const state: ModelState = { t: 0, s: fillSpecies(N) };
//   return state;
// }

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

function addReactions(reactions: ReactionSeries, inputReactions: ReactionCount, bin: number) {
  ///const inputReactions = deepClone(inReactions);
  if (!reactions[bin]) {
    reactions[bin] = inputReactions;
  } else {
    const keys = Object.keys(inputReactions);
    keys.forEach(key => {
      if (key !== 't' && key !== 'dt') {
        reactions[bin][key] += inputReactions[key];
      }
    });
  }
  return reactions;
}

function normalizeReactions(inReactions: ReactionSeries, runs: number): ReactionSeries {
  const reactions = deepClone(inReactions);
  const keys = Object.keys(reactions);
  keys.forEach(key => {
    const idx = parseInt(key, 10);
    const dt = reactions[idx].dt;
    const rxns = Object.keys(reactions[idx]);
    rxns.forEach(rxn => {
      //reactions[idx].dt = dt;
      if (rxn !== 'dt' && rxn !== 't') {
        reactions[idx][rxn] = reactions[idx][rxn] / (dt * runs);
      }
    });
  });
  return reactions;
}

function datifyReactions(reactions: ReactionSeries): ReactionCount[] {
  const data: ReactionCount[] = [];
  const keys = Object.keys(reactions);
  keys.forEach(key => {
    const idx = parseInt(key, 10);
    const rcount: ReactionCount = {};
    const rxns = Object.keys(reactions[idx]);
    rxns.forEach(rxn => {
      if (rxn !== 't' && rxn !== 'dt') {
        rcount[rxn] = reactions[idx][rxn];
      }
    });
    data[idx] = rcount;
    data[idx].t = reactions[idx].t;
    data[idx].dt = reactions[idx].dt;
  });
  return data;
}

function returnZerosObject(keys: string[]): { [keys: string]: number } {
  let obj = {};
  keys.forEach(key => {
    obj = { ...obj, key: 0 };
  });
  return obj;
}

function linearBin(inData: Solution, nData: Solution, payload: SamplePayload): Solution {
  const data = inData.data;
  const newData = nData.data;
  const reactions = inData.reactions;
  const newReactions = nData.reactions;
  const bins = payload.bins;
  const t_end = payload.tstop;
  const dt = t_end / bins;
  let t = 0;
  let idx = 0;

  const keys = Object.keys(newReactions[1]);

  for (let i = 0; i < bins; i++) {
    fillBin(data, newData[idx], i);
    data[i].t = dt * i;

    if (!reactions[i]) {
      reactions[i] = deepClone(newReactions[idx + 1]);
      reactions[i].t = dt * i;
      reactions[i].dt = dt;
    } else {
      keys.forEach(key => {
        if (key !== 't' && key !== 'dt') {
          reactions[i][key] += newReactions[idx + 1][key];
        }
      });
    }
    // go to next state
    idx = idx + 1;
    // check if next state is still in the same bin
    while (newData[idx].t < t + dt) {
      keys.forEach(key => {
        if (key !== 't' && key !== 'dt') {
          reactions[i][key] += newReactions[idx + 1][key];
        }
      });
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
  return { data: data, reactions: reactions };
}

function tLogBin(bin: number, x: number, dt: number): number {
  if (bin === 1) {
    return dt;
  } else if (bin === 0) {
    return 0;
  } else {
    return dt * Math.pow(x, bin - 1);
  }
}

function tLogDiff(bin: number, x: number, dt: number): number {
  if (bin > 0) {
    return tLogBin(bin, x, dt) - tLogBin(bin - 1, x, dt);
  } else {
    throw new Error('Cant use bin = 0');
  }
}

function logBin(inData: Solution, nData: Solution, payload: SamplePayload): Solution {
  const data = inData.data;
  const newData = nData.data;
  const reactions = inData.reactions;
  const newReactions = nData.reactions;
  const bins = payload.bins;
  const t_end = payload.tstop;
  let dt = 0;
  const length = Object.keys(newReactions).length;
  if (!data[1]) {
    dt = newData[1].t / 100.0;
  } else {
    dt = data[1].t;
  }
  const x = Math.pow(t_end / dt, 1 / (bins - 1));
  let idx = 0;
  fillBin(data, newData[idx], 0);
  data[0].t = 0;
  idx = 1;
  let t = dt;
  addReactions(reactions, newReactions[idx], 0);
  reactions[0].t = t;
  reactions[0].dt = tLogDiff(1, x, dt);
  for (let i = 1; i < bins - 1; i++) {
    while (newData[idx].t < t * x) {
      idx = idx + 1;
      if (newData[idx].t < t * x * x) {
        addReactions(reactions, newReactions[idx], i - 1);
      }
    }
    if (newData[idx].t > t * x * x) {
      idx = idx - 1;
    }
    fillBin(data, newData[idx], i);
    data[i].t = t;
    t = tLogBin(i + 1, x, dt);
    if (idx < length - 1) {
      addReactions(reactions, newReactions[idx + 1], i);
      reactions[i].t = t;
      reactions[i].dt = tLogDiff(i + 1, x, dt);
    }
  }
  return { data: data, reactions: reactions };
}

function logBinSeries(nData: TimeSeries, payload: SamplePayload, d_t?: number): TimeSeries {
  const newData = deepClone(nData);
  const bins = payload.bins;
  const t_end = payload.tstop;
  let dt: number;
  if (!d_t) {
    dt = newData[1].t / 10.0;
  } else {
    dt = d_t;
  }
  const x = Math.pow(t_end / dt, 1 / (bins - 1));
  const data: TimeSeries = {};
  let t = 0;
  let idx = 0;
  fillBin(data, newData[idx], 0);
  data[0].t = 0;
  idx = 1;
  t = dt;
  for (let i = 1; i < bins - 1; i++) {
    while (newData[idx].t < t * x) {
      idx = idx + 1;
    }
    if (newData[idx].t > t * x * x) {
      idx = idx - 1;
    }
    fillBin(data, newData[idx], i);
    t = t * x;
    data[i].t = t;
  }
  return data;
}

function linearBinSeries(newData: TimeSeries, payload: SamplePayload): TimeSeries {
  const bins = payload.bins;
  const t_end = payload.tstop;
  const dt = t_end / bins;
  let t = 0;
  let idx = 0;
  const data: TimeSeries = {};

  for (let i = 0; i < bins; i++) {
    fillBin(data, newData[idx], i);
    data[i].t = t;
    // go to next state
    idx = idx + 1;
    t = t + dt;
    // check if next state is still in the same bin
    while (newData[idx].t < t) {
      // step through until current bin is exited
      idx = idx + 1;
    }
    // check if next state is more than one bin later
    if (newData[idx].t >= t + dt) {
      // if step is bigger than a bin, use the last state
      idx = idx - 1;
    }
  }
  return data;
}

function binSeries(newData: TimeSeries, payload: SamplePayload, dt?: number): TimeSeries {
  if (payload.bin_scale === 'linear') return linearBinSeries(newData, payload);
  if (payload.bin_scale === 'log') return logBinSeries(newData, payload, dt);
}

function binData(data: Solution, newData: Solution, payload: SamplePayload): Solution {
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
      avgData[bin].s[spec] = (avgDataSq[bin].s[spec] - Math.pow(avgData[bin].s[spec], 2)) / runs;
    });
  });
  return avgData;
}

function updateState(state: ModelState, reaction: ReactionElement[]): ModelState {
  let newState = deepClone(state);
  for (const rxn of reaction) {
    if (newState.s[rxn.id]) {
      newState.s[rxn.id] += rxn.delta;
    } else {
      newState.s[rxn.id] = rxn.delta;
    }
    if (newState.s[rxn.id] === 0 && rxn.id > 1) {
      newState = removeSpecies(newState, rxn.id);
    }
  }
  return newState;
}

function simStep(initialState: ModelState, getProbabilities: GetProbabilitiesFunc): SolutionStep {
  const u1 = Math.random();
  const u2 = Math.random();
  const iState = deepClone(initialState);
  const possibleStates = getProbabilities(iState);
  const summedProbabilities: number[] = [0];
  let PP = 0; // Probability amplitude
  possibleStates.forEach((rxn, index) => {
    summedProbabilities[index] = PP + rxn.P;
    PP += rxn.P;
  });
  const R = u1 * PP; // Determines which state is selected
  const dt = (1 / PP) * Math.log(1 / u2); // Generate the time step
  //console.log(initialState);
  const chosenReaction = possibleStates.find((rxn, index) => {
    return R < summedProbabilities[index];
  });

  if (!chosenReaction) {
    // if it makes it here its broken dawg
    throw new Error('Shits broken homie. Somehow a fraction of PP isnt less than PP');
  }
  const newState = updateState(iState, chosenReaction.s);
  const solStep: SolutionStep = { state: advanceTime(newState, dt), reactions: chosenReaction.R };
  return solStep;
}

function reactionZeros(reactions: ReactionCount, t_end: number, dt: number): ReactionCount {
  const zeroedReactions = deepClone(reactions);
  const rKeys = Object.keys(zeroedReactions).filter(key => key !== 't' && key !== 'dt');
  rKeys.forEach(key => {
    zeroedReactions[key] = 0;
  });
  zeroedReactions.t = t_end;
  zeroedReactions.dt = dt;
  return zeroedReactions;
}

function simRun(
  initialState: ModelState,
  t_end: number,
  getProbabilities: GetProbabilitiesFunc
): Solution {
  let state = deepClone(initialState);
  console.log('here');
  const t_series: TimeSeries = [initialState];
  const r_series: ReactionSeries = {};
  // simulate until end time is reached
  let idx = 0;
  let t = 0;
  while (t < t_end) {
    // console.log('step');
    const step = simStep(state, getProbabilities);
    state = step.state;
    idx = idx + 1;
    // console.log(JSON.stringify(state, null, '  '));
    t_series[idx] = step.state;
    r_series[idx] = step.reactions;
    t = step.state.t;
    // gotta have some kind of break here or maybe not idk
  }
  // t_series[idx] = t_series[idx - 1];
  // t_series[idx].t = t_end;
  return { data: t_series, reactions: r_series };
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
    case 'Smoluchowski-secondary-nucleation':
      getProbabilities = smoluchowskiSecondaryBuildModel(payload);
      break;
    default:
      throw new Error('Invalid model type!');
  }
  return getProbabilities;
};

export const createInitialState = (payload: SamplePayload): ModelState => {
  let initialState: ModelState;
  switch (payload.model) {
    case 'BD-nucleation':
      initialState = bdnInitialConditions(payload);
      break;
    case 'Becker-Doring':
      initialState = bdInitialConditions(payload);
      break;
    case 'Smoluchowski':
      initialState = smolInitialConditions(payload);
      break;
    case 'Smoluchowski-crowders':
      initialState = smolCrowdersInitialConditions(payload);
      break;
    case 'BD-crowders':
      initialState = bdCrowdersInitialConditions(payload);
      break;
    case 'Smoluchowski-secondary-nucleation':
      initialState = smolSecondaryInitialConditions(payload);
      break;
    default:
      throw new Error('Invalid model type!');
  }
  return initialState;
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
  if (!payload.ind_runs) payload.ind_runs = 1;
  data.runs = [];
  data.moments = [];
  data.runMoments = [];
  const binnedSeries: TimeSeries = {};
  const reactions: ReactionSeries = {};
  let sol: Solution;
  sol = { data: binnedSeries, reactions: reactions };
  // Run simulation however many times is needed
  for (let i = 0; i < runs; i++) {
    // Generate new time series
    const iState = createInitialState(payload);
    const run = simRun(iState, t_end, getProbabilities);
    const tSeries = run.data;
    // Store individual runs if desired
    if (i < payload.ind_runs) {
      data.runs[i] = reduceIndividualRun(splitSpecies(tSeries), payload.bins, t_end);
      data.runMoments[i] = reduceIndividualMoments(addToMoments([], tSeries), payload.bins);
    }
    // console.log(JSON.stringify(tSeries, null, '  '));
    // Bin the new time series
    sol = binData(sol, run, payload);
    const singleBinnedSeries = binSeries(tSeries, payload);
    data.moments = addToMoments(data.moments, singleBinnedSeries);
  }
  // Average data
  data.series = averageData(sol.data, runs);
  data.variance = splitSpecies(getVariance(sol.data, runs));
  data.species = splitSpecies(data.series);
  data.histograms = histSeries(data.series);
  data.moments = calculateMomentDevs(averageMoments(data.moments, runs));
  data.reactions = datifyReactions(normalizeReactions(sol.reactions, runs));
  // Below here can be done better but jank is fine for now
  data['V'] = payload.V;
  data['N'] = payload.N;
  data['end_time'] = payload.tstop;
  data['nc'] = payload.nc;
  return data;
}
