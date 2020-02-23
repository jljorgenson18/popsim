import React, { useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { VizProps } from './types';
import { useScaleInputField, useFilteredDataPoints, useFilteredMoments } from './hooks';
import { RadioButtonGroup, FormField } from 'grommet';
import SaveChart from './common/SaveChart';

function Length(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  const { options, scale, onChange } = useScaleInputField();
  const dataLength = useFilteredMoments(data.moments);
  const chartRef = useRef(null);

  return (
    <>
      <LineChart data={dataLength} width={500} height={300} ref={chartRef}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          name="Time"
          tickFormatter={(val: number) => val.toFixed(2)}
          scale={scale}
        />
        <YAxis dataKey="L" name="Length" />
        <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
        <Line type="monotone" dataKey="L" stroke="#82ca9d" dot={false} />
      </LineChart>
      <RadioButtonGroup name="scale" options={options} value={scale} onChange={onChange} />
      <SaveChart chartRef={chartRef} visualization={'length-' + scale} sampleName={name} />
    </>
  );
}

export default Length;
