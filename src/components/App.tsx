import React, { useState, useEffect } from 'react';
import { Heading, Button, Footer, Header, Layer } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import FileSaver from 'file-saver';
import styled from 'styled-components';

import db from 'src/db';
import { getAllSamples, createSample, cloneSample, SamplePayload, SampleDoc } from 'src/db/sample';
import SampleList from './SampleList';
import SampleForm from './SampleForm';
import DeleteSamplePrompt from './DeleteSamplePrompt';
import Visualization from './Visualization';
import UploadSample from './UploadSample';
import Loading, { LoadingProps } from './Loading';

const downloadSample = (sample: SampleDoc) => {
  const blob = new Blob([JSON.stringify(sample, null, '  ')], {
    type: 'application/json;charset=utf-8'
  });
  FileSaver.saveAs(blob, `${sample.name}.${sample._id}.json`);
};

const MainContainer = styled.main`
  padding: 48px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

function App(): JSX.Element {
  const [allSamples, setAllSamples] = useState<SampleDoc[] | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [changeCount, setChangeCount] = useState<number>(0);
  const [showingNewSampleModal, setShowingNewSampleModal] = useState<boolean>(false);
  const [showingUploadSampleModal, setShowingUploadSampleModal] = useState<boolean>(false);
  const [showingVisualization, setShowingVisualization] = useState<SampleDoc | null>(null);
  const [deletingSample, setDeletingSample] = useState<SampleDoc | null>(null);
  const [showingLoadingModal, setShowingLoadingModal] = useState<LoadingProps | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setFetching(true);
        const samples = await getAllSamples();
        if (cancelled) return;
        setFetching(false);
        setAllSamples(samples);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [changeCount]);

  useEffect(() => {
    let count = 0;
    const changes = db
      .changes({
        since: 'now',
        live: true
      })
      .on('change', () => {
        count++;
        setChangeCount(count);
      });
    return () => changes.cancel();
  }, []);

  async function handleNewSampleSubmit(values: SamplePayload) {
    try {
      setShowingNewSampleModal(false);
      setShowingLoadingModal({
        message: 'Creating sample...'
      });
      await createSample(values);
      setShowingLoadingModal(null);
    } catch (err) {
      console.error(err);
      setShowingLoadingModal(null);
    }
  }

  async function handleUploadSample(docs: SampleDoc[]) {
    console.log('Uploading samples');
    await Promise.all(docs.map(doc => cloneSample(doc)));
    console.log('Samples uploaded!!');
    setShowingUploadSampleModal(false);
  }

  function handleShowVisualizationModal(sample: SampleDoc) {
    setShowingVisualization(sample);
  }

  function handleDeleteSample(sample: SampleDoc) {
    setDeletingSample(sample);
  }

  function handleDownloadSample(sample: SampleDoc) {
    downloadSample(sample);
  }

  console.log('All Samples', allSamples);

  return (
    <>
      <Header background="brand" pad="medium">
        <Heading>Welcome to Popsim!</Heading>
        <Button onClick={() => setShowingNewSampleModal(true)} label={'Create new Sample'} />
        <Button onClick={() => setShowingUploadSampleModal(true)} label={'Upload Sample'} />
      </Header>
      <MainContainer>
        {fetching && !allSamples ? <Skeleton count={5} /> : null}
        {allSamples ? (
          <SampleList
            samples={allSamples}
            onShowVisualization={handleShowVisualizationModal}
            onDeleteSample={handleDeleteSample}
            onDownloadSample={handleDownloadSample}
          />
        ) : null}
      </MainContainer>
      {showingNewSampleModal ? (
        <Layer
          position="center"
          modal
          responsive={false}
          animation="fadeIn"
          onEsc={() => setShowingNewSampleModal(false)}
          onClickOutside={() => setShowingNewSampleModal(false)}>
          <SampleForm
            onSubmit={handleNewSampleSubmit}
            onCancel={() => setShowingNewSampleModal(false)}
          />
        </Layer>
      ) : null}
      {showingUploadSampleModal ? (
        <Layer
          position="center"
          modal
          responsive={false}
          animation="fadeIn"
          onEsc={() => setShowingUploadSampleModal(false)}
          onClickOutside={() => setShowingUploadSampleModal(false)}>
          <UploadSample onUploadSample={handleUploadSample} />
        </Layer>
      ) : null}
      {showingVisualization ? (
        <Layer
          position="center"
          modal
          responsive={false}
          animation="fadeIn"
          onEsc={() => setShowingVisualization(null)}
          onClickOutside={() => setShowingVisualization(null)}>
          <Visualization sample={showingVisualization} />
        </Layer>
      ) : null}
      {deletingSample ? (
        <DeleteSamplePrompt sample={deletingSample} onClear={() => setDeletingSample(null)} />
      ) : null}
      {showingLoadingModal ? (
        <Layer position="center" modal responsive={false} animation="fadeIn">
          <Loading message={showingLoadingModal.message} progress={showingLoadingModal.progress} />
        </Layer>
      ) : null}
      <Footer background="brand" pad="medium"></Footer>
    </>
  );
}

export default App;
