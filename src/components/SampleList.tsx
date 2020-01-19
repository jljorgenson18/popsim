import React from 'react';
import { Heading, Box, Text, Menu, DataTable } from 'grommet';
import styled from 'styled-components';
import { SampleDoc } from 'src/db/sample';

interface SampleListProps {
  samples: SampleDoc[];
  onDeleteSample: (sample: SampleDoc) => void;
}

const InitialConditions = styled.pre`
  border: 1px solid #aaa;
  padding: 8px;
  margin: 0;
`;

function SampleList(props: SampleListProps): JSX.Element {
  const { samples, onDeleteSample, onDownloadSample } = props;
  if (samples.length === 0) {
    return (
      <Box>
        <Heading>No samples yet!</Heading>
      </Box>
    );
  }
  return (
    <DataTable
      primaryKey="_id"
      sortable
      columns={[
        {
          property: 'name',
          header: <Text>Name</Text>
        },
        {
          property: 'model',
          header: <Text>Model</Text>
        },
        {
          property: 'initial conditions',
          header: <Text>Initial Conditions</Text>,
          render(sample: SampleDoc) {
            const initialConditionFields = [
              'N',
              'tstop',
              'runs',
              'ind_runs',
              'a',
              'b',
              'ka',
              'kb',
              'kn',
              'na',
              'nb',
              'nc'
            ];
            const intialConditions = initialConditionFields.reduce<any>((ic, field) => {
              if ((sample as any)[field] != null) ic[field] = (sample as any)[field];
              return ic;
            }, {});
            return (
              <InitialConditions>{JSON.stringify(intialConditions, null, '  ')}</InitialConditions>
            );
          }
        },
        {
          property: 'createdAt',
          header: <Text>Created At</Text>,
          render(sample: SampleDoc) {
            return <Text>{new Date(sample.createdAt).toLocaleString()}</Text>;
          }
        },
        {
          property: 'actions',
          header: <Text>Actions</Text>,
          render(sample: SampleDoc) {
            return (
              <Menu
                label="Actions"
                items={[
                  { label: 'Delete', onClick: () => onDeleteSample(sample) },
                  { label: 'Download', onClick: () => onDownloadSample(sample) }
                ]}
              />
            );
          },
          sortable: false
        }
      ]}
      data={samples}></DataTable>
  );
}

export default SampleList;
