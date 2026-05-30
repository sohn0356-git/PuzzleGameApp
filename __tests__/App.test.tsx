/**
 * @format
 */

import 'react-native';
import App from '../src/App';

// Note: import explicitly to use the types shipped with jest.
import {expect, it} from '@jest/globals';

it('exports the app component', () => {
  expect(App).toBeDefined();
});
