import PouchDB from 'pouchdb';

const isTest = process.env.NODE_ENV === 'test';

const db = new PouchDB('samples', isTest ? { adapter: 'memory' } : {});

export default db;
