export interface Species<V = number> {
  n: number; // Number of species
  val?: V; // Species identifier
}

export interface ModelState<V = number> {
  t: number; // Time
  s: Species<V>[]; // Species
  r?: number; // Resource pool
}

export type GetProbabilitiesFunc = (s: ModelState) => { P: number; s: ModelState }[];

// Creating and modifying the state

export function createInitialState(N: Species[]): ModelState {
  return { t: 0, s: N };
}

export function advanceTime(initialState: ModelState, dt: number): ModelState {
  return {
    ...initialState,
    t: initialState.t + dt
  };
}

export function createSpecies(initialState: ModelState, newVal: Species): ModelState {
  const newSpecies = initialState.s.slice(0);
  newSpecies.push(newVal);
  return {
    ...initialState,
    s: newSpecies
  };
}

export function updateResource(initialState: ModelState, val: number): ModelState {
  return { ...initialState, r: val };
}

export function removeSpecies(initialState: ModelState, index: number): ModelState {
  return {
    ...initialState,
    s: initialState.s.filter((spec, ind) => ind !== index)
  };
}

export function changeSpeciesValue(
  initialState: ModelState,
  index: number,
  newVal: any
): ModelState {
  const newSpecies = initialState.s.slice(0);
  newSpecies[index] = {
    ...newSpecies[index],
    val: newVal
  };
  return {
    ...initialState,
    s: newSpecies
  };
}

export function changeSpeciesNumber(
  initialState: ModelState,
  index: number,
  newNum: number
): ModelState {
  const newSpecies = initialState.s.slice(0);
  newSpecies[index] = {
    ...newSpecies[index],
    n: newNum
  };
  return {
    ...initialState,
    s: newSpecies
  };
}
