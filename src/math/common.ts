import { ModelState, Moments, SpeciesPair, Species } from './types';
import { SpeciesData } from './analysis';
import { BDNucleationPayload, SmoluchowskiPayload, BeckerDoringPayload } from 'src/db/sample';
import { TimeSeries } from './main';

export const deepClone = (s: any): any => {
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

export function stateMoment(state: ModelState, moment = 1): number {
  const keys = Object.keys(state.s);
  let sum = 0;
  keys.forEach(key => {
    const id = parseInt(key);
    if (Number.isNaN(id)) return;
    sum = sum + Math.pow(id, moment) * state.s[id];
  });
  return sum;
}

function fillSpecies(s: SpeciesPair[]): Species {
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

export function checkConserved(
  state: ModelState,
  expSum: number,
  moment = 1,
  prevState?: ModelState
) {
  const sum = stateMoment(state, moment);
  if (sum !== expSum) {
    console.log(moment);
    console.log(sum);
    console.log(expSum);
    if (prevState) {
      console.log(prevState);
      console.log(state);
    }
    throw new Error('The moment is not conserved');
  }
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

export function factorial(n: number): number {
  let fact = 1;
  for (let i = 1; i < n + 1; i++) {
    fact = fact * i;
  }
  return fact;
}

export function calculateBDFrequencies(payload: BeckerDoringPayload): BeckerDoringPayload {
  const outload = deepClone(payload);
  outload.a = (payload.a * payload.Co) / payload.N;
  outload.kn = Math.pow(payload.Co / payload.N, payload.nc - 1) * payload.kn;
  return outload;
}

export function calculateSmoluchowskiFrequencies(
  payload: SmoluchowskiPayload
): SmoluchowskiPayload {
  const outload = deepClone(payload);
  outload.a = (payload.Co / payload.N) * payload.a;
  outload.ka = (payload.Co / payload.N) * payload.ka;
  outload.kn = Math.pow(payload.Co / payload.N, payload.nc - 1) * payload.kn;
  return outload;
}

export function calculateBDNFrequencies(payload: BDNucleationPayload): BDNucleationPayload {
  const outload = deepClone(payload);
  outload.a = (payload.Co / payload.N) * payload.a;
  outload.ka = (payload.Co / payload.N) * payload.ka;
  outload.na = (payload.Co / payload.N) * payload.na;
  return outload;
}

export function reduceIndividualRun(
  inputSeries: SpeciesData[],
  bins: number,
  t_end: number
): SpeciesData[] {
  const len = inputSeries.length;
  const outSeries: SpeciesData[] = [];
  if (bins < len) {
    const delta = Math.floor((len - 1) / bins);
    for (let i = 1; i < len - 1; i = i + delta) {
      outSeries.push(inputSeries[i]);
    }
    return outSeries;
  } else {
    for (let i = 1; i < len - 1; i++) {
      outSeries.push(inputSeries[i]);
    }
    return outSeries;
  }
}

export function reduceIndividualMoments(inputSeries: Moments[], bins: number): Moments[] {
  const len = inputSeries.length;
  const outSeries: Moments[] = [];
  if (bins < len) {
    const delta = Math.floor((len - 1) / bins);
    for (let i = 1; i < len - 1; i = i + delta) {
      outSeries.push(inputSeries[i]);
    }
    return outSeries;
  } else {
    for (let i = 1; i < len - 1; i++) {
      outSeries.push(inputSeries[i]);
    }
    return outSeries;
  }
}
