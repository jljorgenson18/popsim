import 'react-hot-loader'; // Needs to be loaded before react and react-dom
import React from 'react';
import ReactDOM from 'react-dom';

import './Polyfills';

import Root from './components/Root';

ReactDOM.render(<Root />, document.getElementById('app'));
