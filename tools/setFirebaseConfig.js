const fs = require('fs')

const text = `
const firebaseConfig = {
  apiKey: 'API_KEY',
  authDomain: 'AUTH_DOMAIN',
  databaseURL: 'DATABASE_URL',
  projectId: 'PROJECT_ID',
  storageBucket: 'STRAGE_BUCKET',
  messagingSenderId: 'MESSAGEING_SENDER_ID',
  appId: 'APP_ID'
}

export default firebaseConfig
`.replace('API_KEY', process.env.API_KEY)
.replace('AUTH_DOMAIN', process.env.AUTH_DOMAIN)
.replace('DATABASE_URL', process.env.DATABASE_URL)
.replace('PROJECT_ID', process.env.PROJECT_ID)
.replace('STRAGE_BUCKET', process.env.STRAGE_BUCKET)
.replace('MESSAGEING_SENDER_ID', process.env.MESSAGEING_SENDER_ID)
.replace('APP_ID', process.env.APP_ID)

fs.writeFile('src/conf/firebaset.js', text, (err) => {
  if (err) throw err;
})
