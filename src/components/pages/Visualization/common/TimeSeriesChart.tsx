import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RechartsFunction
} from 'recharts';
import randomColor from 'randomcolor';
import memoize from 'lodash/memoize';

import { useScaleInputField, useFilteredData } from '../hooks';
import { RadioButtonGroup, Box } from 'grommet';
import SaveChart from './SaveChart';
import ControlField from './ControlField';
import { TimeSeriesData } from '../types';

interface TimeSeriesChartProps {
  dataKeys: string[];
  vizName: string;
  sampleName: string;
  data: TimeSeriesData[];
  strokeColor?: string;
  controlElement?: JSX.Element;
}

function TimeSeriesChart(props: TimeSeriesChartProps) {
  const { dataKeys, vizName, sampleName, data, controlElement = null } = props;
  const { options: optionsX, scale: scaleX, onChange: onScaleXChange } = useScaleInputField(
    'scaleX'
  );
  const { options: optionsY, scale: scaleY, onChange: onScaleYChange } = useScaleInputField(
    'scaleY'
  );
  const [currentLegendDataKey, setCurrentLegendDataKey] = useState<string>(null);
  const filteredData = useFilteredData(data, ['t']);
  const chartRef = useRef(null);
  // So each dataKey will get their own color and it will be remembered
  const getColorFromDataKey = useMemo(() => {
    return memoize((dataKey: string) => {
      return randomColor({
        luminosity: 'dark'
      });
    });
  }, []);
  const sciNotationTickFormatter = (val: number) => val.toExponential(2);

  const handleLegendMouseEnter: RechartsFunction = o => {
    setCurrentLegendDataKey(o.dataKey);
  };

  const handleLegendMouseLeave: RechartsFunction = o => {
    const dataKey = o.dataKey as string;
    if (currentLegendDataKey === dataKey) {
      setCurrentLegendDataKey(null);
    }
  };
  return (
    <>
      <ResponsiveContainer id={'timeseries-chart-' + vizName} height={350} width="100%">
        <LineChart data={filteredData} ref={chartRef}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            minTickGap={24}
            name="Time"
            tickFormatter={sciNotationTickFormatter}
            scale={scaleX}
            tickCount={5}
            allowDataOverflow
          />
          <YAxis
            name={vizName}
            scale={scaleY}
            domain={scaleY === 'log' ? ['auto', 'auto'] : [0, 'auto']}
            tickFormatter={scaleY === 'log' ? sciNotationTickFormatter : null}
          />
          <Legend onMouseEnter={handleLegendMouseEnter} onMouseLeave={handleLegendMouseLeave} />
          <Tooltip
            labelStyle={{ marginBottom: 8 }}
            labelFormatter={(time: number) => `Time: ${time.toExponential(2)}`}
            formatter={(value, name, props) => `${Number(value).toExponential(2)}`}
          />
          {dataKeys.map(dataKey => {
            return (
              <Line
                id={`${vizName}-${dataKey}-line`}
                key={dataKey}
                type="monotone"
                dataKey={dataKey}
                stroke={getColorFromDataKey(dataKey)}
                dot={false}
                strokeWidth={currentLegendDataKey === dataKey ? 5 : 3}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      <Box direction="column" gap="large" pad="medium">
        {controlElement}
        <Box direction="row" gap="large">
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
        </Box>
        <Box direction="row" gap="large">
          <SaveChart
            chartRef={chartRef}
            visualization={`${vizName}-${scaleX}-${scaleY}`}
            sampleName={sampleName}
          />
        </Box>
      </Box>
    </>
  );
}

export default TimeSeriesChart;
