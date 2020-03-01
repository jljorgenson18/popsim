import React, { useState, useEffect } from 'react';
import { VizProps } from './types';
import TimeSeriesChart from './common/TimeSeriesChart';
import { CheckBox, Box } from 'grommet';
import { useTimeSeriesDataWithIndividualRuns } from './hooks';
import ControlField from './common/ControlField';

function Length(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  const {
    combinedMoments,
    dataKeys,
    runOptions,
    runMomentIndices,
    setRunOptions,
    runsSelected
  } = useTimeSeriesDataWithIndividualRuns(data, 'L');
  const [deviation, setDeviation] = useState(false);
  useEffect(() => {
    if (deviation) setDeviation(false);
  }, [runsSelected]);
  return (
    <TimeSeriesChart
      dataKeys={!runsSelected && deviation ? ['L_dev'] : dataKeys}
      vizName={deviation ? 'Length Deviation' : 'Length'}
      sampleName={name}
      data={combinedMoments}
      controlElement={
        <Box direction="row" gap="large" align="start">
          <ControlField
            label="Select Individual Runs"
            input={
              <Box overflow="auto" height={{ min: '0px', max: '160px' }}>
                {runMomentIndices.map(runIdx => {
                  const display = !!runOptions[runIdx];
                  return (
                    <CheckBox
                      key={runIdx}
                      checked={display}
                      label={String(runIdx)}
                      onChange={event => {
                        setRunOptions({
                          ...runOptions,
                          [runIdx]: event.target.checked
                        });
                      }}
                    />
                  );
                })}
              </Box>
            }
          />
          <CheckBox
            disabled={runsSelected}
            checked={deviation}
            label="Standard Deviation"
            onChange={(event: any) => {
              setDeviation(event.target.checked);
            }}
          />
        </Box>
      }
    />
  );
}

export default Length;
