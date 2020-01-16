import { BDNucleationPayload } from 'src/db/sample';
import { simulate } from 'src/math/main';

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

it('should generate a time series from BD-nucleation', async () => {
  const result = simulate(mockPayload);
  //console.log(JSON.stringify(result, null, '  '));

  expect(result).toBeTruthy();
});
