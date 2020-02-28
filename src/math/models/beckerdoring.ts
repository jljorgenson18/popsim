import { BeckerDoringPayload } from 'src/db/sample';
import { removeSpecies, deepClone, factorial, calculateBDFrequencies } from 'src/math/common';
import { ModelState, GetProbabilitiesFunc, ReactionCount, Step } from '../types';

function reaction(name: string): ReactionCount {
  const reactions: ReactionCount = {
    nucleation: 0,
    addition: 0,
    subtraction: 0
  };
  if (name in reactions) {
    reactions[name] = 1;
  } else {
    throw new Error('reaction not labelled correctly');
  }
  return reactions;
}

function nucleate(state: ModelState, nc: number): Step {
  const newState = deepClone(state);
  newState.s[1] = newState.s[1] - nc;
  if (!newState.s[nc]) {
    newState.s[nc] = 1;
  } else {
    newState.s[nc] = newState.s[nc] + 1;
  }
  const step: Step = { state: newState, reactions: reaction('nucleation') };
  return step;
}

function addition(state: ModelState, id: number): Step {
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
  const step: Step = { state: newState, reactions: reaction('addition') };
  return step;
}

function subtraction(state: ModelState, id: number, nc: number): Step {
  let newState = deepClone(state);
  // Check if the polymer is bigger than a nucleus
  if (id > nc) {
    newState.s[1] = newState.s[1] + 1; // Add monomer back
    if (newState.s[id - 1] != null) {
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
    const step: Step = { state: newState, reactions: reaction('subtraction') };
    return step;
  } else {
    // If polymer is a nucleus, it dissolves
    newState.s[1] = newState.s[1] + nc;
    newState.s[nc] = newState.s[nc] - 1;
    if (newState.s[nc] === 0) {
      newState = removeSpecies(newState, nc);
    }
    const step: Step = { state: newState, reactions: reaction('subtraction') };
    return step;
  }
}

export function buildModel(params: BeckerDoringPayload): GetProbabilitiesFunc {
  // const { a, b, nc = 2, kn = a } = params;
  const a = params.a * (params.Co / params.N);
  let kn: number;
  if (params.kn) {
    kn = params.kn * Math.pow(params.Co / params.N, params.nc - 1);
  } else {
    kn = a / params.nc;
  }
  const b = params.b;
  let nc = 2;
  if (params.nc) {
    nc = params.nc;
  }
  return function(state: ModelState) {
    const possibleStates: { P: number; s: ModelState; R: ReactionCount }[] = [];
    if (state.s[1] >= nc) {
      let P = kn / factorial(nc);
      for (let j = 0; j < nc; j++) {
        P = P * (state.s[1] - j);
      }
      const nuc = nucleate(state, nc);
      possibleStates.push({ P: P, s: nuc.state, R: nuc.reactions });
    }
    Object.keys(state.s).forEach(key => {
      const speciesIdx = parseInt(key, 10);
      if (Number.isNaN(speciesIdx)) return;
      if (speciesIdx !== 1) {
        if (state.s[1] !== 0) {
          const Pa = a * state.s[1] * state.s[speciesIdx];
          const add = addition(state, speciesIdx);
          possibleStates.push({ P: Pa, s: add.state, R: add.reactions });
        }
        const Pb = b * state.s[speciesIdx];
        const sub = subtraction(state, speciesIdx, nc);
        possibleStates.push({ P: Pb, s: sub.state, R: sub.reactions });
      }
    });
    return possibleStates;
  };
}
