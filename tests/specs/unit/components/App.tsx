import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import App from 'src/components/App';

test('App Renders', () => {
  const { container } = render(<App />);

  expect(container.firstChild).toBeTruthy();
});

test('That the new sample modal pops up when hitting the create sample button', async () => {
  const { getByText, getByTestId } = render(<App />);

  await act(async () => {
    fireEvent.click(getByText('Create new Sample'));
  });

  expect(getByTestId('sampleForm')).toBeTruthy();
});
