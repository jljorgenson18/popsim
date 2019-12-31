import { BeckerDoringPayload } from 'src/db/sample';
import {
  Species,
  ModelState,
  GetProbabilitiesFunc,
  createSpecies,
  removeSpecies,
  changeSpeciesValue,
  changeSpeciesNumber,
  updateResource
} from 'src/math/common';

function nucleate(state: ModelState, nc: number): ModelState {
  const n: number = state.r - nc;
  const nucleus: Species = { n: 1, val: nc };
  return updateResource(createSpecies(state, nucleus), n);
}

function addition(state: ModelState, ind: number): ModelState {
  const n = state.r - 1;
  const newVal = state.s[ind].val + 1;
  return updateResource(changeSpeciesValue(state, ind, newVal), n);
}

function subtraction(state: ModelState, ind: number, nc: number): ModelState {
  if (state.s[ind].val > nc) {
    const n = state.r + 1;
    const newVal = state.s[ind].val - 1;
    return updateResource(changeSpeciesValue(state, ind, newVal), n);
  }
  const n = state.r + nc;
  return updateResource(removeSpecies(state, ind), n);
}

export function buildModel(params: BeckerDoringPayload): GetProbabilitiesFunc {
  const { a, b, nc = 2, kn = a } = params;
  return function(state: ModelState) {
    const possibleStates: { P: number; s: ModelState }[] = [];

    if (state.r > nc) {
      let P = 0.5 * kn;
      for (let j = 0; j < nc; j++) {
        P = P * (state.r - j);
      }
      possibleStates.push({ P: P, s: nucleate(state, nc) });
    }
    state.s.forEach((s, index) => {
      const Pa = a * state.r;
      possibleStates.push({ P: Pa, s: addition(state, index) });
      const Pb = b;
      possibleStates.push({ P: Pb, s: subtraction(state, index, nc) });
    });

    return possibleStates;
  };
}
