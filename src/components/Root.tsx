import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Grommet } from 'grommet';
import { grommet } from 'grommet/themes';
import { SkeletonTheme } from 'react-loading-skeleton';

import { HashRouter as Router } from 'react-router-dom';

import App from './App';
import { deepMerge } from 'grommet/utils';
import theme from 'src/styles/theme';
import MDXProvider from './MDXProvider';

function Root(): JSX.Element {
  return (
    <Router>
      <MDXProvider>
        <SkeletonTheme>
          <Grommet theme={deepMerge(grommet, theme)} full>
            <App />
          </Grommet>
        </SkeletonTheme>
      </MDXProvider>
    </Router>
  );
}

export default hot(Root);
