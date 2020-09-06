const https = require('https')

const base = 'mqttcli'

https.get(
  `https://us-central1-${process.env.PROJECT_ID}.cloudfunctions.net/${base}/release/${process.env.CI_COMMIT_SHORT_SHA}/${process.env.WEB_API_KEY}`,
  (resp) => {
    var data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })
    resp.on('end', () => {
      console.log(data)
    })
  }
).on('error', (err) => {
  console.log('Error: ' + err.message)
  throw err
})
