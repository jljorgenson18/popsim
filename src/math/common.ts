export interface Species {
  id: number; // Species identifier
  n: number; // Number of species
}

export interface ModelState {
  t: number; // Time
  [species: number]: number; // Species
  r?: number; // Resource pool
}

interface TimeSeries {
  states: ModelState[];
}

export type GetProbabilitiesFunc = (s: ModelState) => { P: number; s: ModelState }[];

// Creating and modifying the state

export function createInitialState(N: Species[]): ModelState {
  const state: ModelState = { t: 0 };
  for (const i of N) {
    state[i.id] = i.n;
  }
  return state;
}

export function advanceTime(initialState: ModelState, dt: number): ModelState {
  return {
    ...initialState,
    t: initialState.t + dt
  };
}

export function createSpecies(initialState: ModelState, newSpecies: Species): ModelState {
  const newState = initialState;
  newState[newSpecies.id] = newSpecies.n;
  return newState;
}

// export function updateResource(initialState: ModelState, val: number): ModelState {
//   return { ...initialState, r: val };
// }

export function removeSpecies(initialState: ModelState, id: number): ModelState {
  const newState = initialState;
  delete initialState[id];
  return newState;
}

function writeData(series: TimeSeries) {
  // Do something with data storage or whatever
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
  const possibleStates = getProbabilities(initialState);
  const summedProbabilities: number[] = [0];
  let PP = 0; // Probability amplitude
  possibleStates.forEach((state, index) => {
    summedProbabilities[index] = PP + state.P;
    PP += state.P;
  });
  const R = u1 * PP; // Determines which state is selected
  const dt = (1 / PP) * Math.log(1 / u2); // Generate the time step
  possibleStates.forEach((state, index) => {
    if (R < summedProbabilities[index]) {
      return advanceTime(state.s, dt);
    }
  });
  // if it makes it here its broken dawg
  throw new Error('Shits broken homie. Somehow a fraction of PP isnt less than PP');
}

function simRun(
  initialState: ModelState,
  t_end: number,
  getProbabilities: GetProbabilitiesFunc
): TimeSeries {
  let state = initialState;
  const t_series: TimeSeries = { states: [initialState] };
  // simulate until end time is reached
  while (state.t < t_end) {
    state = simStep(state, getProbabilities);
    t_series.states.push(state);
    // gotta have some kind of break here or maybe not idk
  }
  return t_series;
}

export function Simulate(
  initialState: ModelState,
  t_end: number,
  getProbabilities: GetProbabilitiesFunc,
  runs: number
) {
  let tSeries: TimeSeries;
  let binnedSeries: TimeSeries;
  // Run simulation however many times is needed
  for (let i; i < runs; i++) {
    // Generate new time series
    tSeries = simRun(initialState, t_end, getProbabilities);
    // Bin the new time series
    binnedSeries = binData(binnedSeries, tSeries);
  }
  // Average data
  binnedSeries = averageData(binnedSeries, runs);
  // Write data
  writeData(binnedSeries);
}
