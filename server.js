const express = require('express')

const app = express()

app.use(express.static('public'))

app.listen(3000, () => {
  console.log('listening on 3000')
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/music_box.html')
  // Note: __dirname is directory that contains the JavaScript source code. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})

app.get('/how', (req, res) => {
  res.sendFile(__dirname + '/howto.html')
  // Note: __dirname is directory that contains the JavaScript source code. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})
