const https = require('https')

https.get('https://us-central1-' + process.env.PROJECT_ID + '.cloudfunctions.net/tamuro/release/ui/' + process.env.WEB_API_KEY, (resp) => {
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
