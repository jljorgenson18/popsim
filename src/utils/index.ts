import FileSaver from 'file-saver';
import { SampleDoc } from 'src/db/sample';

export const downloadSample = (sample: SampleDoc) => {
  const blob = new Blob([JSON.stringify(sample, null, '  ')], {
    type: 'application/json;charset=utf-8'
  });
  FileSaver.saveAs(blob, `${sample.name}.${sample._id}.json`);
};
