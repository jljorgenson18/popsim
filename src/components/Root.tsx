import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Grommet } from 'grommet';
import { grommet } from 'grommet/themes';
import { SkeletonTheme } from 'react-loading-skeleton';

import { HashRouter as Router } from 'react-router-dom';

import App from './App';

function Root(): JSX.Element {
  return (
    <Router>
      <SkeletonTheme>
        <Grommet theme={grommet} full>
          <App />
        </Grommet>
      </SkeletonTheme>
    </Router>
  );
}

export default hot(Root);
