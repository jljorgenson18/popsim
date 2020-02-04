import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { VizProps } from './types';

function NumberComponent(props: VizProps) {
  const {
    sample: { data }
  } = props;
  return (
    <LineChart data={data.number} width={500} height={300}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="t" name="Time" tickFormatter={(val: number) => val.toFixed(2)} />
      <YAxis dataKey="p" name="Number" />
      <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
      <Line type="monotone" dataKey="p" stroke="#82ca9d" dot={false} />
    </LineChart>
  );
}

export default NumberComponent;