const fs = require('fs')

const version = (new Date()).getTime().toString(21)
const text = 'export default \'' + version + '\'\n'
console.log('Set verison:' + version)
fs.writeFile(__dirname + '/../src/conf/version.js', text, (err) => {
  if (err) throw err;
})
