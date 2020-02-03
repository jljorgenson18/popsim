import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { VizProps } from './types';

function Species(props: VizProps) {
  const {
    sample: { data }
  } = props;
  const keys = Object.keys(data.species);
  // Each key is a specific species, UI should somehow allow user to select
  // multiple species to plot on the same graph.
  // Key "t" should be ignored as it is the x-axis
  return (
    // LINES should be generated based on one or more selected values from keys
    <LineChart data={data.species} width={500} height={300}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="t" name="Time" tickFormatter={(val: number) => val.toFixed(2)} />
      <YAxis dataKey="1" name="Number" />
      <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
      <Line type="monotone" dataKey="1" stroke="#8884d8" dot={false} />
      <Line type="monotone" dataKey="2" stroke="#82ca9d" dot={false} />
      <Line type="monotone" dataKey="3" stroke="#FF5733" dot={false} />
    </LineChart>
  );
}

export default Species;
