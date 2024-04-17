const express = require('express');

const {chartGenagator,getData} = require('./ultis');
const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  const data = await getData();
  const base64 = await chartGenagator(data);
  res.send('<img src="' + base64 + '">');
});

app.listen(port, () => {
  console.log(`Example app listening o port ${port}`);
});
