import React, { useMemo, useState, useEffect } from 'react';
import { CheckBox, Box } from 'grommet';

import { VizProps, TimeSeriesData } from './types';
import ControlField from './common/ControlField';
import TimeSeriesChart from './common/TimeSeriesChart';
import OverflowBox from './common/OverflowBox';

interface ReactionsOptions {
  [reactionsKey: string]: boolean;
}

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function Reactions(props: VizProps) {
  const {
    sample: { name },
    data
  } = props;
  // We can get the species keys from just looking at the first species data
  const reactionKeys = useMemo(
    () => Object.keys(data.reactions[0]).filter(key => key !== 't' && key !== 'dt'),
    [data.reactions]
  );
  const [reactionsOptions, setReactionsOptions] = useState<ReactionsOptions>({});
  useEffect(() => {
    const newReactionsOptions = reactionKeys.reduce<ReactionsOptions>((mapped, key) => {
      mapped[key] = false;
      return mapped;
    }, {});
    setReactionsOptions(newReactionsOptions);
  }, [reactionKeys]);

  const dataKeys = useMemo(
    () => (reactionsOptions ? reactionKeys.filter(key => reactionsOptions[key]) : []),
    [reactionKeys, reactionsOptions]
  );
  return (
    <TimeSeriesChart
      dataKeys={dataKeys}
      vizName="Reactions"
      sampleName={name}
      data={data.reactions as TimeSeriesData[]}
      controlElement={
        <Box direction="row" gap="large" align="start">
          <ControlField
            label="Select Reactions"
            input={
              <OverflowBox>
                {reactionKeys.map(key => {
                  const display = !!reactionsOptions[key];
                  return (
                    <CheckBox
                      key={key}
                      checked={display}
                      label={capitalize(key)}
                      onChange={event => {
                        setReactionsOptions({
                          ...reactionsOptions,
                          [key]: event.target.checked
                        });
                      }}
                    />
                  );
                })}
              </OverflowBox>
            }
          />
        </Box>
      }
    />
  );
}
export default Reactions;
