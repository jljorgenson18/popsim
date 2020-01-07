import isString from 'lodash/isString';
import { BeckerDoringPayload } from 'src/db/sample';
import { ModelState, GetProbabilitiesFunc, removeSpecies } from 'src/math/common';

function nucleate(state: ModelState, nc: number): ModelState {
  const newState = state;
  newState[1] = state[1] - nc;
  newState[nc] = state[nc] + 1;
  return newState;
}

function addition(state: ModelState, id: number): ModelState {
  let newState = state;
  newState[1] = state[1] - 1;
  newState[id] = state[id] - 1;
  if (newState[id] === 0) {
    newState = removeSpecies(newState, id);
  }
  if (id in newState) {
    newState[id + 1] = state[id + 1] + 1;
  } else {
    newState[id + 1] = 1;
  }
  return newState;
}

function subtraction(state: ModelState, id: number, nc: number): ModelState {
  let newState = state;
  // Check if the polymer is bigger than a nucleus
  if (state[id] > nc) {
    newState[1] = state[1] + 1; // Add monomer back
    if (id - 1 in newState) {
      // Gain one (r-1)-mer
      newState[id - 1] = state[id - 1] + 1;
    } else {
      newState[id - 1] = 1;
    }
    newState[id] = state[id] - 1; // Lost one r-mer
    if (newState[id] === 0) {
      // Handle if population hits 0
      newState = removeSpecies(newState, id);
    }
    return newState;
  } else {
    // If polymer is a nucleus, it dissolves
    newState[1] = state[1] + nc;
    newState[nc] = state[nc] - 1;
    if (newState[nc] === 0) {
      newState = removeSpecies(newState, nc);
    }
    return newState;
  }
}

export function buildModel(params: BeckerDoringPayload): GetProbabilitiesFunc {
  const { a, b, nc = 2, kn = a } = params;
  return function(state: ModelState) {
    const possibleStates: { P: number; s: ModelState }[] = [];
    if (state[1] >= nc) {
      let P = 0.5 * kn;
      for (let j = 0; j < nc; j++) {
        P = P * (state[1] - j);
      }
      possibleStates.push({ P: P, s: nucleate(state, nc) });
    }
    Object.keys(state).forEach((key: string | number) => {
      if (isString(key)) return;
      if (key !== 1) {
        const Pa = a * state[1] * state[+key];
        possibleStates.push({ P: Pa, s: addition(state, +key) });
        const Pb = b * state[+key];
        possibleStates.push({ P: Pb, s: subtraction(state, +key, nc) });
      }
    });

    return possibleStates;
  };
}
