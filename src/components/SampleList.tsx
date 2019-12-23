import React from 'react';
import { Heading, Box } from 'grommet';

import { Sample } from 'src/db/sample';

interface SampleListProps {
  samples: Sample[];
}

function SampleList(props: SampleListProps): JSX.Element {
  const { samples } = props;
  if (samples.length === 0) {
    return (
      <Box>
        <Heading>No samples yet!</Heading>
      </Box>
    );
  }
  return (
    <>
      {samples.map(sample => {
        return <Box key={sample._id}>{sample._id}</Box>;
      })}
    </>
  );
}

export default SampleList;
