import { buildModel } from 'src/math/bdnucleation';
import { BDNucleationPayload } from 'src/db/sample';
import { Simulate, createInitialState } from 'src/math/common';

let mockPayload: BDNucleationPayload;
beforeEach(() => {
  mockPayload = {
    name: 'Some Sample',
    model: 'BD-nucleation',
    N: 100,
    tstop: 2,
    runs: 1,
    nc: 2,
    a: 1,
    na: 1,
    b: 1,
    nb: 1,
    ka: 1,
    kb: 1
  };
});

it('should generate a time series from beckerdoring', async () => {
  const result = Simulate(
    createInitialState([{ id: 1, n: mockPayload.N }]),
    mockPayload,
    buildModel(mockPayload)
  );
  //console.log(JSON.stringify(result, null, '  '));

  expect(result).toBeTruthy();
});
