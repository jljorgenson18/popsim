import { BaseSample } from 'src/db/sample';

export interface Species {
  n: number; // Number of species
  val?: any; // Species identifier
}

export interface ModelState {
  t: number; // Time
  s: Species[]; // Species
  r?: number; // Resource pool
}

export interface Model {
  // Models run through all possible next states and generate their probabilities.
  // Return a list of those next states and the probability associated with them.
  params: BaseSample; // Parameter array
  getProbabilities: (s: ModelState) => { P: number; s: ModelState }[];
}

// Creating and modifying the state

export function createInitialState(N: Species[]): ModelState {
  const state: ModelState = { t: 0, s: N };
  return state;
}

export function advanceTime(dt: number, initialState: ModelState): ModelState {
  const finalState: ModelState = { t: initialState.t + dt, s: initialState.s, r: initialState.r };
  return finalState;
}

export function createSpecies(initialState: ModelState, newVal: Species): ModelState {
  const finalState: ModelState = initialState;
  finalState.s.push(newVal);
  return finalState;
}

export function updateResource(initialState: ModelState, val: number): ModelState {
  const finalState: ModelState = { t: initialState.t, s: initialState.s, r: val };
  return finalState;
}

export function removeSpecies(initialState: ModelState, index: number): ModelState {
  const finalState: ModelState = {
    t: initialState.t,
    s: initialState.s.filter((spec, ind) => ind !== index)
  };
  return finalState;
}

export function changeSpeciesValue(
  initialState: ModelState,
  index: number,
  newVal: any
): ModelState {
  const finalState: ModelState = initialState;
  finalState.s[index].val = newVal;
  return finalState;
}

export function changeSpeciesNumber(
  initialState: ModelState,
  index: number,
  newNum: any
): ModelState {
  const finalState: ModelState = initialState;
  finalState.s[index].n = newNum;
  return finalState;
}
