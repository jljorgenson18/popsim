import uuid from 'uuid/v4';

import db from './index';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface BaseSample {
  name: string;
}

interface Model1Payload extends BaseSample {
  model: 'model 1';
}

interface Model2Payload extends BaseSample {
  model: 'model 2';
}

interface Model3Payload extends BaseSample {
  model: 'model 3';
}

interface Model4Payload extends BaseSample {
  model: 'model 4';
}

export type SamplePayload = Model1Payload | Model2Payload | Model3Payload | Model4Payload;

export type SampleDoc = SamplePayload & {
  _id: string;
  _rev: string;
  createdAt: number;
};

export async function createSample(payload: SamplePayload): Promise<SampleDoc> {
  const id = uuid();
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
