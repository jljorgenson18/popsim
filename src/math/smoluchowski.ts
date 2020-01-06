import { SmoluchowsiPayload } from 'src/db/sample';
import {
  Species,
  ModelState,
  GetProbabilitiesFunc,
  createSpecies,
  removeSpecies
} from 'src/math/common';
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
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

function coagulate(state: ModelState, id1: number, id2: number): ModelState {
  let newState = state;
  newState[id1] = state[id1] - 1;
  if (newState[id1] === 0) {
    newState = removeSpecies(newState, id1);
  }
  newState[id2] = state[id2] - 1;
  if (newState[id2] === 0) {
    newState = removeSpecies(newState, id2);
  }
  if (id1 + id2 in newState) {
    newState[id1 + id2] = state[id1 + id2] + 1;
  } else {
    newState[id1 + id2] = 1;
  }
  return newState;
}

function dissociate(state: ModelState, id1: number, id2: number, nc: number): ModelState {
  let newState = state;
  newState[id1] = state[id1] - 1;
  if (newState[id1] === 0) {
    newState = removeSpecies(newState, id1);
  }
  if (id2 >= nc) {
    if (id2 in newState) {
      newState[id2] = state[id2] + 1;
    } else {
      newState[id2] = 1;
    }
  } else {
    newState[1] = state[1] + id2;
  }
  if (id1 - id2 >= nc) {
    if (id1 - id2 in newState) {
      newState[id1 - id2] = state[id1 - id2] + 1;
    } else {
      newState[id1 - id2] = 1;
    }
  } else {
    newState[1] = state[1] + id1 - id2;
  }
  return newState;
}

export function buildModel(params: SmoluchowsiPayload): GetProbabilitiesFunc {
  const { ka, kb, a = ka, b = kb, nc = 2, kn = a } = params;
  return function(state: ModelState) {
    const possibleStates: { P: number; s: ModelState }[] = [];
    // nucleate
    if (state[1] >= nc) {
      let P = 0.5 * kn;
      for (let j = 0; j < nc; j++) {
        P = P * (state[1] - j);
      }
      possibleStates.push({ P: P, s: nucleate(state, nc) });
    }
    const keys = Object.keys(state);
    keys.forEach((key, idx) => {
      if (+key !== 1) {
        // add
        const Pa = a * state[1] * state[+key];
        possibleStates.push({ P: Pa, s: addition(state, +key) });
        // subtract
        const Pb = b * state[+key];
        possibleStates.push({ P: Pb, s: subtraction(state, +key, nc) });
        // break
        if (+key > 3) {
          const Pbr = kb * state[+key] * (+key - 3); // key - 3 accounts for multiple break points
          const frag = randomInt(2, +key);
          possibleStates.push({ P: Pbr, s: dissociate(state, +key, frag, nc) });
        }
        // coagulate
        keys.slice(idx).forEach(subKey => {
          if (subKey === key) {
            // adding to self. must be at least 2 polymers of same size
            if (state[key] > 1) {
              const Pco = 0.5 * ka * state[key] * (state[key] - 1);
              possibleStates.push({ P: Pco, s: coagulate(state, +key, +key) });
            }
          } else {
            const Pco = ka * state[key] * state[subKey];
            possibleStates.push({ P: Pco, s: coagulate(state, +key, +subKey) });
          }
        });
      }
    });

    return possibleStates;
  };
}
