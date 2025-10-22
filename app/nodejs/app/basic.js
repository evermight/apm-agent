const express = require('express')
const app = express()
app.get('/', (req, res) => res.send("hello world"))
app.get('/example1', (req, res) => {
  // bad code generates exception
  res.send(nonDeclaredVariable)
})
app.get('/example2', (req, res) => {
  fetch('https://8.8.8.8')
  .then(r => r.text())
  .then(r => {
    console.log(r)
  })
  res.send('Async request made');
})
app.listen(3030, () => {})
