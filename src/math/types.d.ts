export type GetProbabilitiesFunc = (
  s: ModelState
) => { P: number; s: ReactionElement[]; R: ReactionCount }[];

export interface Species {
  [species: number]: number; // Species
}

export interface ReactionCount {
  t?: number;
  dt?: number;
  [reaction: string]: number;
}

export interface ReactionSeries {
  [step: number]: ReactionCount;
}

export interface ReactionElement {
  id: number;
  delta: number;
}

export interface Solution {
  data: TimeSeries;
  reactions: ReactionSeries;
}

export interface SolutionStep {
  state: ModelState;
  reactions: ReactionCount;
}

export interface Step {
  reaction: ReactionElement[];
  reactions: ReactionCount;
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
