import React, { useState, useEffect } from 'react';
import { Heading, Footer, Header, Main, Box, ThemeType } from 'grommet';
import styled, { createGlobalStyle } from 'styled-components';

import db from 'src/db';
import { getAllSamples, SampleDoc } from 'src/db/sample';
import SampleList from './pages/SampleList/SampleList';
import SampleForm from './pages/SampleForm';
import Visualization from './pages/Visualization';

import { Switch, Route, Redirect, Link } from 'react-router-dom';
import AnchorLink from './common/AnchorLink';

const GlobalStyle = createGlobalStyle`
  body {
    height: 100%;
  }
  /** Overwrites weird overflow style issues on Recharts */
  .recharts-wrapper .recharts-surface {
    overflow: visible;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
`;
const ActivePage = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
`;

const MainHeading = styled(Heading)`
  a {
    text-decoration: none;
    color: ${props => {
      return (props.theme as ThemeType).global.colors.white;
    }};
  }
`;

function App(): JSX.Element {
  const [allSamples, setAllSamples] = useState<SampleDoc[] | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [changeCount, setChangeCount] = useState<number>(0);

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

  console.log('All Samples', allSamples);

  return (
    <ContentWrapper>
      <Header background="brand" pad="small">
        <MainHeading level="3">
          <Link to="/">Popsim</Link>
        </MainHeading>
        <Box direction="row" gap="medium">
          <AnchorLink to="/sample-list">Sample List</AnchorLink>
          <AnchorLink to="/create-sample">Create New Sample</AnchorLink>
        </Box>
      </Header>
      <GlobalStyle />
      <ActivePage>
        <Switch>
          <Route path="/sample-list">
            <SampleList fetching={fetching} allSamples={allSamples} />
          </Route>
          <Route path="/create-sample">
            <SampleForm />
          </Route>
          <Route path="/visualize">
            <Visualization allSamples={allSamples} />
          </Route>
          <Route exact path="/">
            <Redirect to="/sample-list" />
          </Route>
        </Switch>
      </ActivePage>
    </ContentWrapper>
  );
}

export default App;
