import React from 'react';
import { Heading, Box, Text, Menu, DataTable } from 'grommet';
import ReactJson from 'react-json-view';
import { SampleDoc } from 'src/db/sample';

interface SampleListProps {
  samples: SampleDoc[];
  onShowVisualization: (sample: SampleDoc) => void;
  onDeleteSample: (sample: SampleDoc) => void;
  onDownloadSample: (sample: SampleDoc) => void;
}

function SampleList(props: SampleListProps): JSX.Element {
  const { samples, onDeleteSample, onDownloadSample, onShowVisualization } = props;
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
          property: 'doc',
          header: <Text>Document</Text>,
          render(sample: SampleDoc) {
            return <ReactJson src={sample} collapsed enableClipboard={false} />;
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
                  { label: 'Show Visualization', onClick: () => onShowVisualization(sample) },
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
