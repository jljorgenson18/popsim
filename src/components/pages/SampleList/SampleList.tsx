import React, { useState, useMemo, useEffect } from 'react';
import { Heading, Box, Text, DataTable, Button, CheckBox } from 'grommet';
import { useHistory } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

import { SampleDoc, getSample } from 'src/db/sample';
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
  const [deletingSample, setDeletingSample] = useState<boolean>(false);
  const [selected, setSelected] = useState<{ [id: string]: boolean }>({});
  const selectedIds = useMemo(() => {
    return Object.keys(selected).filter(id => selected[id]);
  }, [selected]);
  function handleShowVisualization() {
    history.push(`/visualize?samples=${selectedIds.join(',')}`);
  }
  useEffect(() => {
    setSelected({});
  }, [allSamples]);

  async function handleDeleteSample() {
    setDeletingSample(true);
  }

  async function handleDownloadSample() {
    const sample = await getSample(selectedIds[0]);
    downloadSample(sample);
  }

  if (!allSamples || allSamples.length === 0) {
    return <Page>{fetching ? <Skeleton count={5} /> : <Heading>No samples yet!</Heading>}</Page>;
  }

  const allSelected = Boolean(allSamples && selectedIds.length === allSamples.length);

  function handleHeaderSelectedChange() {
    setSelected(
      allSamples.reduce((mapped, sample) => {
        mapped[sample._id] = !allSelected;
        return mapped;
      }, {} as typeof selected)
    );
  }
  return (
    <Page>
      <Heading level={2}>Sample List</Heading>
      <Box pad="medium" gap="medium" direction="row">
        <Button
          primary
          label="Show Visualization"
          disabled={selectedIds.length !== 1}
          onClick={handleShowVisualization}
        />
        <Button
          label="Download"
          disabled={selectedIds.length !== 1}
          onClick={handleDownloadSample}
        />
        <Button
          label="Delete"
          color="status-critical"
          onClick={handleDeleteSample}
          disabled={selectedIds.length === 0}
        />
      </Box>
      <DataTable
        primaryKey="_id"
        sortable
        pad={{ horizontal: 'medium', vertical: 'small' }}
        background={{
          header: 'dark-3',
          body: ['light-1', 'light-3']
        }}
        columns={[
          {
            property: 'selected',
            sortable: false,
            header: <CheckBox checked={allSelected} onChange={handleHeaderSelectedChange} />,
            render(sample: SampleDoc) {
              return (
                <CheckBox
                  checked={!!selected[sample._id]}
                  onChange={event => {
                    setSelected({
                      ...selected,
                      [sample._id]: event.target.checked
                    });
                  }}></CheckBox>
              );
            }
          },
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
          }
        ]}
        data={allSamples}></DataTable>
      {deletingSample ? (
        <DeleteSamplePrompt sampleIds={selectedIds} onClear={() => setDeletingSample(null)} />
      ) : null}
    </Page>
  );
}

export default SampleList;
