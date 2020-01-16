import { ModelState } from './types';

export const deepClone = (s: any): any => {
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

export function stateMoment(state: ModelState, moment = 1): number {
  const keys = Object.keys(state.s);
  let sum = 0;
  keys.forEach(key => {
    const id = parseInt(key);
    if (Number.isNaN(id)) return;
    sum = sum + Math.pow(id, moment) * state.s[id];
  });
  return sum;
}

export function checkConserved(
  state: ModelState,
  expSum: number,
  moment = 1,
  prevState?: ModelState
) {
  const sum = stateMoment(state, moment);
  if (sum !== expSum) {
    console.log(moment);
    console.log(sum);
    console.log(expSum);
    if (prevState) {
      console.log(prevState);
      console.log(state);
    }
    throw new Error('The moment is not conserved');
  }
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
