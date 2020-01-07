import { buildModel } from 'src/math/beckerdoring';
import { BeckerDoringPayload } from 'src/db/sample';
import { Simulate, createInitialState, fillSpecies, Species } from 'src/math/common';

let mockPayload: BeckerDoringPayload;
beforeEach(() => {
  mockPayload = {
    name: 'Some Sample',
    model: 'Becker-Doring',
    N: 100,
    tstop: 100,
    a: 1,
    b: 1
  };
});

it('should generate a time series from beckerdoring', async () => {
  const result = Simulate(
    createInitialState([{ id: 1, n: mockPayload.N }]),
    mockPayload.tstop,
    buildModel(mockPayload),
    100
  );
  console.log(result);

  expect(result).toBeTruthy();
});
