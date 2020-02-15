const https = require('https')

const base = 'tamuro'

https.get('https://us-central1-' + process.env.PROJECT_ID + '.cloudfunctions.net/' + base + '/setup/' + process.env.WEB_API_KEY, (resp) => {
  var data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  })
  resp.on('end', () => {
    console.log(data)
  })
}).on("error", (err) => {
  console.log("Error: " + err.message)
  throw err
})
