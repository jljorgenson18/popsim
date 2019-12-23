import React from 'react';
import { Heading, Box, Text, Menu, DataTable } from 'grommet';

import { SampleDoc } from 'src/db/sample';

interface SampleListProps {
  samples: SampleDoc[];
  onDeleteSample: (sample: SampleDoc) => void;
}

function SampleList(props: SampleListProps): JSX.Element {
  const { samples, onDeleteSample } = props;
  if (samples.length === 0) {
    return (
      <Box>
        <Heading>No samples yet!</Heading>
      </Box>
    );
  }
  return (
    <DataTable
      columns={[
        {
          property: 'name',
          header: <Text>Name</Text>,
          primary: true
        },
        {
          property: 'createdAt',
          header: <Text>Created At</Text>,
          render(sample) {
            return <Text>{new Date(sample.createdAt).toLocaleString()}</Text>;
          }
        },
        {
          property: 'actions',
          header: <Text>Actions</Text>,
          render(sample) {
            return (
              <Menu
                label="Actions"
                items={[{ label: 'Delete', onClick: () => onDeleteSample(sample) }]}
              />
            );
          }
        }
      ]}
      data={samples}></DataTable>
  );
}

export default SampleList;
