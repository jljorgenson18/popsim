import { BDNucleationPayload } from 'src/db/sample';
import {
  removeSpecies,
  deepClone,
  catchNull,
  catchNeg,
  calculateBDNFrequencies
} from 'src/math/common';
import { ModelState, GetProbabilitiesFunc, ReactionCount, Step, ReactionElement } from '../types';

function reactionName(name: string): ReactionCount {
  const reactions: ReactionCount = {
    'n-phase addition': 0,
    'n-phase subtraction': 0,
    'g-phase addition': 0,
    'g-phase subtraction': 0,
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

function nAddition(id: number): Step {
  const reaction = [
    { id: 1, delta: -1 },
    { id: id, delta: -1 },
    { id: id + 1, delta: 1 }
  ];
  const step: Step = { reaction: reaction, reactions: reactionName('n-phase addition') };
  return step;
}

function gAddition(id: number): Step {
  const reaction = [
    { id: 1, delta: -1 },
    { id: id, delta: -1 },
    { id: id + 1, delta: 1 }
  ];
  const step: Step = { reaction: reaction, reactions: reactionName('g-phase addition') };
  return step;
}

function nSubtraction(id: number, nc: number): Step {
  // Check if the polymer is bigger than a nucleus
  if (id > nc) {
    const reaction = [
      { id: 1, delta: 1 },
      { id: id - 1, delta: 1 },
      { id: id, delta: -1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('n-phase subtraction') };
    return step;
  } else {
    const reaction = [
      { id: 1, delta: nc },
      { id: nc, delta: -1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('n-phase subtraction') };
    return step;
  }
}

function gSubtraction(id: number, nc: number): Step {
  // Check if the polymer is bigger than a nucleus
  if (id > nc) {
    const reaction = [
      { id: 1, delta: 1 },
      { id: id - 1, delta: 1 },
      { id: id, delta: -1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('g-phase subtraction') };
    return step;
  } else {
    const reaction = [
      { id: 1, delta: nc },
      { id: nc, delta: -1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('g-phase subtraction') };
    return step;
  }
}

function coagulate(id1: number, id2: number): Step {
  const reaction = [
    { id: id1, delta: -1 },
    { id: id2, delta: -1 },
    { id: id1 + id2, delta: 1 }
  ];
  const step: Step = { reaction: reaction, reactions: reactionName('coagulation') };
  return step;
}

function dissociate(id1: number, id2: number, nc: number): Step {
  if (id2 >= nc && id1 - id2 >= nc) {
    const reaction = [
      { id: id1, delta: -1 },
      { id: id2, delta: 1 },
      { id: id1 - id2, delta: 1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('fragmentation') };
    return step;
  } else if (id2 >= nc) {
    const reaction = [
      { id: id1, delta: -1 },
      { id: id2, delta: 1 },
      { id: 1, delta: id1 - id2 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('fragmentation') };
    return step;
  } else if (id1 - id2 >= nc) {
    const reaction = [
      { id: id1, delta: -1 },
      { id: id1 - id2, delta: 1 },
      { id: 1, delta: id2 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('fragmentation') };
    return step;
  } else {
    const reaction = [
      { id: id1, delta: -1 },
      { id: 1, delta: id1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('fragmentation') };
    return step;
  }
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
  } else if (params.b === 0) {
    b = 0.0;
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
  } else if (params.a === 0) {
    a = 0.0;
  } else {
    a = ka;
  }
  return function(initialState: ModelState) {
    const possibleStates: { P: number; s: ReactionElement[]; R: ReactionCount }[] = [];
    const state = deepClone(initialState);
    catchNeg(state, 'buildModel');
    const keys = Object.keys(state.s);
    keys.forEach((key, idx) => {
      const speciesIdx = parseInt(key, 10);
      if (Number.isNaN(speciesIdx)) return;
      if (speciesIdx === 1 && state.s[1] > 1) {
        const Pan = 0.5 * na * state.s[1] * (state.s[1] - 1);
        const add = nAddition(1);
        possibleStates.push({ P: Pan, s: add.reaction, R: add.reactions });
      } else if (speciesIdx > 1 && speciesIdx < nc) {
        if (state.s[1] !== 0) {
          const Pan = a * state.s[1] * state.s[speciesIdx];
          const add = nAddition(speciesIdx);
          possibleStates.push({ P: Pan, s: add.reaction, R: add.reactions });
        }
        const Pbn = nb * state.s[speciesIdx];
        const sub = nSubtraction(speciesIdx, 2);
        possibleStates.push({ P: Pbn, s: sub.reaction, R: sub.reactions });
      } else if (speciesIdx >= nc) {
        // add
        if (state.s[1] !== 0) {
          const Pag = a * state.s[1] * state.s[speciesIdx];
          const add = gAddition(speciesIdx);
          possibleStates.push({ P: Pag, s: add.reaction, R: add.reactions });
        }
        // subtract
        const Pbg = b * state.s[speciesIdx];
        const sub = gSubtraction(speciesIdx, 2);
        possibleStates.push({ P: Pbg, s: sub.reaction, R: sub.reactions });
        // break
        if (speciesIdx > 3) {
          const Pbr = kb * state.s[speciesIdx] * (speciesIdx - 3); // key - 3 accounts for multiple break points
          const frag = randomInt(2, speciesIdx - 2);
          const diss = dissociate(speciesIdx, frag, nc);
          possibleStates.push({ P: Pbr, s: diss.reaction, R: diss.reactions });
        }
        // coagulate
        keys.slice(idx).forEach(subKey => {
          const subIdx = parseInt(subKey, 10);
          if (Number.isNaN(subIdx)) return;
          if (subKey === key) {
            // adding to self. must be at least 2 polymers of same size
            if (state.s[speciesIdx] > 1) {
              const Pco = 0.5 * ka * state.s[speciesIdx] * (state.s[speciesIdx] - 1);
              const coag = coagulate(speciesIdx, speciesIdx);
              possibleStates.push({ P: Pco, s: coag.reaction, R: coag.reactions });
            }
          } else {
            const Pco = ka * state.s[speciesIdx] * state.s[subIdx];
            const coag = coagulate(speciesIdx, subIdx);
            possibleStates.push({ P: Pco, s: coag.reaction, R: coag.reactions });
          }
        });
      }
    });

    return possibleStates;
  };
}
