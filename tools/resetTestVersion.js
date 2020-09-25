const path = require('path')
const fs = require('fs')

fs.writeFileSync(
  path.join(__dirname, '..', 'functions', 'version.js'),
  "module.exports = 'development'\n"
)
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'store', 'version.js'),
  "export default '0000000'\n"
)
