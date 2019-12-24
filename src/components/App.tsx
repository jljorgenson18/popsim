import React, { useState, useEffect } from 'react';
import { Main, Heading, Button, Footer, Header, Layer } from 'grommet';
import Skeleton from 'react-loading-skeleton';

import db from 'src/db';
import { getAllSamples, createSample, SamplePayload, SampleDoc } from 'src/db/sample';
import SampleList from './SampleList';
import SampleForm from './SampleForm';
import DeleteSamplePrompt from './DeleteSamplePromp';

interface AppProps {}

function App(props: AppProps): JSX.Element {
  const [allSamples, setAllSamples] = useState<SampleDoc[]>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [changeCount, setChangeCount] = useState<number>(0);
  const [showingNewSampleModal, setShowingNewSampleModal] = useState<boolean>(false);
  const [deletingSample, setDeletingSample] = useState<SampleDoc>(null);

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
    return () => (cancelled = true);
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
    await createSample(values);
    setShowingNewSampleModal(false);
  }

  function handleDeleteSample(sample: SampleDoc) {
    setDeletingSample(sample);
  }

  return (
    <>
      <Header background="brand" pad="medium">
        <Heading>Welcome to Popsim!</Heading>
        <Button onClick={() => setShowingNewSampleModal(true)} label={'Create new Sample'} />
      </Header>
      <Main pad="large">
        {fetching && !allSamples ? <Skeleton count={5} /> : null}
        {allSamples ? (
          <SampleList samples={allSamples} onDeleteSample={handleDeleteSample} />
        ) : null}
      </Main>
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
      {deletingSample ? (
        <DeleteSamplePrompt sample={deletingSample} onClear={() => setDeletingSample(null)} />
      ) : null}
      <Footer background="brand" pad="medium"></Footer>
    </>
  );
}

export default App;
