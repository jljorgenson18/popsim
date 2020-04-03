import { MPPayload, SamplePayload } from 'src/db/sample';
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
import { polymerMass } from 'src/math/analysis';

function reactionName(name: string): ReactionCount {
  const reactions: ReactionCount = {
    nucleation: 0,
    addition: 0,
    subtraction: 0,
    coagulation: 0,
    fragmentation: 0,
    'secondary-nucleation': 0
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
    { id: 2, delta: 1 },
    { id: 3, delta: n2 }
  ];
  // checkConserved(newState, 100);
  const step: Step = { reaction: reaction, reactions: reactionName('secondary-nucleation') };
  return step;
}

function nucleate(nc: number): Step {
  const reaction = [
    { id: 1, delta: -1 * nc },
    { id: 2, delta: 1 },
    { id: 3, delta: nc }
  ];
  const step: Step = { reaction: reaction, reactions: reactionName('nucleation') };
  return step;
}

function addition(): Step {
  const reaction = [
    { id: 1, delta: -1 },
    { id: 3, delta: 1 }
  ];
  const step: Step = { reaction: reaction, reactions: reactionName('addition') };
  return step;
}

function subtraction(): Step {
  const reaction = [
    { id: 1, delta: 1 },
    { id: 3, delta: -1 }
  ];
  const step: Step = { reaction: reaction, reactions: reactionName('subtraction') };
  return step;
}

function coagulate(): Step {
  const reaction = [{ id: 2, delta: -1 }];
  const step: Step = { reaction: reaction, reactions: reactionName('coagulation') };
  return step;
}

function dissociate(): Step {
  const reaction = [{ id: 2, delta: 1 }];
  const step: Step = { reaction: reaction, reactions: reactionName('fragmentation') };
  return step;
}

export function buildModel(params: MPPayload): GetProbabilitiesFunc {
  // const { ka, kb, a = ka, b = kb, nc = 2, kn = a } = calculateSmoluchowskiFrequencies(params);
  const ka = params.ka * (params.Co / params.N);
  const kb = params.kb;
  let a: number;
  if (params.a != null) {
    a = params.a * (params.Co / params.N);
  } else {
    a = ka;
  }
  let b: number;
  if (params.b != null) {
    b = params.b;
  } else {
    b = kb;
  }
  let nc = 2;
  if (params.nc) {
    nc = params.nc;
  }
  let n2 = nc;
  if (params.n2) {
    n2 = params.n2;
  }
  let kn = a;
  if (params.kn) {
    kn = params.kn * Math.pow(params.Co / params.N, nc - 1);
  }
  let k2 = 0;
  if (params.k2) {
    k2 = params.k2 * Math.pow(params.Co, n2);
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
  const gamma = params.gamma;
  return function (initialState: ModelState) {
    const possibleStates: { P: number; s: ReactionElement[]; R: ReactionCount }[] = [];
    const state = deepClone(initialState);
    // nucleate
    if (state.s[1] >= nc) {
      let Pn = goanc * kn;
      for (let j = 0; j < nc; j++) {
        Pn = Pn * (state.s[1] - j);
      }
      const nuc = nucleate(nc);
      possibleStates.push({ P: Pn, s: nuc.reaction, R: nuc.reactions });
    }
    // secondary nucleate
    if (state.s[1] >= n2 && state.s[2] && state.s[3]) {
      let P2n = Math.pow(gamma, n2) * k2 * state.s[3];
      for (let j = 0; j < n2; j++) {
        P2n = P2n * (state.s[1] - j);
      }
      const nuc2 = secondaryNucleation(n2);
      possibleStates.push({ P: P2n, s: nuc2.reaction, R: nuc2.reactions });
    }
    // if polymers exist
    if (state.s[2]) {
      // addition
      if (state.s[1]) {
        const Pa = goa * a * state.s[1] * state.s[2];
        const add = addition();
        possibleStates.push({ P: Pa, s: add.reaction, R: add.reactions });
      }
      // subtraction
      const L = state.s[3] / state.s[2];
      if (L >= nc + 1) {
        const Pb = b * state.s[2];
        const sub = subtraction();
        possibleStates.push({ P: Pb, s: sub.reaction, R: sub.reactions });
      } else if (L > nc) {
        const Pb = b * state.s[2] * (1 - nc / L);
        const sub = subtraction();
        possibleStates.push({ P: Pb, s: sub.reaction, R: sub.reactions });
      }
      // coagulation
      if (state.s[2] > 1) {
        const Pc = goa * ka * state.s[2] * (state.s[2] - 1);
        const coag = coagulate();
        possibleStates.push({ P: Pc, s: coag.reaction, R: coag.reactions });
      }
      // fragmentation
      if (state.s[3] - (2 * nc - 1) * state.s[2] > 0) {
        const Pf = kb * (state.s[3] - (2 * nc - 1) * state.s[2]);
        const frag = dissociate();
        possibleStates.push({ P: Pf, s: frag.reaction, R: frag.reactions });
      }
    }

    return possibleStates;
  };
}

export function initialConditions(payload: MPPayload) {
  const N = payload.N;
  const t = 0;
  return createInitialState([{ id: 1, n: N }]);
}
