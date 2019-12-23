import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Grommet } from 'grommet';
import { grommet } from 'grommet/themes';
import { SkeletonTheme } from 'react-loading-skeleton';

import App from './App';

function Root(): JSX.Element {
  return (
    <SkeletonTheme>
      <Grommet theme={grommet} full>
        <App />
      </Grommet>
    </SkeletonTheme>
  );
}

export default hot(Root);
