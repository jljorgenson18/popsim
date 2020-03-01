import React, { useState } from 'react';
import { Heading, Box, Text, Menu, DataTable, Layer, Button } from 'grommet';
import { useHistory } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

import { SampleDoc, cloneSample } from 'src/db/sample';
import Page from 'src/components/common/Page';
import DeleteSamplePrompt from './DeleteSamplePrompt';
import { downloadSample } from 'src/utils';

interface SampleListProps {
  allSamples?: SampleDoc[];
  fetching: boolean;
}

function SampleList(props: SampleListProps): JSX.Element {
  const { fetching, allSamples } = props;
  const history = useHistory();
  const [deletingSample, setDeletingSample] = useState<SampleDoc | null>(null);

  function handleShowVisualization(sample: SampleDoc) {
    history.push(`/visualize?samples=${sample._id}`);
  }

  function handleDeleteSample(sample: SampleDoc) {
    setDeletingSample(sample);
  }

  function handleDownloadSample(sample: SampleDoc) {
    downloadSample(sample);
  }

  if (!allSamples || allSamples.length === 0) {
    return <Page>{fetching ? <Skeleton count={5} /> : <Heading>No samples yet!</Heading>}</Page>;
  }
  return (
    <Page>
      <Heading level={2}>Sample List</Heading>
      <DataTable
        border
        primaryKey="_id"
        sortable
        columns={[
          {
            property: 'name',
            search: true,
            header: <Text>Name</Text>
          },
          {
            property: 'model',
            header: <Text>Model</Text>
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
                    { label: 'Show Visualization', onClick: () => handleShowVisualization(sample) },
                    { label: 'Delete', onClick: () => handleDeleteSample(sample) },
                    { label: 'Download', onClick: () => handleDownloadSample(sample) }
                  ]}
                />
              );
            },
            sortable: false
          }
        ]}
        data={allSamples}></DataTable>
      {deletingSample ? (
        <DeleteSamplePrompt sample={deletingSample} onClear={() => setDeletingSample(null)} />
      ) : null}
    </Page>
  );
}

export default SampleList;
