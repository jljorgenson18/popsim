import { BeckerDoringPayload } from 'src/db/sample';
import {
  Species,
  ModelState,
  Model,
  createSpecies,
  removeSpecies,
  changeSpeciesValue,
  changeSpeciesNumber,
  updateResource
} from 'src/math/common';

function nucleate(state: ModelState, nc: number): ModelState {
  const n: number = state.r - nc;
  const nucleus: Species = { n: 1, val: nc };
  const newState: ModelState = updateResource(createSpecies(state, nucleus), n);
  return newState;
}

function addition(state: ModelState, ind: number): ModelState {
  const n = state.r - 1;
  const newVal = state.s[ind].val + 1;
  const newState = updateResource(changeSpeciesValue(state, ind, newVal), n);
  return newState;
}

function subtraction(state: ModelState, ind: number, nc: number): ModelState {
  let newState = state;
  if (state.s[ind].val > nc) {
    const n = state.r + 1;
    const newVal = state.s[ind].val - 1;
    newState = updateResource(changeSpeciesValue(state, ind, newVal), n);
  } else {
    const n = state.r + nc;
    newState = updateResource(removeSpecies(state, ind), n);
  }
  return newState;
}

export function buildModel(inp: BeckerDoringPayload): Model {
  const model: Model = {
    params: inp,
    getProbabilities: function(state: ModelState) {
      // This right here seems gratuitous and obese
      const nc: number = this.params.nc;
      const kn: number = this.params.kn;
      const a: number = this.params.a;
      const b: number = this.inp.b;
      const possibleStates: { P: number; s: ModelState }[] = [];

      if (state.r > nc) {
        let P = 0.5 * kn;
        for (let j = 0; j < nc; j++) {
          P = P * (state.r - j);
        }
        possibleStates.push({ P: P, s: nucleate(state, nc) });
      }
      let index = 0;
      for (const i in state.s) {
        const Pa = a * state.r;
        possibleStates.push({ P: Pa, s: addition(state, index) });
        const Pb = b;
        possibleStates.push({ P: Pb, s: subtraction(state, index, nc) });
        index++;
      }

      return possibleStates;
    }
  };
  return model;
}
