import React from 'react';

import { render, RenderOptions, Queries } from '@testing-library/react';
import { Grommet } from 'grommet';
import { grommet } from 'grommet/themes';
import { MemoryRouter } from 'react-router-dom';
import { deepMerge } from 'grommet/utils';
import theme from 'src/styles/theme';
import MDXProvider from 'src/components/MDXProvider';

interface AllProviderProps {
  children: React.ReactNode;
}
const AllTheProviders = ({ children }: AllProviderProps): JSX.Element => {
  return (
    <MemoryRouter>
      <MDXProvider>
        <Grommet theme={deepMerge(grommet, theme)} full>
          {children}
        </Grommet>
      </MDXProvider>
    </MemoryRouter>
  );
};

function customRender<Q extends Queries>(ui: React.ReactElement, options?: RenderOptions<Q>) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
