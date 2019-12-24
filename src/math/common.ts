export interface ModelState {
  t?: number; // Time
  s?: any[]; // Species
  // r?: any[] // Resource pool
}

// Creating and modifying the state

export function createInitialState(N: any[]): ModelState {
  const state: ModelState = { t: 0, s: N };
  return state;
}

export function advanceTime(dt: number, initialState: ModelState): ModelState {
  const finalState: ModelState = { t: initialState.t + dt, s: initialState.s };
  return finalState;
}

export function createSpecies(initialState: ModelState, newVal: any): ModelState {
  const finalState: ModelState = initialState;
  finalState.s.push(newVal);
  return finalState;
}

export function removeSpecies(initialState: ModelState, index: number): ModelState {
  const finalState: ModelState = {
    t: initialState.t,
    s: initialState.s.filter((spec, ind) => ind != index)
  };
  return finalState;
}

export function changeSpecies(initialState: ModelState, index: number, newVal: any): ModelState {
  const finalState: ModelState = initialState;
  finalState.s[index] = newVal;
  return finalState;
}
