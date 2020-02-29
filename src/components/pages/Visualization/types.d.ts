import { SampleDoc } from 'src/db/sample';

export interface VizProps {
  sample: SampleDoc;
}

export interface TimeSeriesData {
  t: number;
  [key: string]: number;
}
