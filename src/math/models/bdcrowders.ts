import { BeckerDoringCrowderPayload, SamplePayload } from 'src/db/sample';
import {
  removeSpecies,
  deepClone,
  factorial,
  calculateBDFrequencies,
  createInitialState
} from 'src/math/common';
import { ModelState, GetProbabilitiesFunc, ReactionCount, Step, ReactionElement } from '../types';

function reactionName(name: string): ReactionCount {
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

function nucleate(nc: number): Step {
  const reaction: ReactionElement[] = [
    { id: 1, delta: -1 * nc },
    { id: nc, delta: 1 }
  ];
  const step: Step = { reaction: reaction, reactions: reactionName('nucleation') };
  return step;
}

function addition(id: number): Step {
  const reaction: ReactionElement[] = [
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
    const reaction: ReactionElement[] = [
      { id: 1, delta: 1 },
      { id: id - 1, delta: 1 },
      { id: id, delta: -1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('subtraction') };
    return step;
  } else if (id === nc) {
    const reaction: ReactionElement[] = [
      { id: 1, delta: nc },
      { id: id, delta: -1 }
    ];
    const step: Step = { reaction: reaction, reactions: reactionName('subtraction') };
    return step;
  } else {
    throw new Error('ID should never be less than nc in subtraction');
  }
}

export function buildModel(params: BeckerDoringCrowderPayload): GetProbabilitiesFunc {
  // const { a, b, nc = 2, kn = a } = params;
  const a = params.a * (params.Co / params.N);
  let kn: number;
  let nc = 2;
  if (params.nc) {
    nc = params.nc;
  }
  if (params.kn) {
    kn = params.kn * Math.pow(params.Co / params.N, params.nc - 1);
  } else {
    kn = a / params.nc;
  }
  const b = params.b;
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
  console.log(goa, goanc);
  return function(state: ModelState) {
    const possibleStates: { P: number; s: ReactionElement[]; R: ReactionCount }[] = [];
    // nucleate
    if (state.s[1] >= nc) {
      let P = goanc * kn;
      for (let j = 0; j < nc; j++) {
        P = P * (state.s[1] - j);
      }
      const nuc = nucleate(nc);
      possibleStates.push({ P: P, s: nuc.reaction, R: nuc.reactions });
    }
    Object.keys(state.s).forEach(key => {
      const speciesIdx = parseInt(key, 10);
      if (Number.isNaN(speciesIdx)) return;
      if (speciesIdx !== 1) {
        if (state.s[1] !== 0) {
          const Pa = goa * a * state.s[1] * state.s[speciesIdx];
          const add = addition(speciesIdx);
          possibleStates.push({ P: Pa, s: add.reaction, R: add.reactions });
        }
        const Pb = b * state.s[speciesIdx];
        const sub = subtraction(speciesIdx, nc);
        possibleStates.push({ P: Pb, s: sub.reaction, R: sub.reactions });
      }
    });
    return possibleStates;
  };
}

export function initialConditions(payload: BeckerDoringCrowderPayload) {
  const N = payload.N;
  const t = 0;
  return createInitialState([{ id: 1, n: N }]);
}
