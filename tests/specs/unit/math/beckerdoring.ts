import { buildModel } from 'src/math/beckerdoring';
import { BeckerDoringPayload } from 'src/db/sample';
import { Simulate, createInitialState } from 'src/math/common';

let mockPayload: BeckerDoringPayload;
beforeEach(() => {
  mockPayload = {
    name: 'Some Sample',
    model: 'Becker-Doring',
    N: 100,
    tstop: 2,
    runs: 1,
    a: 1,
    b: 1
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
