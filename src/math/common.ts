export interface Species {
  id: number; // Species identifier
  n: number; // Number of species
}

export interface ModelState {
  t: number; // Time
  [species: number]: number; // Species
  r?: number; // Resource pool
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

// export function changeSpeciesValue(
//   initialState: ModelState,
//   index: number,
//   newVal: any
// ): ModelState {
//   const newSpecies = initialState.s.slice(0);
//   newSpecies[index] = {
//     ...newSpecies[index],
//     val: newVal
//   };
//   return {
//     ...initialState,
//     s: newSpecies
//   };
// }

// export function changeSpeciesNumber(
//   initialState: ModelState,
//   index: number,
//   newNum: number
// ): ModelState {
//   const newSpecies = initialState.s.slice(0);
//   newSpecies[index] = {
//     ...newSpecies[index],
//     n: newNum
//   };
//   return {
//     ...initialState,
//     s: newSpecies
//   };
// }
