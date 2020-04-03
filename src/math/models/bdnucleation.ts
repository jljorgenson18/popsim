import { BDNucleationPayload, SamplePayload } from 'src/db/sample';
import {
  removeSpecies,
  deepClone,
  catchNull,
  catchNeg,
  calculateBDNFrequencies,
  factorial,
  createInitialState
} from 'src/math/common';
import { polymerMass } from 'src/math/analysis';
import { ModelState, GetProbabilitiesFunc, ReactionCount, Step, ReactionElement } from '../types';

function reactionName(name: string): ReactionCount {
  const reactions: ReactionCount = {
    'n-phase addition': 0,
    'n-phase subtraction': 0,
    'g-phase addition': 0,
    'g-phase subtraction': 0,
    'secondary-nucleation': 0,
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

function secondaryNucleation(n2: number): Step {
  const reaction = [
    { id: 1, delta: -1 * n2 },
    { id: n2, delta: 1 }
  ];
  // checkConserved(newState, 100);
  const step: Step = { reaction: reaction, reactions: reactionName('secondary-nucleation') };
  return step;
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
  let n2 = 0;
  if (params.n2) n2 = params.n2;
  let k2 = 0;
  if (params.k2) k2 = params.k2 * Math.pow(params.Co / params.N, n2);
  let a: number;
  if (params.a) {
    a = params.a * (params.Co / params.N);
  } else if (params.a === 0) {
    a = 0.0;
  } else {
    a = ka;
  }
  let gamma = 1;
  if (params.phi) {
    const R = params.r1 / params.rc;
    // const L = params.r1 / params.rsc;
    const A1 = R * R * R + 3 * R * R + 3 * R;
    const A2 = 3 * R * R * R + 4.5 * R * R;
    const A3 = 3 * R * R * R;
    const z = params.phi / (1 - params.phi);
    const lng = -1.0 * Math.log(1 - params.phi) + A1 * z + A2 * z * z + A3 * z * z * z;
    gamma = Math.exp(lng);
    const lna =
      (2 / 3) *
      Math.pow(params.r1 / params.rsc, 3) *
      (1.5 * (R * R + R + 1) * z + 4.5 * (R * R + R) * z * z + 4.5 * R * R * z * z * z);
    const alpha = Math.exp(lna);
    params.alpha = alpha;
    params.gamma = gamma;
  } else {
    params.gamma = 1.0;
    params.alpha = 1.0;
  }
  const goa = params.gamma / params.alpha;
  return function (initialState: ModelState) {
    const possibleStates: { P: number; s: ReactionElement[]; R: ReactionCount }[] = [];
    const state = deepClone(initialState);
    catchNeg(state, 'buildModel');
    if (state.s[1] >= n2 && n2 > 1) {
      const M_n2 = polymerMass(state, 1, n2);
      let P = (Math.pow(gamma, n2) * k2 * M_n2) / factorial(n2);
      if (P > 0) {
        for (let j = 0; j < n2; j++) {
          P = P * (state.s[1] - j);
        }
        const nuc2 = secondaryNucleation(n2);
        possibleStates.push({ P: P, s: nuc2.reaction, R: nuc2.reactions });
      }
    }
    const keys = Object.keys(state.s);
    keys.forEach((key, idx) => {
      const speciesIdx = parseInt(key, 10);
      if (Number.isNaN(speciesIdx)) return;
      if (speciesIdx === 1 && state.s[1] > 1) {
        const Pan = 0.5 * goa * na * state.s[1] * (state.s[1] - 1);
        const add = nAddition(1);
        possibleStates.push({ P: Pan, s: add.reaction, R: add.reactions });
      } else if (speciesIdx > 1 && speciesIdx < nc) {
        if (state.s[1] !== 0) {
          const Pan = goa * a * state.s[1] * state.s[speciesIdx];
          const add = nAddition(speciesIdx);
          possibleStates.push({ P: Pan, s: add.reaction, R: add.reactions });
        }
        const Pbn = nb * state.s[speciesIdx];
        const sub = nSubtraction(speciesIdx, 2);
        possibleStates.push({ P: Pbn, s: sub.reaction, R: sub.reactions });
      } else if (speciesIdx >= nc) {
        // add
        if (state.s[1] !== 0) {
          const Pag = goa * a * state.s[1] * state.s[speciesIdx];
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
              const Pco = 0.5 * goa * ka * state.s[speciesIdx] * (state.s[speciesIdx] - 1);
              const coag = coagulate(speciesIdx, speciesIdx);
              possibleStates.push({ P: Pco, s: coag.reaction, R: coag.reactions });
            }
          } else {
            const Pco = goa * ka * state.s[speciesIdx] * state.s[subIdx];
            const coag = coagulate(speciesIdx, subIdx);
            possibleStates.push({ P: Pco, s: coag.reaction, R: coag.reactions });
          }
        });
      }
    });

    return possibleStates;
  };
}

export function initialConditions(payload: BDNucleationPayload) {
  const N = payload.N;
  const t = 0;
  return createInitialState([{ id: 1, n: N }]);
}
