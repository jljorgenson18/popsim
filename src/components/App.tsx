import React, { useState, useEffect } from 'react';
import { Main, Heading, Button, Footer, Header, Layer } from 'grommet';
import Skeleton from 'react-loading-skeleton';

import { getAllSamples, Sample } from 'src/db/sample';
import SampleList from './SampleList';
import SampleForm from './SampleForm';

interface AppProps {}

function App(props: AppProps): JSX.Element {
  const [allSamples, setAllSamples] = useState<Sample[]>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [showingNewSampleModal, setShowingNewSampleModal] = useState<boolean>(false);

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
        console.error(err);
        setFetching(false);
      }
    })();
    return () => (cancelled = true);
  }, []);

  return (
    <>
      <Header background="brand" pad="medium">
        <Heading>Welcome to Popsim!</Heading>
        <Button onClick={() => setShowingNewSampleModal(true)} label={'Create new Sample'} />
      </Header>
      <Main pad="large">
        {fetching ? <Skeleton count={5} /> : null}
        {allSamples ? <SampleList samples={allSamples} /> : null}
      </Main>
      {showingNewSampleModal ? (
        <Layer
          position="center"
          modal
          animation="fadeIn"
          onEsc={() => setShowingNewSampleModal(false)}
          onClickOutside={() => setShowingNewSampleModal(false)}>
          <SampleForm
            onSubmit={vals => {
              console.log(vals);
              setShowingNewSampleModal(false);
            }}
            onCancel={() => setShowingNewSampleModal(false)}
          />
        </Layer>
      ) : null}
      <Footer background="brand" pad="medium"></Footer>
    </>
  );
}

export default App;
