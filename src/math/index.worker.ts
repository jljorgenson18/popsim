import registerPromiseWorker from 'promise-worker/register';
import {
  SamplePayload,
  BeckerDoringPayload,
  KnowlesPayload,
  SmoluchowsiPayload,
  BDNucleationPayload
} from 'src/db/sample';

registerPromiseWorker((data: { method: string; params: unknown }) => {
  if (!data) return null;
  const { method, params } = data;
  if (method === 'createSample') {
    const payload = params as SamplePayload;
    if (payload.model === 'Becker-Doring') {
      // Call Becker-Doring model
      // beckerDoringModel(params as BeckerDoringPayload)
      return [];
    }
    if (payload.model === 'Knowles') {
      // knowlesModel(params as KnowlesPayload)
      return [];
    }
    if (payload.model === 'Smoluchowsi') {
      // smoluchowsiModel(params as SmoluchowsiPayload)
      return [];
    }
    if (payload.model === 'BD-nucleation') {
      // bdNucleationPayload(params as BDNucleationPayload)
      return [];
    }
  }

  return null;
});

export default {} as typeof Worker & { new (): Worker };
