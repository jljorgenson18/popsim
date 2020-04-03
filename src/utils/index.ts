import FileSaver from 'file-saver';
import { SampleDoc, getSampleDataFromSample } from 'src/db/sample';

export const downloadSample = async (sample: SampleDoc) => {
  const data = await getSampleDataFromSample(sample);
  const blob = new Blob(
    [JSON.stringify({ ...sample, _attachments: undefined, data }, null, '  ')],
    {
      type: 'application/json;charset=utf-8'
    }
  );
  FileSaver.saveAs(blob, `${sample.name}.${sample._id}.json`);
};
