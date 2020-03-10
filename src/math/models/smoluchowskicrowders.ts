import { SmoluchowskiCrowderPayload, SamplePayload } from 'src/db/sample';
import {
  removeSpecies,
  deepClone,
  factorial,
  catchNull,
  catchNeg,
  checkConserved,
  calculateSmoluchowskiFrequencies,
  createInitialState
} from 'src/math/common';
import { ModelState, ReactionCount, GetProbabilitiesFunc, Step, ReactionElement } from '../types';

function reactionName(name: string): ReactionCount {
  const reactions: ReactionCount = {
    nucleation: 0,
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

function nucleate(nc: number): Step {
  const reaction = [
    { id: 1, delta: -1 * nc },
    { id: nc, delta: 1 }
  ];
  const step: Step = { reaction: reaction, reactions: reactionName('nucleation') };
  return step;
}

function addition(id: number): Step {
  const reaction = [
    { id: 1, delta: -1 },
    { id: id, delta: -1 },
    { id: id + 1, delta: 1 }
  ];
  const step: Step = { reaction: reaction, reactions: reactionName('addition') };
  return step;
}

function subtraction(id: number, nc: number): Step {
  // Check if the polymer is bigger than a nucleus
  if (id > nc) {
    const reaction = [
      { id: 1, delta: 1 },
      { id: id - 1, delta: 1 },
      { id: id, delta: -1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('subtraction') };
    return step;
  } else {
    const reaction = [
      { id: 1, delta: nc },
      { id: nc, delta: -1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('subtraction') };
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

export function buildModel(params: SmoluchowskiCrowderPayload): GetProbabilitiesFunc {
  // const { ka, kb, a = ka, b = kb, nc = 2, kn = a } = calculateSmoluchowskiFrequencies(params);
  const ka = params.ka * (params.Co / params.N);
  const kb = params.kb;
  let a: number;
  if (params.a) {
    a = params.a * (params.Co / params.N);
  } else if (params.a === 0) {
    a = 0.0;
  } else {
    a = ka;
  }
  let b: number;
  if (params.b) {
    b = params.b;
  } else if (params.b === 0) {
    b = 0.0;
  } else {
    b = kb;
  }
  let nc: number;
  if (params.nc) {
    nc = params.nc;
  } else {
    nc = 2;
  }
  let kn: number;
  if (params.kn) {
    kn = params.kn * Math.pow(params.Co / params.N, nc - 1);
  } else {
    kn = a / nc;
  }
  if (params.phi) {
    const R = params.r1 / params.rc;
    // const L = params.r1 / params.rsc;
    const A1 = R * R * R + 3 * R * R + 3 * R;
    const A2 = 3 * R * R * R + 4.5 * R * R;
    const A3 = 3 * R * R * R;
    const z = params.phi / (1 - params.phi);
    const lng = -1.0 * Math.log(1 - params.phi) + A1 * z + A2 * z * z + A3 * z * z * z;
    const gamma = Math.exp(lng);
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
  const goanc = Math.pow(goa, params.nc - 1);
  console.log(goa);
  console.log(goanc);
  return function(initialState: ModelState) {
    const possibleStates: { P: number; s: ReactionElement[]; R: ReactionCount }[] = [];
    const state = deepClone(initialState);
    // nucleate
    if (state.s[1] >= nc) {
      let P = (goanc * kn) / factorial(nc);
      for (let j = 0; j < nc; j++) {
        P = P * (state.s[1] - j);
      }
      const nuc = nucleate(nc);
      possibleStates.push({ P: P, s: nuc.reaction, R: nuc.reactions });
    }
    const keys = Object.keys(state.s);
    keys.forEach((key, idx) => {
      const speciesIdx = parseInt(key, 10);
      if (Number.isNaN(speciesIdx)) return;
      if (speciesIdx !== 1) {
        // add
        if (state.s[1] !== 0) {
          const Pa = goa * a * state.s[1] * state.s[speciesIdx];
          const add = addition(speciesIdx);
          possibleStates.push({ P: Pa, s: add.reaction, R: add.reactions });
        }
        // subtract
        const Pb = b * state.s[speciesIdx];
        const sub = subtraction(speciesIdx, nc);
        possibleStates.push({ P: Pb, s: sub.reaction, R: sub.reactions });
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

export function initialConditions(payload: SmoluchowskiCrowderPayload) {
  const N = payload.N;
  const t = 0;
  return createInitialState([{ id: 1, n: N }]);
}
