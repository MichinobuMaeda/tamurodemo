const fs = require('fs')

const version = (new Date()).getTime().toString(21)
const text = 'export default \'1kcakf623i\'\n'
fs.writeFile('src/conf/version.js', text, (err) => {
  if (err) throw err;
  console.log('Set verison:' +version)
})
