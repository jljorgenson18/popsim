import { v4 as uuid } from 'uuid';

import db from './index';
import { getSampleData } from 'src/math/index';
import { Data } from 'src/math/main';
import isString from 'lodash/isString';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface BaseSample {
  name: string;
  group?: string;
  groupByValue?: string;
  N: number; // Number of monomers (int)
  tstop: number; // Time to stop simulation. Could also do a total number of steps to generate
  runs: number; // Number of simulation runs
  ind_runs?: number; // Number of individual runs to store
  V?: number; // System volume. Defaults to 1
  Co?: number; // Initial concentration of monomers
  bins?: number;
  bin_scale?: string;
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

export interface BeckerDoringCrowderPayload extends BaseSample {
  model: 'BD-crowders';
  a: number; // Addition rate constant (float)
  b: number; // Subtraction rate constant (float)
  nc?: number; // Critical nucleus size. Defaults to 2
  kn?: number; // Nucleation rate constant. Defaults to kn = a
  phi?: number; // Crowder volume concentration
  rc?: number; // Crowder radius
  r1?: number; // Monomer radius
  rsc?: number; // Sphero-cylinder radius
  gamma?: number; // Chemical activity of monomer
  alpha?: number; // Activity modifier
}

// export interface KnowlesPayload extends BaseSample {
//   model: 'Knowles';
//   ka: number; // Association rate constant
//   b: number; // Subtraction rate constant
//   a?: number; // Addition rate constant. Defaults to a = ka if empty
//   nc?: number; // Critical nucleus size. Defaults to 2
//   kn?: number; // Nucleation rate constant. Defaults to kn = a
// }

export interface SmoluchowskiPayload extends BaseSample {
  model: 'Smoluchowski';
  ka: number; // Association
  kb: number; // Dissociation
  a?: number; // Addition. Defaults to a = ka
  b?: number; // Subtraction. Defaults to b = kb
  nc?: number; // Critical nucleus size. Defaults to 2
  kn?: number; // Nucleation rate constant. Defaults to kn = a
}

export interface SmoluchowskiCrowderPayload extends BaseSample {
  model: 'Smoluchowski-crowders';
  ka: number; // Association
  kb: number; // Dissociation
  a?: number; // Addition. Defaults to a = ka
  b?: number; // Subtraction. Defaults to b = kb
  nc?: number; // Critical nucleus size. Defaults to 2
  kn?: number; // Nucleation rate constant. Defaults to kn = a
  phi?: number; // Crowder volume concentration
  rc?: number; // Crowder radius
  r1?: number; // Monomer radius
  rsc?: number; // Sphero-cylinder radius
  gamma?: number; // Chemical activity of monomer
  alpha?: number; // Activity modifier
}

export interface SmoluchowskiSecondaryPayload extends BaseSample {
  model: 'Smoluchowski-secondary-nucleation';
  ka: number; // Association
  kb: number; // Dissociation
  a?: number; // Addition. Defaults to a = ka
  b?: number; // Subtraction. Defaults to b = kb
  nc?: number; // Critical nucleus size. Defaults to 2
  n2?: number; // Secondary nucleus size. Defaults to nc
  kn?: number; // Nucleation rate constant. Defaults to kn = a
  k2?: number; // Secondary nucleation rate constant
  phi?: number; // Crowder volume concentration
  rc?: number; // Crowder radius
  r1?: number; // Monomer radius
  rsc?: number; // Sphero-cylinder radius
  gamma?: number; // Chemical activity of monomer
  alpha?: number; // Activity modifier
  Gamma?: number; // Secondary nucleation factor
}

export interface MPPayload extends BaseSample {
  model: 'MP';
  ka: number; // Association
  kb: number; // Dissociation
  a?: number; // Addition. Defaults to a = ka
  b?: number; // Subtraction. Defaults to b = kb
  nc?: number; // Critical nucleus size. Defaults to 2
  n2?: number; // Secondary nucleus size. Defaults to nc
  kn?: number; // Nucleation rate constant. Defaults to kn = a
  k2?: number; // Secondary nucleation rate constant
  phi?: number; // Crowder volume concentration
  rc?: number; // Crowder radius
  r1?: number; // Monomer radius
  rsc?: number; // Sphero-cylinder radius
  gamma?: number; // Chemical activity of monomer
  alpha?: number; // Activity modifier
}

// BACKBURNER
export interface BDNucleationPayload extends BaseSample {
  model: 'BD-nucleation';
  ka: number; // Growth-phase association
  kb: number; // Growth-phase dissociation
  na: number; // Nucleation-phase addition rate constant
  nb: number; // Nucleation-phase subtraction rate constant
  nc: number; // Critical nucleus size. Defines nucleation vs growth phase
  n2?: number; // Secondary nucleus size
  a?: number; // Growth-phase addition. Not sure if defaults to na or ka
  b?: number; // Growth-phase subtraction. ditto nb or kb
  k2?: number;
  r1?: number;
  rc?: number;
  rsc?: number;
  phi?: number;
  alpha?: number;
  gamma?: number;
}

export type SamplePayload =
  | BeckerDoringPayload
  | SmoluchowskiPayload
  | BDNucleationPayload
  | SmoluchowskiCrowderPayload
  | SmoluchowskiSecondaryPayload
  | MPPayload
  | BeckerDoringCrowderPayload;

export type SampleDoc = SamplePayload & {
  _attachments?: PouchDB.Core.Attachments;
  _id: string;
  _rev: string;
  createdAt: number;
  initialConditionFields?: string[];
};

export type SampleData = Data;

// For uploads and old school samples
export type SampleDocWithData = SampleDoc & {
  data: SampleData;
};

export const modelTypes = [
  'Becker-Doring',
  'BD-crowders',
  'Smoluchowski',
  'Smoluchowski-crowders',
  'Smoluchowski-secondary-nucleation',
  'BD-nucleation'
];

export async function createSample(
  payload: SamplePayload,
  onProgress?: (progress?: number) => void
): Promise<SampleDoc> {
  const id = uuid();
  const sampleData = await getSampleData(payload, onProgress);

  // Call to math goes here
  const response = await db.put<PartialBy<SampleDoc, '_rev'>>({
    ...payload,
    createdAt: Date.now(),
    _id: id
  });
  const sampleDataBlob = new Blob([JSON.stringify(sampleData)], { type: 'application/json' });
  await db.putAttachment(response.id, 'sampleData', response.rev, sampleDataBlob, 'text/plain');
  return await db.get<SampleDoc>(id);
}

export async function updateSample(updatedDoc: SampleDoc) {
  await db.put<PartialBy<SampleDoc, '_rev'>>(updatedDoc);
  return await db.get<SampleDoc>(updatedDoc._id);
}

export async function cloneSample(payload: SampleDocWithData): Promise<SampleDoc> {
  const id = uuid();
  const { data, ...rest } = payload;
  const response = await db.put<PartialBy<SampleDoc, '_rev'>>({
    ...rest,
    _attachments: undefined,
    _rev: undefined,
    createdAt: Date.now(),
    _id: id
  });
  const sampleDataBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  await db.putAttachment(response.id, 'sampleData', response.rev, sampleDataBlob, 'text/plain');
  return await db.get<SampleDoc>(id);
}

export async function deleteSamples(sampleDocs: SampleDoc[]): Promise<void> {
  await db.bulkDocs(
    sampleDocs.map(doc => {
      return {
        ...doc,
        _deleted: true
      };
    })
  );
}

export function getSamplesFromIds(sampleIds: string[]) {
  return Promise.all(sampleIds.map(getSample));
}

export async function getSample(id: string): Promise<SampleDoc> {
  return await db.get<SampleDoc>(id);
}

export async function getSampleDataFromSample(sampleOrId: string | SampleDoc): Promise<SampleData> {
  try {
    const sample = isString(sampleOrId) ? await db.get<SampleDoc>(sampleOrId) : sampleOrId;
    // If it was an old sample that just had the data there, use that
    if (isSampleDocWithData(sample)) return sample.data;
    const blob = (await db.getAttachment(sample._id, 'sampleData')) as Blob;
    return JSON.parse(await blob.text());
  } catch (err) {
    console.error(err);
    return null;
  }
}
export async function getAllSamples(): Promise<SampleDoc[]> {
  const result = await db.allDocs<SampleDoc>({
    include_docs: true,
    descending: true
  });
  return result.rows
    .map(row => {
      row.doc.groupByValue = row.doc.group || row.doc._id;
      return row.doc;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

const isSampleDocWithData = (sample: SampleDoc): sample is SampleDocWithData => {
  return !!(sample as SampleDocWithData).data;
};
