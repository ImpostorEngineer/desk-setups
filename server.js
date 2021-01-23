const express = require('express');
const api = require('./app/app');
const app = express();
const path = require('path');

app.use(express.static('public'));
app.use('/', api);
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
