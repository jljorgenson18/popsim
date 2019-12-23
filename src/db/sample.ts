import db from './index';

export interface Sample {
  _id: string;
}

export function createSample(payload: Sample) {
  throw new Error('createSample not implemented yet');
}

export function deleteSample(payload: Sample) {
  throw new Error('deleteSample not implemented yet');
}

export async function getAllSamples(): Promise<Sample[]> {
  const result = await db.allDocs<Sample>();
  return result.rows.map(row => row.doc);
}
