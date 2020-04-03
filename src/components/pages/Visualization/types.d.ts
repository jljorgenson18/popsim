import { SampleDoc, SampleData } from 'src/db/sample';

export interface VizProps {
  sample: SampleDoc;
  data: SampleData;
}

export interface TimeSeriesData {
  t: number;
  [key: string]: number;
}
