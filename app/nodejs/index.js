var apm = require('elastic-apm-node').start({
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: 'node-app-1',
  // Use if APM Server requires a secret token
  secretToken: 'abcd1234',
  serverUrl: 'http://localhost:8200',
  //verifyServerCert: true,
  //environment: 'production'
});
// vars
const express = require('express');
const app = express()
const port = 3030
// app
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/path/:params1', (req, res) => {
  res.send('Path ' + req.params.params1)
  apm.setTransactionName('/path/'+req.params.params1)
})
app.get('/demo', (req, res) => {
  res.send('Welcome Demo')
  apm.setCustomContext({'apm': {'alpha': 'beta computer'}});
})
app.get('/error', (req, res) => {
  const span = apm.startSpan('This is a label')
  res.send('Capture Error!')
  const err = new Error('Trigger Error!')
  apm.captureError(err)
  span.end()
})
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
