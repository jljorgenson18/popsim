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

export interface Moments {
  t: number;
  M: number;
  M2: number;
  M_dev?: number;
  P: number;
  P2: number;
  P_dev?: number;
  L: number;
  L2: number;
  L_dev?: number;
}
