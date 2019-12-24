import uuid from 'uuid/v4';

import db from './index';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface BaseSample {
  name: string;
  N: number; // Number of monomers (int)
  tstop: number; // Time to stop simulation. Could also do a total number of steps to generate
  V?: number; // System volume. Defaults to 1
}

// For the optional things, maybe a checkbox or two.
// We can hammer that out way later though

export interface BeckerDoringPayload extends BaseSample {
  model: 'Becker-Doring';
  a: number; // Addition rate constant (float)
  b: number; // Subtraction rate constant (float)
  nc?: number; // Critical nucleus size. Defaults to 2
  kn?: number; // Nucleation rate constant. Defaults to kn = a
}

export interface KnowlesPayload extends BaseSample {
  model: 'Knowles';
  ka: number; // Association rate constant
  b: number; // Subtraction rate constant
  a?: number; // Addition rate constant. Defaults to a = ka if empty
  nc?: number; // Critical nucleus size. Defaults to 2
  kn?: number; // Nucleation rate constant. Defaults to kn = a
}

export interface SmoluchowsiPayload extends BaseSample {
  model: 'Smoluchowsi';
  ka: number; // Association
  kb: number; // Dissociation
  a?: number; // Addition. Defaults to a = ka
  b?: number; // Subtraction. Defaults to b = kb
  nc?: number; // Critical nucleus size. Defaults to 2
  kn?: number; // Nucleation rate constant. Defaults to kn = a
}

// BACKBURNER
export interface BDNucleationPayload extends BaseSample {
  model: 'BD-nucleation';
  ka: number; // Growth-phase association
  kb: number; // Growth-phase dissociation
  na: number; // Nucleation-phase addition rate constant
  nb: number; // Nucleation-phase subtraction rate constant
  nc: number; // Critical nucleus size. Defines nucleation vs growth phase
  a?: number; // Growth-phase addition. Not sure if defaults to na or ka
  b?: number; // Growth-phase subtraction. ditto nb or kb
}

export type SamplePayload =
  | BeckerDoringPayload
  | KnowlesPayload
  | SmoluchowsiPayload
  | BDNucleationPayload;

export type SampleDoc = SamplePayload & {
  _id: string;
  _rev: string;
  createdAt: number;
};

export const modelTypes = ['Becker-Doring', 'Knowles', 'Smoluchowsi', 'BD-nucleation'];

export async function createSample(payload: SamplePayload): Promise<SampleDoc> {
  const id = uuid();
  // Call to math goes here
  await db.put<PartialBy<SampleDoc, '_rev'>>({
    ...payload,
    createdAt: Date.now(),
    _id: id
  });
  return await db.get<SampleDoc>(id);
}

export async function deleteSample(payload: SampleDoc): Promise<void> {
  await db.remove(payload);
}

export async function getAllSamples(): Promise<SampleDoc[]> {
  const result = await db.allDocs<SampleDoc>({
    include_docs: true,
    descending: true
  });
  return result.rows.map(row => row.doc as SampleDoc).sort((a, b) => a.createdAt - b.createdAt);
}