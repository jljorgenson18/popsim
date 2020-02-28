import React from 'react';
import { VizProps } from './types';
import ReactJson from 'react-json-view';

function RawSampleData(props: VizProps) {
  const { sample } = props;
  return <ReactJson src={sample} collapsed={2} theme="solarized" enableClipboard={false} />;
}

export default RawSampleData;
