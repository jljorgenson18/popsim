import React, { useState, useMemo, useEffect } from 'react';
import { Heading, Box, Text, DataTable, Button, CheckBox } from 'grommet';
import { useHistory } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { FormEdit } from 'grommet-icons';

import { SampleDoc, getSample } from 'src/db/sample';
import Page from 'src/components/common/Page';
import DeleteSamplePrompt from './DeleteSamplePrompt';
import { downloadSample } from 'src/utils';
import UpdateSampleNameModal from 'src/components/common/UpdateSampleNameModal';
import styled from 'styled-components';

interface SampleListProps {
  allSamples?: SampleDoc[];
  fetching: boolean;
}

function NameRenderer(props: { sample: SampleDoc; onEdit: () => void }) {
  const { onEdit, sample } = props;
  const [hoveringOverName, setHoveringOverName] = useState<boolean>(false);
  return (
    <Box
      direction="row"
      align="center"
      justify="stretch"
      onMouseEnter={() => setHoveringOverName(true)}
      onMouseLeave={() => setHoveringOverName(false)}>
      <Text>{sample.name}</Text>
      <FormEdit
        style={{ cursor: 'pointer', visibility: hoveringOverName ? 'visible' : 'hidden' }}
        onClick={() => onEdit()}
      />
    </Box>
  );
}

function InitialConditionRenderer(props: { sample: SampleDoc }) {
  const { sample } = props;
  return (
    <Text size="small" style={{ fontFamily: 'monospace' }}>
      {sample.initialConditionFields
        .map(field =>
          (sample as any)[field] != null ? `${field}=${(sample as any)[field]}` : null
        )
        .filter(Boolean)
        .join(', ')}
    </Text>
  );
}

const DataTableWrapper = styled.div`
  /* Just grabbing the expander cells to make them better aligned */
  thead td,
  tbody td {
    vertical-align: middle;
  }
`;

function SampleList(props: SampleListProps): JSX.Element {
  const { fetching, allSamples } = props;
  const history = useHistory();
  const [deletingSample, setDeletingSample] = useState<boolean>(false);
  const [updatingSampleName, setUpdatingSampleName] = useState<SampleDoc>(null);
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
  const allSelected = Boolean(allSamples && selectedIds.length === allSamples.length);
  if (!allSamples || allSamples.length === 0) {
    return <Page>{fetching ? <Skeleton count={5} /> : <Heading>No samples yet!</Heading>}</Page>;
  }

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
      <DataTableWrapper>
        <DataTable
          primaryKey="_id"
          sortable
          pad={{ horizontal: 'medium', vertical: 'small' }}
          border={{
            body: {
              side: 'bottom',
              size: 'small',
              color: '#BBB'
            }
          }}
          groupBy="groupByValue"
          columns={[
            {
              property: 'selected',
              sortable: false,
              header: <CheckBox checked={allSelected} onChange={handleHeaderSelectedChange} />,
              render(sample: SampleDoc) {
                if (!sample._id) return null;
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
              header: <Text>Name</Text>,
              render(sample) {
                // If it's the aggregated sample
                if (!sample._id && (sample.group || sample.groupByValue)) {
                  return <Text>{sample.group || sample.groupByValue}</Text>;
                }
                return (
                  <NameRenderer sample={sample} onEdit={() => setUpdatingSampleName(sample)} />
                );
              }
            },
            {
              property: 'group',
              search: true,
              header: <Text>Group</Text>,
              render(sample: any) {
                return !sample._id ? sample.groupByValue : sample.group;
              }
            },
            {
              property: 'model',
              header: <Text>Model</Text>
            },
            {
              property: 'initialConditionFields',
              size: 'medium',
              header: <Text>Initial Conditions</Text>,
              render(sample: SampleDoc) {
                if (!Array.isArray(sample.initialConditionFields)) return null;
                return <InitialConditionRenderer sample={sample} />;
              }
            },
            {
              property: 'createdAt',
              aggregate: 'max',
              size: 'small',
              header: <Text>Created At</Text>,
              render(sample: SampleDoc) {
                return sample.createdAt ? (
                  <Text>{new Date(sample.createdAt).toLocaleString()}</Text>
                ) : null;
              }
            }
          ]}
          data={allSamples}></DataTable>
      </DataTableWrapper>

      {deletingSample ? (
        <DeleteSamplePrompt sampleIds={selectedIds} onClear={() => setDeletingSample(null)} />
      ) : null}
      {updatingSampleName ? (
        <UpdateSampleNameModal
          sample={updatingSampleName}
          onClear={() => setUpdatingSampleName(null)}
        />
      ) : null}
    </Page>
  );
}

export default SampleList;
