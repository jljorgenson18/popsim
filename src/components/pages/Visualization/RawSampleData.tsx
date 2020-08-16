import React from 'react';
import ReactJson from 'react-json-view';
import { VizProps } from './types';
import { SampleDoc, SampleData } from 'src/db/sample';

const getJSONSrc = (sample: SampleDoc, data: SampleData) => {
  const { _id, createdAt, _rev, _attachments, ...rest } = sample;
  const src = { _id, createdAt, ...rest, data };
  return src;
};

function RawSampleData(props: VizProps) {
  const { sample, data } = props;
  return (
    <ReactJson
      src={getJSONSrc(sample, data)}
      collapsed={2}
      theme="solarized"
      displayDataTypes={false}
      enableClipboard={false}
      style={{ padding: 8 }}
    />
  );
}

export default RawSampleData;
