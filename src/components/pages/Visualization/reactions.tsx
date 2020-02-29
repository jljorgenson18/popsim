import React, { useMemo, useState, useEffect } from 'react';
import { CheckBox, Box } from 'grommet';

import { VizProps } from './types';
import ControlField from './common/ControlField';
import TimeSeriesChart from './common/TimeSeriesChart';

interface ReactionsOptions {
  [reactionsKey: string]: boolean;
}

function Reactions(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  // We can get the species keys from just looking at the first species data
  const reactionKeys = useMemo(
    () => Object.keys(data.reactions[0]).filter(key => key !== 't' && key !== 'dt'),
    [data.reactions]
  );
  const [variance, setVariance] = useState(false);
  const [ReactionsOptions, setReactionsOptions] = useState<ReactionsOptions>({});
  useEffect(() => {
    const newReactionsOptions = reactionKeys.reduce<typeof ReactionsOptions>((mapped, key) => {
      mapped[key] = false;
      return mapped;
    }, {});
    setReactionsOptions(newReactionsOptions);
  }, [reactionKeys]);

  const dataKeys = useMemo(
    () => (ReactionsOptions ? reactionKeys.filter(key => ReactionsOptions[key]) : []),
    [reactionKeys, ReactionsOptions]
  );

  return (
    <TimeSeriesChart
      dataKeys={dataKeys}
      vizName="Reactions"
      sampleName={name}
      data={variance ? (data.variance as any) : (data.reactions as any)}
      controlElement={
        <>
          <ControlField
            flex={{ grow: 1 }}
            label="Select Reactions"
            input={
              <Box>
                {reactionKeys.map(key => {
                  const display = !!ReactionsOptions[key];
                  return (
                    <CheckBox
                      key={key}
                      checked={display}
                      label={key}
                      onChange={event => {
                        setReactionsOptions({
                          ...ReactionsOptions,
                          [key]: event.target.checked
                        });
                      }}
                    />
                  );
                })}
              </Box>
            }
          />
          <CheckBox
            checked={variance}
            label="Variance"
            onChange={(event: any) => {
              setVariance(event.target.checked);
            }}
          />
        </>
      }
    />
  );
}
export default Reactions;
