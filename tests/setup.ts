import 'src/Polyfills';
import PouchDB from 'pouchdb';
import Adapter from 'pouchdb-adapter-memory';
import { SamplePayload, SampleData } from 'src/db/sample';

PouchDB.plugin(Adapter);

jest.mock('src/math/index', () => {
  const math = require('src/math/math.worker');

  const getSampleData = async (payload: SamplePayload): Promise<SampleData> => {
    return Promise.resolve(math.getSampleData(payload));
  };
  return {
    getSampleData
  };
});

// Mock matchMedia
(window as any).matchMedia =
  window.matchMedia ||
  function () {
    return { matches: false, addListener: function () {}, removeListener: function () {} };
  };
