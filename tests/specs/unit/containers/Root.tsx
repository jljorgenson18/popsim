import React from 'react';
import { render } from '@testing-library/react';

import Root from 'src/components/Root';

test('That Root renders', () => {
  const { container } = render(<Root />);

  expect(container.firstChild).toBeTruthy();
});
