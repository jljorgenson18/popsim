import { BeckerDoringPayload } from 'src/db/sample';
import { simulate } from 'src/math/main';

let mockPayload: BeckerDoringPayload;
beforeEach(() => {
  mockPayload = {
    name: 'Some Sample',
    model: 'Becker-Doring',
    N: 100,
    Co: 100,
    tstop: 2,
    runs: 1,
    ind_runs: 0,
    a: 1,
    b: 1
  };
});

it('should generate a time series from beckerdoring', async () => {
  const result = simulate(mockPayload);
  //console.log(JSON.stringify(result, null, '  '));

  expect(result).toBeTruthy();
});
