import React from 'react';

import { render, RenderOptions } from '@testing-library/react';
import { Grommet } from 'grommet';
import { grommet } from 'grommet/themes';

interface AllProviderProps {
  children: React.ReactNode;
}
const AllTheProviders = ({ children }: AllProviderProps): JSX.Element => {
  return (
    <Grommet theme={grommet} full>
      {children}
    </Grommet>
  );
};

const customRender: typeof render = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
