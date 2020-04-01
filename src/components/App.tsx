import React, { useState, useEffect, useMemo } from 'react';
import { Heading, Box, ThemeType } from 'grommet';
import styled, { createGlobalStyle } from 'styled-components';
import { normalize } from 'polished';
import Sidebar from 'react-sidebar';

import 'katex/dist/katex.css';
import db from 'src/db';
import { getAllSamples, SampleDoc } from 'src/db/sample';
import SampleList from './pages/SampleList/SampleList';
import SampleForm from './pages/SampleForm';
import Visualization from './pages/Visualization';
import Guide from './pages/Guide.mdx';
import BD from './pages/models/Becker-Doring.mdx';
import Smol from './pages/models/Smoluchowski.mdx';
import SmolBDN from './pages/models/SmoluchowskiBDN.mdx';
import AddSub from './pages/models/addsub.mdx';
import CoagFrag from './pages/models/coagfrag.mdx';
import Primary from './pages/models/PrimaryNucleation.mdx';
import Secondary from './pages/models/SecondaryNucleation.mdx';
import Algorithm from './pages/Algorithm.mdx';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import AnchorLink from './common/AnchorLink';
import UploadSamples from './pages/UploadSamples';

const GlobalStyle = createGlobalStyle`
  ${normalize()}
  /** Overwrites weird overflow style issues on Recharts */
  .recharts-wrapper .recharts-surface {
    overflow: visible;
  }
`;

const MainHeading = styled(Heading)`
  a {
    text-decoration: none;
    color: ${props => {
      return (props.theme as ThemeType).global.colors.white;
    }};
  }
`;

function useIsMobile() {
  const mql = useMemo(() => window.matchMedia(`(max-width: 800px)`), []);
  const [isMobile, setIsMobile] = useState(mql.matches);
  useEffect(() => {
    const handleMediaQueryChange = () => {
      setIsMobile(mql.matches);
    };
    mql.addListener(handleMediaQueryChange);
    return () => mql.removeListener(handleMediaQueryChange);
  }, [mql]);
  return isMobile;
}

function App(): JSX.Element {
  const [allSamples, setAllSamples] = useState<SampleDoc[] | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [changeCount, setChangeCount] = useState<number>(0);
  const isMobile = useIsMobile();
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  useEffect(() => {
    setSidebarIsOpen(false);
  }, [isMobile]);

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
    <>
      <GlobalStyle />
      <Sidebar
        open={sidebarIsOpen}
        docked={!isMobile}
        onSetOpen={open => setSidebarIsOpen(open)}
        sidebar={
          <Box fill direction="column" pad="medium" background="brand">
            <MainHeading level="3">
              <Link to="/">Popsim</Link>
            </MainHeading>
            <Box as="nav" direction="column" gap="small">
              <AnchorLink to="/sample-list">Sample List</AnchorLink>
              <AnchorLink to="/create-sample">Create New Sample</AnchorLink>
              <AnchorLink to="/upload-samples">Upload Samples</AnchorLink>
            </Box>
          </Box>
        }>
        <Box>
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
            <Route path="/upload-samples">
              <UploadSamples />
            </Route>
            <Route path="/guide">
              <Guide />
            </Route>
            <Route path="/beckerdoring">
              <BD />
            </Route>
            <Route path="/smoluchowski">
              <Smol />
            </Route>
            <Route path="/smolushowski-bdn">
              <SmolBDN />
            </Route>
            <Route path="/algorithm">
              <Algorithm />
            </Route>
            <Route path="/addition-subtraction">
              <AddSub />
            </Route>
            <Route path="/coagulation-fragmentation">
              <CoagFrag />
            </Route>
            <Route path="/primary">
              <Primary />
            </Route>
            <Route path="/secondary">
              <Secondary />
            </Route>
            <Route exact path="/">
              <Redirect to="/sample-list" />
            </Route>
          </Switch>
        </Box>
      </Sidebar>
    </>
  );
}

export default App;
