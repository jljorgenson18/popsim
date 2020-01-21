import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const fullData = require('../sampledata/sampledata.json');
const data = fullData['data'];
//console.log(JSON.stringify(data, null, '  '));

const mass = data['mass'];
const number = data['number'];
const length = data['length'];
