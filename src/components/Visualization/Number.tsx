import React, { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { VizProps } from './types';
import { RadioButtonGroup } from 'grommet';
import { useScaleInputField, useFilteredDataPoints, useFilteredMoments } from './hooks';
import SaveChart from './common/SaveChart';

function NumberComponent(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  const { options, scale, onChange } = useScaleInputField();
  const dataNumber = useFilteredMoments(data.moments);
  const chartRef = useRef(null);

  return (
    <>
      <LineChart data={dataNumber} width={500} height={300} ref={chartRef}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          name="Time"
          tickFormatter={(val: number) => val.toFixed(2)}
          scale={scale}
        />
        <YAxis dataKey="P" name="Number" />
        <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
        <Line type="monotone" dataKey="P" stroke="#82ca9d" dot={false} strokeWidth={3} />
      </LineChart>
      <RadioButtonGroup name="scale" options={options} value={scale} onChange={onChange} />
      <SaveChart chartRef={chartRef} visualization={'number-' + scale} sampleName={name} />
    </>
  );
}

export default NumberComponent;
