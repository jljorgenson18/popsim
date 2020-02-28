import React, { useRef, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { useScaleInputField, useFilteredMoments } from '../hooks';
import { RadioButtonGroup, CheckBox, Box, FormField } from 'grommet';
import SaveChart from './SaveChart';
import { Moments } from 'src/math/types';
import Controls from './Controls';
import ControlField from './ControlField';

interface TimeSeriesChartProps {
  dataKey: string;
  vizName: string;
  deviationDataKey: string;
  deviationVizName: string;
  sampleName: string;
  moments: Moments[];
  strokeColor?: string;
}

function TimeSeriesChart(props: TimeSeriesChartProps) {
  const {
    dataKey,
    vizName,
    deviationDataKey,
    deviationVizName,
    sampleName,
    moments,
    strokeColor = '#82ca9d'
  } = props;
  const { options, scale, onChange } = useScaleInputField();
  const data = useFilteredMoments(moments);
  const [deviation, setDeviation] = useState(false);
  const chartRef = useRef(null);
  const currentDataKey = deviation ? deviationDataKey : dataKey;
  const currentVizName = deviation ? deviationVizName : vizName;
  return (
    <>
      <ResponsiveContainer minHeight={300} width="100%">
        <LineChart data={data} ref={chartRef}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            minTickGap={24}
            name="Time"
            tickFormatter={(val: number) => val.toExponential(2)}
            scale={scale}
          />
          <YAxis dataKey={currentDataKey} name={currentVizName} domain={[0, 'auto']} />
          <Tooltip labelFormatter={(time: number) => `Time: ${time.toExponential(2)}`} />
          <Line
            type="monotone"
            dataKey={currentDataKey}
            stroke={strokeColor}
            dot={false}
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
      <Controls>
        <ControlField
          label="Scale"
          input={
            <RadioButtonGroup name="scale" options={options} value={scale} onChange={onChange} />
          }
        />
        <CheckBox
          checked={deviation}
          label="Standard Deviation"
          onChange={(event: any) => {
            setDeviation(event.target.checked);
          }}
        />
        <SaveChart
          chartRef={chartRef}
          visualization={`${currentVizName}-${scale}`}
          sampleName={sampleName}
        />
      </Controls>
    </>
  );
}

export default TimeSeriesChart;
