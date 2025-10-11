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
const express = require('express')
const app = express()
const port = 3030
// app
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/error/automatic', (req, res) => {
  // bad code generates error
  res.send(nonDeclaredVariable)
})
app.get('/error/manual/:params1', (req, res) => {
  const msg = 'Manual Error: ' + req.params.params1;
  res.send(msg)
  const err = new Error(msg)
  apm.captureError(err)
})
app.get('/span/:params1', (req, res) => {
  res.send('Testing Span')
  const timeout = 5000;
  const span = apm.startSpan('Testing a span, will wait ' + timeout + 'ms')
  setTimeout(()=>span.end(), timeout);
})
app.get('/context/:params1', (req, res) => {
  res.send('Welcome Demo')
  apm.setCustomContext({'apm': {'alpha': 'beta computer'}})
})
app.get('/transaction-name/:params1', (req, res) => {
  res.send('Transaction Name: ' + req.params.params1)
  apm.setTransactionName('Path: /transaction-name/'+req.params.params1)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
