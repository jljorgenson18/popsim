import React from 'react';
import { render, fireEvent, act, RenderResult } from 'tests/utils';

import App from 'src/components/App';

test('App Renders', async () => {
  let result: RenderResult;

  await act(async () => {
    result = render(<App />);
  });

  expect(result.container.firstChild).toBeTruthy();
});

test('That the new sample modal pops up when hitting the create sample button', async () => {
  let result: RenderResult;

  await act(async () => {
    result = render(<App />);
    fireEvent.click(result.getByText('Create new Sample'));
  });

  expect(result.getByTestId('sampleForm')).toBeTruthy();
});
