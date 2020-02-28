import { BDNucleationPayload } from 'src/db/sample';
import {
  removeSpecies,
  deepClone,
  catchNull,
  catchNeg,
  calculateBDNFrequencies
} from 'src/math/common';
import { ModelState, GetProbabilitiesFunc, ReactionCount, Step } from '../types';

function reaction(name: string): ReactionCount {
  const reactions: ReactionCount = {
    addition: 0,
    subtraction: 0,
    coagulation: 0,
    fragmentation: 0
  };
  if (name in reactions) {
    reactions[name] = 1;
  } else {
    throw new Error('reaction not labelled correctly');
  }
  return reactions;
}

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

function addition(state: ModelState, id: number): Step {
  let newState = deepClone(state);
  //console.log(id);
  newState.s[1] = newState.s[1] - 1;
  newState.s[id] = newState.s[id] - 1;
  if (newState.s[id] === 0 && id !== 1) {
    newState = removeSpecies(newState, id);
  }

  if (newState.s[id + 1] != null) {
    newState.s[id + 1] = newState.s[id + 1] + 1;
  } else {
    newState.s[id + 1] = 1;
  }
  catchNeg(newState, 'nucleate');
  const step: Step = { state: newState, reactions: reaction('addition') };
  return step;
}

function subtraction(state: ModelState, id: number, nc: number): Step {
  let newState = deepClone(state);
  // Check if the polymer is bigger than a nucleus
  // if (id > nc) {
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
  catchNeg(newState, 'sub');
  const step: Step = { state: newState, reactions: reaction('subtraction') };
  return step;
  // } else {
  //   // If polymer is a nucleus, it dissolves
  //   newState.s[1] = newState.s[1] + nc;
  //   newState.s[nc] = newState.s[nc] - 1;
  //   if (newState.s[nc] === 0) {
  //     newState = removeSpecies(newState, nc);
  //   }
  // console.log(JSON.stringify(newState, null, '  '));
  // catchNeg(newState, 'sub = nc');
  // return newState;}
}

function coagulate(state: ModelState, id1: number, id2: number): Step {
  let newState = deepClone(state);
  newState.s[id1] = newState.s[id1] - 1;
  if (newState.s[id1] === 0) {
    newState = removeSpecies(newState, id1);
  }
  newState.s[id2] = newState.s[id2] - 1;
  if (newState.s[id2] === 0) {
    newState = removeSpecies(newState, id2);
  }
  if (newState.s[id1 + id2] != null) {
    newState.s[id1 + id2] = newState.s[id1 + id2] + 1;
  } else {
    newState.s[id1 + id2] = 1;
  }
  catchNeg(newState, 'coagulate');
  const step: Step = { state: newState, reactions: reaction('coagulation') };
  return step;
}

function dissociate(state: ModelState, id1: number, id2: number, nc: number): Step {
  let newState = deepClone(state);
  newState.s[id1] = newState.s[id1] - 1;
  if (newState.s[id1] === 0) {
    newState = removeSpecies(newState, id1);
  }
  if (id2 >= nc) {
    if (newState.s[id2] != null) {
      newState.s[id2] = newState.s[id2] + 1;
    } else {
      newState.s[id2] = 1;
    }
  } else {
    newState.s[1] = newState.s[1] + id2;
  }
  if (id1 - id2 >= nc) {
    //console.log(id1, id2);
    if (newState.s[id1 - id2] != null) {
      newState.s[id1 - id2] = newState.s[id1 - id2] + 1;
    } else {
      newState.s[id1 - id2] = 1;
    }
  } else {
    newState.s[1] = newState.s[1] + id1 - id2;
  }
  //console.log(JSON.stringify(newState, null, '  '));
  catchNeg(newState, 'dissociate');
  const step: Step = { state: newState, reactions: reaction('fragmentation') };
  return step;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function buildModel(params: BDNucleationPayload): GetProbabilitiesFunc {
  //const { ka, kb, a = ka, b = kb, nc = 2, na = a, nb = a } = calculateBDNFrequencies(params);
  const kb = params.kb;
  let b: number;
  if (params.b) {
    b = params.b;
  } else {
    b = kb;
  }
  const nc = params.nc;
  const nb = params.nb;
  const ka = params.ka * (params.Co / params.N);
  const na = params.na * (params.Co / params.N);
  let a: number;
  if (params.a) {
    a = params.a * (params.Co / params.N);
  } else {
    a = ka;
  }
  return function(initialState: ModelState) {
    const possibleStates: { P: number; s: ModelState; R: ReactionCount }[] = [];
    const state = deepClone(initialState);
    catchNeg(state, 'buildModel');
    const keys = Object.keys(state.s);
    keys.forEach((key, idx) => {
      const speciesIdx = parseInt(key, 10);
      if (Number.isNaN(speciesIdx)) return;
      if (speciesIdx === 1 && state.s[1] > 1) {
        const Pan = na * state.s[1] * (state.s[1] - 1);
        const add = addition(state, 1);
        possibleStates.push({ P: Pan, s: add.state, R: add.reactions });
      } else if (speciesIdx > 1 && speciesIdx < nc) {
        if (state.s[1] !== 0) {
          const Pan = a * state.s[1] * state.s[speciesIdx];
          const add = addition(state, speciesIdx);
          possibleStates.push({ P: Pan, s: add.state, R: add.reactions });
        }
        const Pbn = nb * state.s[speciesIdx];
        const sub = subtraction(state, speciesIdx, nc);
        possibleStates.push({ P: Pbn, s: sub.state, R: sub.reactions });
      } else if (speciesIdx >= nc) {
        // add
        if (state.s[1] !== 0) {
          const Pag = a * state.s[1] * state.s[speciesIdx];
          const add = addition(state, speciesIdx);
          possibleStates.push({ P: Pag, s: add.state, R: add.reactions });
        }
        // subtract
        const Pbg = b * state.s[speciesIdx];
        const sub = subtraction(state, speciesIdx, nc);
        possibleStates.push({ P: Pbg, s: sub.state, R: sub.reactions });
        // break
        if (speciesIdx > 3) {
          const Pbr = kb * state.s[speciesIdx] * (speciesIdx - 3); // key - 3 accounts for multiple break points
          const frag = randomInt(2, speciesIdx - 2);
          const diss = dissociate(state, speciesIdx, frag, nc);
          possibleStates.push({ P: Pbr, s: diss.state, R: diss.reactions });
        }
        // coagulate
        keys.slice(idx).forEach(subKey => {
          const subIdx = parseInt(subKey, 10);
          if (Number.isNaN(subIdx)) return;
          if (subKey === key) {
            // adding to self. must be at least 2 polymers of same size
            if (state.s[speciesIdx] > 1) {
              const Pco = 0.5 * ka * state.s[speciesIdx] * (state.s[speciesIdx] - 1);
              const coag = coagulate(state, speciesIdx, speciesIdx);
              possibleStates.push({ P: Pco, s: coag.state, R: coag.reactions });
            }
          } else {
            const Pco = ka * state.s[speciesIdx] * state.s[subIdx];
            const coag = coagulate(state, speciesIdx, subIdx);
            possibleStates.push({ P: Pco, s: coag.state, R: coag.reactions });
          }
        });
      }
    });

    return possibleStates;
  };
}
