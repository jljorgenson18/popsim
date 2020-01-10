import { buildModel } from 'src/math/smoluchowski';
import { SmoluchowskiPayload } from 'src/db/sample';
import { Simulate, createInitialState } from 'src/math/common';

let mockPayload: SmoluchowskiPayload;
beforeEach(() => {
  mockPayload = {
    name: 'Some Sample',
    model: 'Smoluchowski',
    N: 100,
    tstop: 2,
    a: 1,
    b: 1,
    ka: 1,
    kb: 1,
    kn: 1
  };
});

it('should generate a time series from beckerdoring', async () => {
  const result = Simulate(
    createInitialState([{ id: 1, n: mockPayload.N }]),
    mockPayload.tstop,
    buildModel(mockPayload),
    1
  );
  //console.log(JSON.stringify(result, null, '  '));

  expect(result).toBeTruthy();
});
