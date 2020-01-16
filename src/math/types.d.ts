export type GetProbabilitiesFunc = (s: ModelState) => { P: number; s: ModelState }[];

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
