require('dotenv').config();

var apm = require('elastic-apm-node').start({
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
  // Use if APM Server requires a secret token
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  //verifyServerCert: true,
  environment: process.env.ELASTIC_APM_ENVIRONMENT
});
const express = require('express')
const app = express()
app.get('/', (req, res) => res.send("hello world"))
app.get('/example1', (req, res) => {
  // bad code generates exception
  res.send(nonDeclaredVariable)
})
app.get('/example2', (req, res) => {
  const span = apm.startSpan('Measure Fetch')
  fetch('https://8.8.8.8')
  .then(r => r.text())
  .then(r => {
    console.log(r)
    span.end()
  })
  res.send('Async request made');
})
app.listen(3030, () => {})

