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
  //sendMetaData('Span ' + req.params.params1)
  setTimeout(()=>span.end(), timeout);
})
app.get('/metadata/:params1', (req, res) => {
  res.send('Metadata: ' + req.params.params1)
  sendMetaData(req.params.params1)
})
app.get('/transaction-name/:params1', (req, res) => {
  res.send('Transaction Name: ' + req.params.params1)
  apm.setTransactionName('Path: /transaction-name/'+req.params.params1)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

const sendMetaData = msg => {
  apm.setLabel('MyLabel', msg, false)
  apm.setUserContext({'id': msg, 'username': msg, 'email': msg + '@' + msg + '.com'})
  apm.setCustomContext({'MyObject': {'MyCustomContextMessage': msg}})
}
