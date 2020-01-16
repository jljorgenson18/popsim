import { ModelState } from './types';

export const deepClone = (s: ModelState): ModelState => {
  return JSON.parse(JSON.stringify(s));
};
// Creating and modifying the state

export function simpleCatch(msg: string) {
  throw new Error(msg);
}

export function catchNeg(state: ModelState, label: string, initialState?: ModelState) {
  Object.keys(state.s).forEach(key => {
    if (state.s[+key] < 0) {
      console.log(JSON.stringify(state, null, '  '));
      if (initialState) {
        console.log(JSON.stringify(initialState, null, '  '));
      }
      throw new Error('Negative caught in ' + label);
    }
  });
}

export function catchNull(state: ModelState, label: string, initialState?: ModelState) {
  Object.keys(state.s).forEach(key => {
    if (state.s[+key] == null) {
      console.log(JSON.stringify(state, null, '  '));
      if (initialState) {
        console.log(JSON.stringify(initialState, null, '  '));
      }
      throw new Error('Null caught in ' + label);
    }
  });
}

// export function createSpecies(initialState: ModelState, newSpecies: Species): ModelState {
//   const newState = { ...initialState };
//   newState[newSpecies.id] = newSpecies.n;
//   return newState;
// }

// export function updateResource(initialState: ModelState, val: number): ModelState {
//   return { ...initialState, r: val };
// }

export function removeSpecies(initialState: ModelState, id: number): ModelState {
  const newState = deepClone(initialState);
  delete newState.s[id];
  return newState;
}
