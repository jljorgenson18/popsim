import { SmoluchowskiCrowderPayload } from 'src/db/sample';
import { simulate } from 'src/math/main';

let mockPayload: SmoluchowskiCrowderPayload;
beforeEach(() => {
  mockPayload = {
    name: 'Some Sample',
    model: 'Smoluchowski-crowders',
    N: 100,
    Co: 100,
    tstop: 2,
    runs: 1,
    ind_runs: 1,
    a: 1,
    b: 1,
    ka: 1,
    kb: 1,
    kn: 1,
    nc: 3
  };
});

it('should generate a time series from Smoluchowski-crowders', async () => {
  const result = simulate(mockPayload);
  //console.log(JSON.stringify(result, null, '  '));

  expect(result).toBeTruthy();
});
