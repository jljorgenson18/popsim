import { SamplePayload } from 'src/db/sample';
import {
  Species,
  ModelState,
  createInitialState,
  createSpecies
} from 'src/math/common';

// Test code, definitely doesn't work... yet



export default function model1(payload: SamplePayload): any {
  const { name, model } = payload;
  let state = {
    x: 0,
    y: 0
  };
  state = newState(state);
}

function newState(state: ModelState): ModelState {
  return state;
}
