import { BeckerDoringPayload } from 'src/db/sample';
import { ModelState, GetProbabilitiesFunc, removeSpecies, deepClone } from 'src/math/common';

function nucleate(state: ModelState, nc: number): ModelState {
  const newState = deepClone(state);
  newState.s[1] = newState.s[1] - nc;
  if (!newState.s[nc]) {
    newState.s[nc] = 1;
  } else {
    newState.s[nc] = newState.s[nc] + 1;
  }
  return newState;
}

function addition(state: ModelState, id: number): ModelState {
  let newState = deepClone(state);
  newState.s[1] = newState.s[1] - 1;
  newState.s[id] = newState.s[id] - 1;
  if (newState.s[id] === 0) {
    newState = removeSpecies(newState, id);
  }

  if (newState.s[id + 1] != null) {
    newState.s[id + 1] = newState.s[id + 1] + 1;
  } else {
    newState.s[id + 1] = 1;
  }
  return newState;
}

function subtraction(state: ModelState, id: number, nc: number): ModelState {
  let newState = deepClone(state);
  // Check if the polymer is bigger than a nucleus
  if (newState.s[id] > nc) {
    newState.s[1] = newState.s[1] + 1; // Add monomer back
    if (id - 1 in newState.s) {
      // Gain one (r-1)-mer
      newState.s[id - 1] = newState.s[id - 1] + 1;
    } else {
      newState.s[id - 1] = 1;
    }
    newState.s[id] = newState.s[id] - 1; // Lost one r-mer
    if (newState.s[id] === 0) {
      // Handle if population hits 0
      newState = removeSpecies(newState, id);
    }
    return newState;
  } else {
    // If polymer is a nucleus, it dissolves
    newState.s[1] = newState.s[1] + nc;
    newState = removeSpecies(newState, nc);
    return newState;
  }
}

export function buildModel(params: BeckerDoringPayload): GetProbabilitiesFunc {
  const { a, b, nc = 2, kn = a } = params;
  return function(state: ModelState) {
    const possibleStates: { P: number; s: ModelState }[] = [];
    if (state.s[1] >= nc) {
      let P = 0.5 * kn;
      for (let j = 0; j < nc; j++) {
        P = P * (state.s[1] - j);
      }
      possibleStates.push({ P: P, s: nucleate(state, nc) });
    }
    Object.keys(state.s).forEach(key => {
      const speciesIdx = parseInt(key, 10);
      if (Number.isNaN(speciesIdx)) return;
      if (speciesIdx !== 1) {
        const Pa = a * state.s[1] * state.s[speciesIdx];
        possibleStates.push({ P: Pa, s: addition(state, speciesIdx) });
        const Pb = b * state.s[speciesIdx];
        possibleStates.push({ P: Pb, s: subtraction(state, speciesIdx, nc) });
      }
    });
    return possibleStates;
  };
}
