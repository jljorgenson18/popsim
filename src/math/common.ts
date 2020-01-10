import { SamplePayload } from 'src/db/sample';

export interface Species {
  [species: number]: number; // Species
}

export interface SpeciesPair {
  id: number;
  n: number;
}

export interface ModelState {
  s: Species;
  t: number; // Time
}

interface TimeSeries {
  states: ModelState[];
}

export type GetProbabilitiesFunc = (s: ModelState) => { P: number; s: ModelState }[];

export const deepClone = (s: ModelState): ModelState => {
  return JSON.parse(JSON.stringify(s));
};
// Creating and modifying the state

export function simpleCatch(msg: string) {
  throw new Error(msg);
}

export function catchNeg(state: ModelState, label: string, initialState?: ModelState) {
  Object.keys(state.s).forEach(key => {
    if (state.s[+key] < 0) {
      console.log(JSON.stringify(state, null, '  '));
      if (initialState) {
        console.log(JSON.stringify(initialState, null, '  '));
      }
      throw new Error('Negative caught in ' + label);
    }
  });
}

export function catchNull(state: ModelState, label: string, initialState?: ModelState) {
  Object.keys(state.s).forEach(key => {
    if (state.s[+key] == null) {
      console.log(JSON.stringify(state, null, '  '));
      if (initialState) {
        console.log(JSON.stringify(initialState, null, '  '));
      }
      throw new Error('Null caught in ' + label);
    }
  });
}

export function fillSpecies(s: SpeciesPair[]): Species {
  const spec: Species = {};
  s.forEach(pair => {
    spec[pair.id] = pair.n;
  });
  return spec;
}

export function createInitialState(N: SpeciesPair[]): ModelState {
  const state: ModelState = { t: 0, s: fillSpecies(N) };
  return state;
}

export function advanceTime(initialState: ModelState, dt: number): ModelState {
  return {
    ...initialState,
    t: initialState.t + dt
  };
}

// export function createSpecies(initialState: ModelState, newSpecies: Species): ModelState {
//   const newState = { ...initialState };
//   newState[newSpecies.id] = newSpecies.n;
//   return newState;
// }

// export function updateResource(initialState: ModelState, val: number): ModelState {
//   return { ...initialState, r: val };
// }

export function removeSpecies(initialState: ModelState, id: number): ModelState {
  const newState = deepClone(initialState);
  delete newState.s[id];
  return newState;
}

function binData(data: TimeSeries, newData: TimeSeries): TimeSeries {
  // bin the data somehow
  return data;
}

function averageData(data: TimeSeries, runs: number): TimeSeries {
  // Average the data
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

export function Simulate(
  initialState: ModelState,
  payload: SamplePayload,
  getProbabilities: GetProbabilitiesFunc
): TimeSeries {
  const t_end = payload.tstop;
  const runs = payload.runs;
  let tSeries: TimeSeries;
  let binnedSeries: TimeSeries;
  // Run simulation however many times is needed
  for (let i = 0; i < runs; i++) {
    // Generate new time series
    tSeries = simRun(initialState, t_end, getProbabilities);
    // Bin the new time series
    binnedSeries = binData(binnedSeries, tSeries);
  }
  // Average data
  binnedSeries = averageData(binnedSeries, runs);

  return tSeries;
}
