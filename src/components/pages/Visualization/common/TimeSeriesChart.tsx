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

import { useScaleInputField, useFilteredData } from '../hooks';
import { RadioButtonGroup, CheckBox } from 'grommet';
import SaveChart from './SaveChart';
import Controls from './Controls';
import ControlField from './ControlField';
import { TimeSeriesData } from '../types';

interface TimeSeriesChartProps {
  dataKeys: string[];
  vizName: string;
  deviationDataKeys: string[];
  deviationVizName: string;
  sampleName: string;
  data: TimeSeriesData[];
  strokeColor?: string;
}

function TimeSeriesChart(props: TimeSeriesChartProps) {
  const {
    dataKeys,
    vizName,
    deviationDataKeys,
    deviationVizName,
    sampleName,
    data,
    strokeColor = '#82ca9d'
  } = props;
  const { options: optionsX, scale: scaleX, onChange: onScaleXChange } = useScaleInputField(
    'scaleX'
  );
  const { options: optionsY, scale: scaleY, onChange: onScaleYChange } = useScaleInputField(
    'scaleY'
  );
  const filteredData = useFilteredData(data, ['t']);
  const [deviation, setDeviation] = useState(false);
  const chartRef = useRef(null);
  const currentDataKeys = deviation ? deviationDataKeys : dataKeys;
  const currentVizName = deviation ? deviationVizName : vizName;
  return (
    <>
      <ResponsiveContainer minHeight={300} width="100%">
        <LineChart data={filteredData} ref={chartRef}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            minTickGap={24}
            name="Time"
            tickFormatter={(val: number) => val.toExponential(2)}
            scale={scaleX}
          />
          <YAxis name={currentVizName} scale={scaleY} domain={['auto', 'auto']} />
          <Tooltip labelFormatter={(time: number) => `Time: ${time.toExponential(2)}`} />
          {currentDataKeys.map(datakey => {
            return (
              <Line
                key={datakey}
                type="monotone"
                dataKey={datakey}
                stroke={strokeColor}
                dot={false}
                strokeWidth={3}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      <Controls>
        <ControlField
          label="Scale X"
          input={
            <RadioButtonGroup
              name="scaleX"
              options={optionsX}
              value={scaleX}
              onChange={onScaleXChange}
            />
          }
        />
        <ControlField
          label="Scale Y"
          input={
            <RadioButtonGroup
              name="scaleY"
              options={optionsY}
              value={scaleY}
              onChange={onScaleYChange}
            />
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
          visualization={`${currentVizName}-${scaleX}-${scaleY}`}
          sampleName={sampleName}
        />
      </Controls>
    </>
  );
}

export default TimeSeriesChart;
