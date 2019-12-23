import 'src/Polyfills';
import PouchDB from 'pouchdb';
import Adapter from 'pouchdb-adapter-memory';
PouchDB.plugin(Adapter);
